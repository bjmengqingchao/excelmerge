
import React, { useState, useCallback, useRef, useMemo } from 'react';
import Header from './components/Header';
import FileCard from './components/FileCard';
import { ExcelFile, MergedResult } from './types';
import { parseExcelFile, mergeFiles, downloadExcel } from './services/excelService';

const App: React.FC = () => {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [mergedResult, setMergedResult] = useState<MergedResult | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const rawFilesMap = useRef<Map<string, File>>(new Map());

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    setError(null);
    const newFilePromises = Array.from(selectedFiles).map(async (f: File) => {
      try {
        const parsed = await parseExcelFile(f);
        rawFilesMap.current.set(parsed.id, f);
        return parsed;
      } catch (err) {
        console.error("解析文件错误:", f.name, err);
        return null;
      }
    });

    const parsedFiles = (await Promise.all(newFilePromises)).filter((f): f is ExcelFile => f !== null);
    setFiles(prev => [...prev, ...parsedFiles]);
    event.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    rawFilesMap.current.delete(id);
    if (files.length <= 1) setMergedResult(null);
  };

  const updateFileConfig = (updated: ExcelFile) => {
    setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const handleMerge = async () => {
    if (files.length === 0) return;
    setIsMerging(true);
    setError(null);
    try {
      const result = await mergeFiles(files, rawFilesMap.current);
      if (result.data.length === 0) {
        setError("合并结果为空，请检查各工作表的数据起始行设置。");
      } else {
        setMergedResult(result);
      }
    } catch (err) {
      setError("合并失败，请确保各表结构基本一致且行号配置正确。");
      console.error(err);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedResult) return;
    const now = new Date();
    const timeStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    downloadExcel(mergedResult.headers, mergedResult.data, `合并报告_${timeStr}`);
  };

  const selectedSheets = useMemo(() => {
    return files.flatMap(f => 
      f.sheets.filter(s => s.enabled).map(s => ({
        fileName: f.name,
        sheetName: s.name,
        id: `${f.id}-${s.name}`
      }))
    );
  }, [files]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-grow max-w-[1600px] mx-auto px-6 lg:px-12 py-8 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* 左侧：核心配置区 (col-span-9 -> col-span-10 为了更宽的横向排版) */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* 紧凑型上传区域 */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm p-4 relative flex items-center gap-6 group hover:border-indigo-400 hover:bg-indigo-50/20 transition-all overflow-hidden h-[100px]">
              <input 
                type="file" 
                multiple 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-grow min-w-0">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">添加数据源 (Excel / CSV)</h2>
                <p className="text-xs text-slate-400 font-medium italic mt-0.5">点击此处或直接拖拽文件到这里</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 pr-4 border-l border-slate-100 pl-6">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">已加载文件</p>
                   <p className="text-xl font-black text-indigo-600 mt-1">{files.length}</p>
                </div>
                <div className="text-right ml-4">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">总 Sheet 数</p>
                   <p className="text-xl font-black text-slate-800 mt-1">{files.reduce((acc, f) => acc + f.sheets.length, 0)}</p>
                </div>
              </div>
            </div>

            {/* 文件列表 (单列布局以利用宽度) */}
            {files.length > 0 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {files.map(file => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    onUpdateFile={updateFileConfig}
                    onRemove={() => removeFile(file.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 border-dashed opacity-50 select-none">
                <div className="bg-slate-50 p-6 rounded-3xl mb-4 border border-slate-100 shadow-inner">
                  <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-slate-400">准备就绪</h3>
                <p className="text-sm text-slate-300 font-medium max-w-xs text-center mt-2">上传表格后，您可以在此精确配置合并规则</p>
              </div>
            )}
          </div>

          {/* 右侧：操作区 */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            
            {/* 导出任务控制面板 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">任务摘要</h3>
                <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                   <div className="w-2 h-2 rounded-full bg-indigo-300"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">待合并清单 ({selectedSheets.length})</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-slate-50 rounded-2xl p-3 border border-slate-100/50 space-y-2">
                    {selectedSheets.length > 0 ? (
                      selectedSheets.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-slate-700 truncate">{item.sheetName}</span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
                            {item.fileName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-[10px] text-slate-300 font-bold italic leading-relaxed">请勾选需要合并的<br/>工作表</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button 
                    onClick={handleMerge}
                    disabled={files.length === 0 || isMerging || selectedSheets.length === 0}
                    className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {isMerging ? (
                      <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    )}
                    {isMerging ? '处理中...' : '生成合并工作簿'}
                  </button>

                  {mergedResult && (
                    <button 
                      onClick={handleDownload}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 animate-in bounce-in duration-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      保存至本地
                    </button>
                  )}
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 采样预览 */}
            {mergedResult && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-5 space-y-4 max-h-[350px] flex flex-col animate-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">采样抽检</h3>
                  <span className="text-[10px] text-slate-600 font-bold">{mergedResult.data.length} 条</span>
                </div>
                <div className="flex-grow overflow-auto border border-slate-800 rounded-2xl bg-black custom-scrollbar-dark">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-slate-800">
                      <tr>
                        {mergedResult.headers.slice(0, 2).map((h, i) => (
                          <th key={i} className="px-3 py-2 text-left text-slate-400 font-black text-[9px] border-r border-slate-700 last:border-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mergedResult.data.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-slate-800">
                          {mergedResult.headers.slice(0, 2).map((_, j) => (
                            <td key={j} className="px-3 py-1.5 text-slate-500 text-[10px] truncate max-w-[80px]">{String(row[j] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="text-[11px] text-slate-300 font-black tracking-[0.2em] uppercase italic">Professional Excel Merge Logic</p>
          <p className="text-[10px] text-slate-200 font-bold italic">优化了横向布局，适配超宽表格配置</p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
