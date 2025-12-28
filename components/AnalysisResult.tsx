
import React, { useState } from 'react';
import { SafetyAnalysis, PPEItem } from '../types';

interface Props {
  analysis: SafetyAnalysis;
  image: string | null;
}

const AnalysisResult: React.FC<Props> = ({ analysis, image }) => {
  const [selectedPPEIndex, setSelectedPPEIndex] = useState<number | null>(null);
  const now = new Date().toLocaleString('pt-BR');
  const reportId = Math.random().toString(36).substring(7).toUpperCase();

  const getVerdictDetails = () => {
    switch (analysis.finalVerdict) {
      case 'approved': return { label: 'APROVADO', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-600' };
      case 'restricted': return { label: 'RESTRIÇÃO', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-600' };
      case 'critical': return { label: 'INTERDITADO', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-600' };
      default: return { label: 'EM ANÁLISE', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-600' };
    }
  };

  const verdict = getVerdictDetails();

  const renderMarkers = (isPdf = false) => {
    if (!analysis.identifiedPPE) return null;
    return analysis.identifiedPPE.map((item, idx) => {
      if (!item.location || item.location.length !== 4) return null;
      const [ymin, xmin, ymax, xmax] = item.location;
      const top = ymin / 10;
      const left = xmin / 10;
      const width = (xmax - xmin) / 10;
      const height = (ymax - ymin) / 10;
      
      const statusColor = item.status === 'present' ? 'border-green-600 bg-green-600/10' : 
                          item.status === 'missing' ? 'border-red-600 bg-red-600/10' : 'border-amber-600 bg-amber-600/10';

      return (
        <div 
          key={idx} 
          className="absolute z-10"
          style={{ 
            top: `${top}%`, 
            left: `${left}%`, 
            width: `${width}%`, 
            height: `${height}%`,
            pointerEvents: isPdf ? 'none' : 'auto'
          }}
          onClick={() => !isPdf && setSelectedPPEIndex(idx)}
        >
          <div className={`w-full h-full border-2 rounded-sm shadow-sm ${statusColor}`} />
          {isPdf && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-1 py-0.5 rounded text-[6px] font-bold uppercase whitespace-nowrap">
              {item.name}
            </div>
          )}
        </div>
      );
    });
  };

  if (!analysis.workerDetected) {
    return (
      <div className="bg-red-900/20 border-2 border-red-500/50 p-6 rounded-2xl text-center no-print mt-4">
        <h3 className="text-red-400 font-black text-lg uppercase tracking-tighter">Falha na Identificação</h3>
        <p className="text-red-300 text-xs mt-1">Colaborador não detectado na zona de inspeção.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* UI INTERATIVA */}
      <div className="no-print space-y-4">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950">
          <div className="relative aspect-[4/5] flex items-center justify-center bg-slate-900">
            {image && <img src={image} className="max-w-full max-h-full object-contain opacity-80" alt="Inspeção" />}
            {renderMarkers(false)}
          </div>
          <div className={`p-4 flex justify-between items-center ${verdict.bg} border-t-2 ${verdict.border}`}>
             <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Parecer Técnico</span>
                <p className={`text-xl font-black ${verdict.color}`}>{verdict.label}</p>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Conformidade</span>
                <p className={`text-2xl font-black ${verdict.color}`}>{analysis.complianceScore}%</p>
             </div>
          </div>
        </div>

        {selectedPPEIndex !== null && (
          <div className="bg-slate-800 p-4 rounded-2xl border border-amber-500 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-2">
               <h4 className="text-amber-500 font-black text-xs uppercase">{analysis.identifiedPPE[selectedPPEIndex].name}</h4>
               <button onClick={() => setSelectedPPEIndex(null)} className="text-slate-400">Fechar</button>
            </div>
            <p className="text-white text-xs italic">{analysis.identifiedPPE[selectedPPEIndex].observation}</p>
          </div>
        )}
      </div>

      {/* LAUDO ABNT (ESCONDIDO DA UI) */}
      <div style={{ position: 'absolute', left: '-10000px', top: '0', pointerEvents: 'none' }}>
        <div 
          id="pdf-report" 
          className="bg-white text-slate-900 shadow-none"
          style={{ 
            width: '210mm', 
            minHeight: '297mm',
            paddingTop: '30mm',    // Margem Superior: 3cm
            paddingLeft: '30mm',   // Margem Esquerda: 3cm
            paddingRight: '20mm',  // Margem Direita: 2cm
            paddingBottom: '20mm', // Margem Inferior: 2cm
            fontFamily: "'Inter', sans-serif",
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* CABEÇALHO */}
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-2 mb-8">
             <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-1.5 rounded text-white font-black text-lg">SS</div>
                <div>
                   <h1 className="text-base font-black uppercase tracking-tight m-0">SafeScan Pro Intelligence</h1>
                   <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Inspeção de Segurança e Saúde no Trabalho</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[8px] font-black uppercase text-slate-400 m-0">Protocolo Doc.</p>
                <p className="text-xs font-mono font-bold text-slate-900 m-0">#{reportId}</p>
                <p className="text-[8px] font-bold text-slate-500 m-0">{now}</p>
             </div>
          </div>

          <div className="text-center mb-8">
             <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-1 border-b border-slate-200 inline-block pb-1">Laudo de Auditoria de EPI</h2>
             <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">Em conformidade com a Norma Regulamentadora NR-01 e NR-06</p>
          </div>

          {/* DADOS GERAIS */}
          <div className="grid grid-cols-4 gap-4 mb-6 break-inside-avoid">
             <div className="col-span-3 bg-slate-50 border border-slate-200 p-3 rounded-sm">
                <h3 className="text-[7px] font-black uppercase text-slate-400 mb-1">Objeto da Inspeção / Local</h3>
                <p className="text-xs font-bold text-slate-900 uppercase leading-tight">{analysis.jobContext}</p>
             </div>
             <div className={`p-3 border rounded-sm text-center flex flex-col justify-center ${verdict.bg} ${verdict.border}`}>
                <h3 className="text-[7px] font-black uppercase opacity-60 mb-0.5">Veredito</h3>
                <p className={`text-[10px] font-black m-0 leading-none ${verdict.color} uppercase`}>{verdict.label}</p>
             </div>
          </div>

          {/* EVIDÊNCIA VISUAL */}
          <div className="mb-8 break-inside-avoid">
             <h3 className="text-[9px] font-black uppercase text-slate-900 mb-3 tracking-widest">01. Registro Fotográfico e Digitalização de Campo</h3>
             <div className="relative border border-slate-300 p-1 bg-white">
                <div className="relative flex items-center justify-center bg-slate-50" style={{ height: '80mm' }}>
                  {image && <img src={image} className="max-w-full max-h-full object-contain" alt="Evidência" />}
                  {renderMarkers(true)}
                </div>
                <div className="bg-slate-100 text-slate-700 py-2 px-4 flex justify-between items-center mt-1 border border-slate-200">
                   <p className="text-[7px] font-bold uppercase m-0 tracking-widest">Digitalização via Visão Computacional Gemini-3-Flash</p>
                   <p className="text-[7px] font-mono font-bold m-0">Acurácia: {analysis.complianceScore}%</p>
                </div>
             </div>
          </div>

          {/* TABELA DE ATIVOS */}
          <div className="mb-8 break-inside-avoid">
             <h3 className="text-[9px] font-black uppercase text-slate-900 mb-3 tracking-widest">02. Quadro de Verificação de Conformidade (EPIs)</h3>
             <div className="border border-slate-300 rounded-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-300">
                    <tr>
                      <th className="p-2 text-[8px] font-black uppercase tracking-wider w-1/4">Equipamento</th>
                      <th className="p-2 text-center text-[8px] font-black uppercase tracking-wider w-1/6 border-l border-slate-300">Situação</th>
                      <th className="p-2 text-[8px] font-black uppercase tracking-wider w-7/12 border-l border-slate-300">Observações Técnicas / NRs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.identifiedPPE.map((item, i) => (
                      <tr key={i} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="p-2 text-[8px] font-bold text-slate-800 uppercase">{item.name}</td>
                        <td className="p-2 text-center border-l border-slate-200">
                           <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-sm ${
                             item.status === 'present' ? 'bg-green-100 text-green-700' : 
                             item.status === 'missing' ? 'bg-red-100 text-red-700' : 
                             'bg-amber-100 text-amber-700'
                           }`}>
                             {item.status === 'present' ? 'CONFORME' : item.status === 'missing' ? 'AUSENTE' : 'IRREGULAR'}
                           </span>
                        </td>
                        <td className="p-2 text-[8px] text-slate-600 leading-tight border-l border-slate-200 italic">
                          {item.observation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          {/* BASE LEGAL E AÇÕES */}
          <div className="grid grid-cols-2 gap-8 mb-auto break-inside-avoid">
             <div>
                <h3 className="text-[8px] font-black uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2">03. Fundamentação Legal</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                   {analysis.relevantNRs.map((nr, i) => (
                      <span key={i} className="bg-slate-700 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-sm">{nr}</span>
                   ))}
                </div>
                <p className="text-[8px] text-slate-500 leading-relaxed text-justify m-0">
                   Este laudo foi gerado eletronicamente e certifica o estado de conservação e uso dos equipamentos no ato da digitalização. Baseado na NR-06, o empregador deve fornecer gratuitamente EPIs adequados ao risco.
                </p>
             </div>
             <div>
                <h3 className="text-[8px] font-black uppercase text-slate-900 border-b border-slate-300 pb-1 mb-2">04. Recomendações Críticas</h3>
                <ul className="m-0 p-0 pl-3 space-y-1">
                   {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-[8px] text-slate-700 font-bold leading-tight">
                        {rec}
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* ASSINATURAS */}
          <div className="mt-12 pt-4 border-t border-slate-100 grid grid-cols-2 gap-16 break-inside-avoid">
             <div className="text-center">
                <div className="border-b border-slate-400 mb-1 h-10 flex items-end justify-center">
                   <p className="text-[7px] text-slate-300 italic mb-1 uppercase tracking-widest">Validado Eletronicamente</p>
                </div>
                <p className="text-[9px] font-black uppercase text-slate-900 m-0">Responsável Técnico</p>
                <p className="text-[7px] text-slate-400 m-0">Engenharia de Segurança do Trabalho</p>
             </div>
             <div className="text-center">
                <div className="border-b border-slate-400 mb-1 h-10"></div>
                <p className="text-[9px] font-black uppercase text-slate-900 m-0">Colaborador Ciente</p>
                <p className="text-[7px] text-slate-400 m-0">Confirmação de Recebimento de Auditoria</p>
             </div>
          </div>

          {/* RODAPÉ */}
          <div className="mt-8 flex justify-between items-center text-[6px] font-black text-slate-300 uppercase tracking-[0.4em]">
             <span>SafeScan Intelligence - Documento Controlado</span>
             <span className="bg-slate-50 px-3 py-1 rounded-full text-slate-400">Página 1 de 1</span>
             <span>Ref: {reportId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
