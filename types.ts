
export interface SheetConfig {
  name: string;
  enabled: boolean;
  headerRow: number;
  dataStartRow: number;
  previewData: any[][];
}

export interface ExcelFile {
  id: string;
  name: string;
  lastModified: number;
  size: number;
  sheets: SheetConfig[];
}

export interface MergedResult {
  headers: string[];
  data: any[][];
}
