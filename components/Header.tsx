
import React from 'react';

interface Props {
  view: 'main' | 'history';
  onToggleView: () => void;
  hasHistory: boolean;
}

const Header: React.FC<Props> = ({ view, onToggleView, hasHistory }) => {
  return (
    <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg border-b-4 border-amber-500 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter leading-none">SafeScan Pro</h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Safety Intelligence Hub</p>
        </div>
      </div>

      <button 
        onClick={onToggleView}
        className={`p-2 rounded-xl transition-all flex items-center gap-2 border ${
          view === 'history' 
          ? 'bg-amber-500 border-amber-400 text-slate-900' 
          : 'bg-slate-800 border-slate-700 text-amber-500'
        }`}
      >
        {view === 'main' ? (
          <>
            <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Arquivos</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {hasHistory && <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
          </>
        ) : (
          <>
            <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Câmera</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </>
        )}
      </button>
    </header>
  );
};

export default Header;
