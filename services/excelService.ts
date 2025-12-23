
import * as XLSX from 'xlsx';
import { ExcelFile, SheetConfig, MergedResult } from '../types';

/**
 * 判断一行是否为空行
 */
const isEmptyRow = (row: any[]): boolean => {
  if (!row || row.length === 0) return true;
  return row.every(cell => cell === null || cell === undefined || String(cell).trim() === '');
};

export const parseExcelFile = async (file: File): Promise<ExcelFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: SheetConfig[] = workbook.SheetNames.map(name => {
          const sheet = workbook.Sheets[name];
          const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as any[][];
          
          return {
            name,
            enabled: true,
            headerRow: 1, 
            dataStartRow: 2, 
            previewData: rawData.slice(0, 10) 
          };
        });

        resolve({
          id: crypto.randomUUID(),
          name: file.name,
          lastModified: file.lastModified,
          size: file.size,
          sheets
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const mergeFiles = async (files: ExcelFile[], rawFilesMap: Map<string, File>): Promise<MergedResult> => {
  const allData: any[][] = [];
  let commonHeaders: string[] = [];

  for (const fileConfig of files) {
    const rawFile = rawFilesMap.get(fileConfig.id);
    if (!rawFile) continue;

    const data = await rawFile.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    for (const sheetConfig of fileConfig.sheets) {
      if (!sheetConfig.enabled) continue;

      const worksheet = workbook.Sheets[sheetConfig.name];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null }) as any[][];
      
      const headerIdx = sheetConfig.headerRow - 1;
      const dataStartIdx = sheetConfig.dataStartRow - 1;

      if (headerIdx < 0 || headerIdx >= rows.length) continue;

      const headers = rows[headerIdx].map(h => String(h || '').trim());
      
      if (commonHeaders.length === 0) {
        commonHeaders = headers;
      }

      // 提取并清洗数据
      const dataRows = rows.slice(dataStartIdx);
      dataRows.forEach(row => {
        // 只有非空行才加入结果集
        if (!isEmptyRow(row)) {
          allData.push(row);
        }
      });
    }
  }

  return {
    headers: commonHeaders,
    data: allData
  };
};

export const downloadExcel = (headers: string[], data: any[][], filename: string) => {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "MergedResults");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
