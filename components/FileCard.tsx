
import React from 'react';
import { ExcelFile, SheetConfig } from '../types';

interface FileCardProps {
  file: ExcelFile;
  onUpdateFile: (updated: ExcelFile) => void;
  onRemove: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onUpdateFile, onRemove }) => {
  const toggleSheet = (sheetName: string) => {
    const updatedSheets = file.sheets.map(s => 
      s.name === sheetName ? { ...s, enabled: !s.enabled } : s
    );
    onUpdateFile({ ...file, sheets: updatedSheets });
  };

  const updateSheetConfig = (sheetName: string, key: keyof SheetConfig, value: number) => {
    const updatedSheets = file.sheets.map(s => 
      s.name === sheetName ? { ...s, [key]: value } : s
    );
    onUpdateFile({ ...file, sheets: updatedSheets });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ring-1 ring-slate-100 mb-6">
      {/* 文件标题栏：更加紧凑且高级 */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.5,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V7.5L14.5,2M13,3.5L18.5,9H13V3.5M6,20V4H12V10H18V20H6Z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-800 truncate">{file.name}</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
              {(file.size / 1024).toFixed(1)} KB • 共 {file.sheets.length} 个工作表
            </p>
          </div>
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* 工作表配置列表：横向排版 */}
      <div className="p-2">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-4 py-2 text-left font-black w-12">启用</th>
              <th className="px-4 py-2 text-left font-black">工作表名称</th>
              <th className="px-4 py-2 text-left font-black w-32">表头行号</th>
              <th className="px-4 py-2 text-left font-black w-32">数据起始行</th>
              <th className="px-4 py-2 text-left font-black w-48">预览 (首行数据)</th>
            </tr>
          </thead>
          <tbody>
            {file.sheets.map((sheet, idx) => (
              <tr 
                key={idx} 
                className={`group transition-all ${sheet.enabled ? 'bg-white' : 'bg-slate-50/50 opacity-40 hover:opacity-60'}`}
              >
                {/* 选择框 */}
                <td className="px-4 py-3 first:rounded-l-xl border-y border-l border-transparent group-hover:border-slate-100 transition-colors">
                  <label className="relative flex items-center justify-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sheet.enabled} 
                      onChange={() => toggleSheet(sheet.name)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${sheet.enabled ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100' : 'bg-white border-slate-200'}`}>
                      {sheet.enabled && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </label>
                </td>

                {/* 名称 */}
                <td className="px-4 py-3 border-y border-transparent group-hover:border-slate-100 transition-colors">
                  <span className={`text-sm font-bold truncate block max-w-[200px] ${sheet.enabled ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                    {sheet.name}
                  </span>
                </td>

                {/* 表头行输入 */}
                <td className="px-4 py-3 border-y border-transparent group-hover:border-slate-100 transition-colors">
                  <div className="relative">
                    <input 
                      type="number" 
                      disabled={!sheet.enabled}
                      min="1"
                      value={sheet.headerRow}
                      onChange={(e) => updateSheetConfig(sheet.name, 'headerRow', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-100 text-xs font-bold rounded-lg px-3 py-1.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:cursor-not-allowed"
                    />
                  </div>
                </td>

                {/* 起始行输入 */}
                <td className="px-4 py-3 border-y border-transparent group-hover:border-slate-100 transition-colors">
                   <div className="relative">
                    <input 
                      type="number" 
                      disabled={!sheet.enabled}
                      min="1"
                      value={sheet.dataStartRow}
                      onChange={(e) => updateSheetConfig(sheet.name, 'dataStartRow', Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-100 text-xs font-bold rounded-lg px-3 py-1.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:cursor-not-allowed"
                    />
                  </div>
                </td>

                {/* 紧凑预览区 */}
                <td className="px-4 py-3 last:rounded-r-xl border-y border-r border-transparent group-hover:border-slate-100 transition-colors">
                  {sheet.enabled ? (
                    <div className="flex gap-2 overflow-hidden max-w-[250px] bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      {sheet.previewData[sheet.dataStartRow - 1]?.slice(0, 3).map((cell, j) => (
                        <div key={j} className="flex-1 min-w-0 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                          <p className="text-[8px] text-slate-300 font-black truncate uppercase leading-none mb-1">
                            {String(sheet.previewData[sheet.headerRow - 1]?.[j] || 'COL')}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate font-medium leading-none">
                            {String(cell || '-')}
                          </p>
                        </div>
                      ))}
                      {(!sheet.previewData[sheet.dataStartRow - 1] || sheet.previewData[sheet.dataStartRow - 1].length === 0) && (
                        <span className="text-[10px] text-slate-300 italic px-2">暂无预览数据</span>
                      )}
                    </div>
                  ) : (
                    <div className="h-8 flex items-center px-4">
                      <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileCard;
