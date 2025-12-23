
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-sm shadow-indigo-200">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">智能 Excel 合并工具</h1>
            <p className="text-xs text-slate-500 font-medium">多表合一 · 智能清洗 · 批量处理</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-slate-600 hover:text-indigo-600 font-medium transition-colors">使用说明</a>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
            版本 v1.0.0
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
