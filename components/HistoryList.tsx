
import React from 'react';
import { InspectionRecord } from '../types';

interface Props {
  records: InspectionRecord[];
  onSelect: (record: InspectionRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const HistoryList: React.FC<Props> = ({ records, onSelect, onDelete, onClear }) => {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="bg-slate-800 p-6 rounded-full mb-4">
          <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-slate-300 font-bold uppercase tracking-widest text-sm">Arquivo Vazio</h3>
        <p className="text-slate-500 text-xs mt-2 max-w-[200px]">As auditorias realizadas aparecerão aqui para consulta futura.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-amber-500 font-black uppercase text-[10px] tracking-[0.2em]">Log de Auditoria ({records.length})</h3>
        <button onClick={onClear} className="text-red-400 text-[10px] font-bold uppercase hover:underline">Limpar Tudo</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {records.map((record) => (
          <div 
            key={record.id}
            className="group bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:border-amber-500/50 transition-all flex h-28 cursor-pointer active:scale-95"
            onClick={() => onSelect(record)}
          >
            {/* Thumbnail */}
            <div className="w-24 h-full relative flex-shrink-0 bg-black">
              <img src={record.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Thumb" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-800" />
            </div>

            {/* Content */}
            <div className="flex-grow p-3 flex flex-col justify-between min-w-0">
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-black text-amber-500 uppercase truncate leading-none mb-1">{record.jobType}</p>
                  <p className="text-[9px] font-mono text-slate-500 uppercase">{record.timestamp}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-black ${
                  record.analysis.complianceScore >= 90 ? 'bg-green-500/10 text-green-500' :
                  record.analysis.complianceScore >= 70 ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {record.analysis.complianceScore}%
                </div>
              </div>

              <div className="flex justify-between items-end">
                <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[150px]">
                   {record.analysis.identifiedPPE.length} itens analisados
                </p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                  className="p-1 text-slate-600 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2"/></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
