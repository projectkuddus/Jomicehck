
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisReport from './components/AnalysisReport';
import LoadingState from './components/LoadingState';
import PaymentModal from './components/PaymentModal';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Support from './components/Support';
import ChatInterface from './components/ChatInterface'; 
import HistorySidebar from './components/HistorySidebar'; // New Component

import { analyzeDocuments } from './services/geminiService';
import { FileWithPreview, AnalysisState, HistoryItem } from './types';
import { 
  ArrowRight, 
  RefreshCcw, 
  Shield,
  Clock,
  FileSearch,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Zap,
  MessageSquareText,
  FileText
} from 'lucide-react';

type PageView = 'home' | 'how-it-works' | 'pricing' | 'support';
type ResultTab = 'report' | 'chat';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('report');
  
  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    isStreaming: false,
    result: null,
    error: null,
  });

  // Load History on Mount
  useEffect(() => {
    const saved = localStorage.getItem('jomi_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Safe Save Logic (LRU Policy)
  const saveToHistory = (result: any) => {
    try {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        result: result
      };
      
      // Keep only last 50 items to prevent storage overflow
      let updated = [newItem, ...history];
      if (updated.length > 50) {
        updated = updated.slice(0, 50);
      }

      setHistory(updated);
      localStorage.setItem('jomi_history', JSON.stringify(updated));
    } catch (error) {
      console.warn("Storage quota exceeded. Removing oldest items...");
      // Fallback: If quota exceeded, aggressively slice and try again
      try {
        const minimalHistory = [
          {
            id: Date.now().toString(),
            timestamp: Date.now(),
            result: result
          },
          ...history.slice(0, 10) // Keep only 10 most recent if space is tight
        ];
        setHistory(minimalHistory);
        localStorage.setItem('jomi_history', JSON.stringify(minimalHistory));
      } catch (e) {
        console.error("Unable to save history even after cleanup.");
      }
    }
  };

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('jomi_history', JSON.stringify(updated));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setAnalysis({
      isLoading: false,
      isStreaming: false,
      result: item.result,
      error: null
    });
    // Ensure we are on home and report view
    setCurrentPage('home');
    setActiveTab('report');
  };

  // Dynamic Pricing Logic
  const priceCalculation = useMemo(() => {
    if (files.length === 0) return { total: 0, pages: 0, tier: 'Lite' };
    
    // Calculate total "pages" (Images = 1, PDF = 5 estimated)
    const totalPages = files.reduce((acc, file) => acc + file.estimatedPages, 0);
    
    let tier = 'Lite';
    let cost = 500;

    if (totalPages <= 6) {
      tier = 'Lite (1-6 pgs)';
      cost = 500;
    } else if (totalPages <= 20) {
      tier = 'Standard (7-20 pgs)';
      cost = 1500;
    } else {
      tier = 'Deep / Developer (21+ pgs)';
      cost = 3000; 
    }
    
    return { total: cost, pages: totalPages, tier };
  }, [files]);

  const handleStartAnalysis = () => {
    if (files.length === 0) return;
    
    if (!hasPaid) {
      setIsPaymentOpen(true);
    } else {
      runAnalysis();
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    setHasPaid(true);
    runAnalysis();
  };

  const runAnalysis = async () => {
    setAnalysis({ isLoading: true, isStreaming: false, result: null, error: null });
    setActiveTab('report'); 

    try {
      const resultData = await analyzeDocuments(files);
      setAnalysis({
        isLoading: false,
        isStreaming: false,
        result: resultData, 
        error: null,
      });
      saveToHistory(resultData); // Auto-save on success
    } catch (err: any) {
      setAnalysis({
        isLoading: false,
        isStreaming: false,
        result: null,
        error: err.message || "An unexpected error occurred during analysis.",
      });
    }
  };

  const resetAnalysis = () => {
    setAnalysis({ isLoading: false, isStreaming: false, result: null, error: null });
    setFiles([]);
    setHasPaid(false); 
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      <Header 
        onNavigate={setCurrentPage} 
        currentPage={currentPage} 
        onToggleHistory={() => setIsHistoryOpen(true)}
      />
      
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onLoad={loadHistoryItem}
        onDelete={deleteHistoryItem}
      />

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onConfirm={handlePaymentSuccess} 
        amount={priceCalculation.total}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {currentPage === 'home' ? (
          <>
            {/* LEFT PANEL: Controls & Input (Always Visible) */}
            <section className="w-full md:w-5/12 lg:w-[500px] xl:w-[600px] flex flex-col border-r border-slate-200 bg-white z-10 shadow-sm md:shadow-none h-full">
              
              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                
                {/* Section Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 bangla-text flex items-center gap-2 mb-2">
                    <Sparkles className="text-brand-600" size={24}/>
                    Property Risk Analyzer
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Upload land documents (Deed, Khatian, Mutation) to detect legal risks, ownership gaps, and hidden clauses.
                  </p>
                </div>

                {/* File Upload Area */}
                <div className="mb-8">
                   <FileUpload 
                    files={files} 
                    setFiles={setFiles} 
                    disabled={analysis.isLoading} 
                  />
                </div>

                {/* Action Area */}
                {files.length > 0 ? (
                  <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    
                    {/* Price Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Estimated Cost</span>
                            <div className="text-3xl font-extrabold text-slate-900">
                              {priceCalculation.total}৳
                            </div>
                          </div>
                          <div className="text-right">
                             <span className="inline-block px-2 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-md">
                               {priceCalculation.tier}
                             </span>
                             <div className="text-xs text-slate-500 mt-1">{priceCalculation.pages} estimated pages</div>
                          </div>
                       </div>
                       <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-3 leading-relaxed">
                         Includes: Deep Forensic Scan • Chain of Title Verification • Vested Property Check • Bangla Report
                       </div>
                    </div>

                    {/* Main Action Button */}
                    <button
                      onClick={handleStartAnalysis}
                      disabled={analysis.isLoading}
                      className={`
                        w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg shadow-brand-600/20 transition-all
                        ${analysis.isLoading 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/30 hover:-translate-y-0.5 active:translate-y-0'
                        }
                      `}
                    >
                      {analysis.isLoading ? (
                        <span className="flex items-center gap-2">Processing...</span>
                      ) : (
                        <>
                          Pay & Analyze Risks <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                    
                    {analysis.error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-start gap-2">
                        <AlertOctagon size={16} className="mt-0.5 shrink-0"/>
                        {analysis.error}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State Hints */
                  <div className="mt-4 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                       <div className="bg-white p-2 rounded-lg border border-slate-200 text-brand-600 h-fit">
                         <Zap size={20} />
                       </div>
                       <div>
                         <h4 className="font-semibold text-slate-900 text-sm">Instant Analysis</h4>
                         <p className="text-xs text-slate-500 mt-1">AI reads your deed in seconds, saving you days of manual checking.</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                       <div className="bg-white p-2 rounded-lg border border-slate-200 text-brand-600 h-fit">
                         <Shield size={20} />
                       </div>
                       <div>
                         <h4 className="font-semibold text-slate-900 text-sm">Secure & Private</h4>
                         <p className="text-xs text-slate-500 mt-1">Bank-grade encryption. Documents are automatically purged after analysis.</p>
                       </div>
                    </div>
                  </div>
                )}
                
                {/* Footer Info */}
                <div className="mt-auto pt-8 flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={12} />
                  <span>Avg. Report Time: 2 minutes</span>
                </div>

              </div>
            </section>

            {/* RIGHT PANEL: Output / Dashboard (Takes remaining space) */}
            <section className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col">
              
              {/* Scenario 1: Loading */}
              {analysis.isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                  <LoadingState />
                </div>
              )}

              {/* Scenario 2: Result Available */}
              {analysis.result && !analysis.isLoading ? (
                <div className="h-full flex flex-col animate-in fade-in duration-500">
                   {/* Report Toolbar & Tabs */}
                   <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
                      
                      {/* Tabs */}
                      <div className="flex items-center gap-1 h-full">
                         <button 
                           onClick={() => setActiveTab('report')}
                           className={`h-full px-4 border-b-2 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'report' ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                         >
                           <FileText size={16} /> Analysis Report
                         </button>
                         <button 
                           onClick={() => setActiveTab('chat')}
                           className={`h-full px-4 border-b-2 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === 'chat' ? 'border-brand-600 text-brand-700 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                         >
                           <MessageSquareText size={16} /> AI Assistant & Drafter
                         </button>
                      </div>

                      {/* Right Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={resetAnalysis}
                          className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <RefreshCcw size={14} /> New Check
                        </button>
                      </div>
                   </div>
                   
                   {/* Main Content Area */}
                   <div className="flex-1 overflow-hidden relative">
                      {activeTab === 'report' ? (
                        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 bg-slate-100/50">
                          <div className="max-w-4xl mx-auto bg-white min-h-full shadow-sm border border-slate-200 rounded-xl p-8 md:p-12">
                             <AnalysisReport report={analysis.result} />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col">
                           <ChatInterface analysisResult={analysis.result} />
                        </div>
                      )}
                   </div>
                </div>
              ) : (
                /* Scenario 3: Idle / Welcome State (Pro Dashboard Look) */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 select-none bg-slate-50/50">
                  <div className="max-w-md">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-200 mx-auto flex items-center justify-center mb-6">
                      <FileSearch size={40} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Analyze</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Your analysis report will appear here. <br/>
                      Select your documents from the left panel to begin the forensic scan.
                    </p>
                    
                    <div className="mt-10 grid grid-cols-2 gap-4 opacity-60">
                      <div className="flex items-center gap-2 justify-center text-xs font-medium">
                        <CheckCircle2 size={14} className="text-brand-500" />
                        Bangla Translation
                      </div>
                      <div className="flex items-center gap-2 justify-center text-xs font-medium">
                        <CheckCircle2 size={14} className="text-brand-500" />
                        Ownership Chain
                      </div>
                      <div className="flex items-center gap-2 justify-center text-xs font-medium">
                        <CheckCircle2 size={14} className="text-brand-500" />
                        Legal Clauses
                      </div>
                      <div className="flex items-center gap-2 justify-center text-xs font-medium">
                        <CheckCircle2 size={14} className="text-brand-500" />
                        Fairness Check
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Static Pages (Full Width) */
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white w-full">
            {currentPage === 'how-it-works' && <HowItWorks />}
            {currentPage === 'pricing' && <Pricing />}
            {currentPage === 'support' && <Support />}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
