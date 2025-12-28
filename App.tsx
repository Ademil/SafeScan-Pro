
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import WorkSelector from './components/WorkSelector';
import AnalysisResult from './components/AnalysisResult';
import HistoryList from './components/HistoryList';
import { JobType, AppState, InspectionRecord, SafetyAnalysis } from './types';
import { analyzeSafety } from './services/geminiService';

declare global {
  interface Window {
    html2pdf: any;
  }
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('safescan_history');
    return {
      currentImage: null,
      selectedJob: JobType.CONSTRUCTION,
      isAnalyzing: false,
      result: null,
      error: null,
      view: 'main',
      history: saved ? JSON.parse(saved) : [],
    };
  });

  const [scanMessage, setScanMessage] = useState("");
  const messages = [
    "Digitalizando Ambiente...",
    "Localizando Trabalhador...",
    "Consultando NR-06...",
    "Avaliando Integridade...",
    "Gerando Parecer Técnico..."
  ];

  useEffect(() => {
    localStorage.setItem('safescan_history', JSON.stringify(state.history));
  }, [state.history]);

  useEffect(() => {
    let interval: any;
    if (state.isAnalyzing) {
      let i = 0;
      setScanMessage(messages[0]);
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setScanMessage(messages[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [state.isAnalyzing]);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ 
          ...prev, 
          currentImage: reader.result as string,
          result: null,
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!state.currentImage) return;
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    try {
      const result = await analyzeSafety(state.currentImage, state.selectedJob);
      
      const newRecord: InspectionRecord = {
        id: Math.random().toString(36).substring(7).toUpperCase(),
        timestamp: new Date().toLocaleString('pt-BR'),
        image: state.currentImage,
        analysis: result,
        jobType: state.selectedJob,
      };

      setState(prev => ({ 
        ...prev, 
        result, 
        isAnalyzing: false,
        history: [newRecord, ...prev.history].slice(0, 50)
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('pdf-report');
    if (!element) {
      alert("Elemento do laudo não encontrado.");
      return;
    }

    const btn = document.getElementById('export-btn');
    const originalText = btn?.innerHTML || "Exportar Laudo";
    
    if (btn) {
      btn.innerHTML = `<span class="flex items-center gap-2 justify-center"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Compilando ABNT...</span>`;
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';
    }

    const reportName = state.result?.jobContext.substring(0, 12).replace(/\s/g, '_').toUpperCase() || 'DOCUMENTO';

    const opt = {
      margin: 0,
      filename: `LAUDO_TECNICO_${reportName}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        width: 793.7, // 210mm a 96dpi (Largura perfeita A4)
        windowWidth: 793.7,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    setTimeout(() => {
      window.html2pdf().set(opt).from(element).save()
        .then(() => {
          if (btn) {
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'all';
          }
        })
        .catch((err: any) => {
          console.error("PDF Export Error:", err);
          alert("Erro ao gerar PDF.");
          if (btn) {
            btn.innerHTML = originalText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'all';
          }
        });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-slate-900 shadow-2xl relative">
      <div className="no-print">
        <Header 
          view={state.view} 
          onToggleView={() => setState(prev => ({ ...prev, view: prev.view === 'main' ? 'history' : 'main' }))} 
          hasHistory={state.history.length > 0}
        />
      </div>

      <main className="flex-grow p-4 space-y-6 pb-32 no-print">
        {state.view === 'history' ? (
          <HistoryList 
            records={state.history} 
            onSelect={(rec) => setState(prev => ({ ...prev, view: 'main', currentImage: rec.image, result: rec.analysis, selectedJob: rec.jobType }))} 
            onDelete={(id) => setState(prev => ({ ...prev, history: prev.history.filter(h => h.id !== id) }))} 
            onClear={() => confirm("Apagar histórico de auditorias?") && setState(prev => ({ ...prev, history: [] }))}
          />
        ) : (
          <>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-inner">
              <WorkSelector 
                value={state.selectedJob} 
                onChange={(val) => setState(prev => ({ ...prev, selectedJob: val }))}
                disabled={state.isAnalyzing}
              />
            </div>

            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
              {!state.currentImage ? (
                <div 
                  onClick={() => document.getElementById('camera-input')?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-xl aspect-video flex flex-col items-center justify-center bg-slate-900 hover:border-amber-500 transition-all cursor-pointer group"
                >
                  <div className="bg-slate-800 p-4 rounded-full mb-3 group-hover:bg-amber-500 transition-colors">
                    <svg className="w-8 h-8 text-slate-500 group-hover:text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Iniciar Inspeção de EPI</p>
                  <input id="camera-input" type="file" onChange={handleCapture} accept="image/*" capture="environment" className="hidden" />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black border-2 border-slate-700">
                  <img 
                    src={state.currentImage} 
                    className={`w-full aspect-video object-cover transition-all duration-700 ${state.isAnalyzing ? 'opacity-40 grayscale blur-sm scale-110' : 'scale-100'}`} 
                    alt="Preview" 
                  />
                  {state.isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-full h-1 bg-amber-400 shadow-[0_0_20px_#fbbf24] scanning-line" />
                      <div className="mt-4 px-4 py-2 bg-slate-900/90 border border-amber-500/30 rounded-full flex items-center gap-3 backdrop-blur-sm">
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                        <p className="text-amber-500 font-mono text-[10px] font-black uppercase tracking-tighter">
                          {scanMessage}
                        </p>
                      </div>
                    </div>
                  )}
                  {!state.isAnalyzing && !state.result && (
                    <button 
                      onClick={() => setState(prev => ({...prev, currentImage: null}))} 
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full shadow-lg active:scale-90 transition-all backdrop-blur-md"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /></svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {state.error && (
              <div className="bg-red-900/40 text-red-400 p-4 rounded-xl text-[10px] font-black border border-red-500/50 uppercase flex items-center gap-3 animate-in slide-in-from-bottom-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {state.error}
              </div>
            )}
            
            {state.result && (
              <div className="animate-in slide-in-from-bottom-6">
                <AnalysisResult analysis={state.result} image={state.currentImage} />
              </div>
            )}
          </>
        )}
      </main>

      {state.view === 'main' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-4 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 z-[100] no-print pb-safe">
          <div className="flex gap-3">
            {!state.result ? (
              <button
                onClick={runAnalysis}
                disabled={!state.currentImage || state.isAnalyzing}
                className={`flex-grow h-14 rounded-2xl font-black uppercase text-xs shadow-xl transition-all flex items-center justify-center gap-3 ${
                  !state.currentImage || state.isAnalyzing 
                  ? 'bg-slate-800 text-slate-600 border border-slate-700' 
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95'
                }`}
              >
                {state.isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Auditoria em Curso...
                  </>
                ) : "Processar Conformidade"}
              </button>
            ) : (
              <>
                <button
                  id="export-btn"
                  onClick={handleExportPDF}
                  className="flex-grow h-14 bg-amber-500 text-slate-950 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2"/></svg>
                  Exportar Laudo ABNT
                </button>
                <button 
                  onClick={() => setState(prev => ({ ...prev, result: null, currentImage: null }))} 
                  className="w-14 h-14 bg-slate-800 text-amber-500 rounded-2xl flex items-center justify-center border border-slate-700 active:scale-95 transition-all shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" /></svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
