
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FileUpload from './components/FileUpload';
import AnalysisReport from './components/AnalysisReport';
import LoadingState from './components/LoadingState';
import PaymentModal from './components/PaymentModal';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Support from './components/Support';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import ChatInterface from './components/ChatInterface'; 
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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
  FileText,
  LogIn
} from 'lucide-react';

type PageView = 'home' | 'how-it-works' | 'pricing' | 'support' | 'terms' | 'privacy';
type ResultTab = 'report' | 'chat';

const AppContent: React.FC = () => {
  const { user, profile, useCredits, isConfigured } = useAuth();
  
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>('report');
  
  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Check for admin access via URL hash
  useEffect(() => {
    const checkAdminAccess = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
        // Clear the hash to hide the admin URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    
    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);
    return () => window.removeEventListener('hashchange', checkAdminAccess);
  }, []);

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

  // Credit System Constants
  const FREE_CREDITS = 5; // Free trial pages for non-logged in users
  const CREDIT_RATE = 8; // BDT per credit (based on Popular package rate)

  // Dynamic Credit-Based Pricing
  const priceCalculation = useMemo(() => {
    if (files.length === 0) return { total: 0, pages: 0, creditsNeeded: 0, userCredits: 0, canAfford: false, needsLogin: false };
    
    // Calculate total "pages" (Images = 1, PDF = 5 estimated)
    const totalPages = files.reduce((acc, file) => acc + file.estimatedPages, 0);
    const userCredits = profile?.credits || 0;
    
    // If user is logged in, check their credits
    if (user && profile) {
      const canAfford = userCredits >= totalPages;
      return { 
        total: totalPages * CREDIT_RATE, 
        pages: totalPages, 
        creditsNeeded: totalPages,
        userCredits,
        canAfford,
        needsLogin: false
      };
    }
    
    // Not logged in - prompt to login for free credits
    return { 
      total: totalPages * CREDIT_RATE, 
      pages: totalPages, 
      creditsNeeded: totalPages,
      userCredits: 0,
      canAfford: false,
      needsLogin: true
    };
  }, [files, user, profile]);

  const handleStartAnalysis = async () => {
    if (files.length === 0) return;
    
    // If not logged in, prompt to login
    if (priceCalculation.needsLogin) {
      setIsAuthOpen(true);
      return;
    }
    
    // If logged in but not enough credits, open payment
    if (!priceCalculation.canAfford) {
      setIsPaymentOpen(true);
      return;
    }
    
    // Deduct credits and run analysis
    const success = await useCredits(priceCalculation.creditsNeeded);
    if (success) {
      runAnalysis();
    } else {
      // If credit deduction failed, show error
      setAnalysis({
        isLoading: false,
        isStreaming: false,
        result: null,
        error: 'Failed to deduct credits. Please refresh and try again, or contact support if the issue persists.',
      });
      setIsPaymentOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    // After buying credits, try analysis again
    handleStartAnalysis();
  };

  const runAnalysis = async () => {
    if (files.length === 0) {
      setAnalysis({
        isLoading: false,
        isStreaming: false,
        result: null,
        error: 'Please upload at least one document to analyze.',
        progress: undefined
      });
      return;
    }

    setAnalysis({ 
      isLoading: true, 
      isStreaming: false, 
      result: null, 
      error: null,
      progress: undefined
    });
    setActiveTab('report'); 

    try {
      const resultData = await analyzeDocuments(files, (current, total, currentBatch, totalBatches) => {
        // Update progress in real-time
        setAnalysis(prev => ({
          ...prev,
          progress: {
            current,
            total,
            currentBatch,
            totalBatches
          }
        }));
      });
      
      setAnalysis({
        isLoading: false,
        isStreaming: false,
        result: resultData, 
        error: null,
        progress: undefined
      });
      saveToHistory(resultData); // Auto-save on success
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysis({
        isLoading: false,
        isStreaming: false,
        result: null,
        error: err.message || "An unexpected error occurred during analysis. Please try again or contact support.",
        progress: undefined
      });
    }
  };

  const resetAnalysis = () => {
    setAnalysis({ isLoading: false, isStreaming: false, result: null, error: null });
    setFiles([]);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden print:hidden">
      <Header 
        onNavigate={setCurrentPage} 
        currentPage={currentPage} 
        onToggleHistory={() => setIsHistoryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onLoad={loadHistoryItem}
        onDelete={deleteHistoryItem}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Admin Panel - Access via jomicheck.com/#admin */}
      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}

      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onConfirm={handlePaymentSuccess} 
        amount={priceCalculation.total}
        creditsNeeded={priceCalculation.creditsNeeded}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {currentPage === 'home' ? (
          <>
            {/* LEFT PANEL: Controls & Input (Always Visible) */}
            <section className="w-full md:w-5/12 lg:w-[500px] xl:w-[600px] flex flex-col border-r border-slate-200 bg-white z-10 shadow-sm md:shadow-none h-full print:hidden">
              
              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                
                {/* Section Header */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <Sparkles className="text-brand-600" size={22}/>
                    Property Risk Analyzer
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Upload land documents (Deed, Khatian, Mutation) to detect legal risks, ownership gaps, and hidden clauses.
                  </p>
                </div>

                {/* File Upload Area - Requires Login */}
                <div className="mb-8">
                  {user ? (
                    <FileUpload 
                      files={files} 
                      setFiles={setFiles} 
                      disabled={analysis.isLoading} 
                    />
                  ) : (
                    <div 
                      onClick={() => setIsAuthOpen(true)}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-all"
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn size={28} className="text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">Login Required</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Please login or sign up to upload and analyze documents
                      </p>
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors">
                        <LogIn size={16} /> Login / Sign Up
                      </span>
                      <p className="text-xs text-brand-600 mt-3">
                        🎁 Get {FREE_CREDITS} free credits on signup!
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Area */}
                {files.length > 0 ? (
                  <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                    
                    {/* Credit-Based Price Card */}
                    <div className={`border rounded-xl p-5 mb-5 ${priceCalculation.canAfford ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Credits Needed
                            </span>
                            <div className="text-3xl font-extrabold text-slate-900">
                              {priceCalculation.creditsNeeded} <span className="text-lg font-medium text-slate-500">credits</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {user && profile ? (
                              <>
                                <span className={`inline-block px-2 py-1 text-xs font-bold rounded-md ${priceCalculation.canAfford ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  You have: {priceCalculation.userCredits} credits
                                </span>
                              </>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-md">
                                Login for {FREE_CREDITS} free credits!
                              </span>
                            )}
                            <div className="text-xs text-slate-500 mt-1">{priceCalculation.pages} pages to analyze</div>
                          </div>
                       </div>
                       <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-3 leading-relaxed">
                         Includes: Deep Forensic Scan • Chain of Title • Vested Property Check • AI Chat
                       </div>
                       {!user && (
                         <div className="mt-3 text-xs text-brand-600 bg-brand-50 rounded-lg p-2 border border-brand-100">
                           🎁 Sign up with your phone and get {FREE_CREDITS} free credits instantly!
                         </div>
                       )}
                       {user && !priceCalculation.canAfford && (
                         <div className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg p-2 border border-amber-100">
                           💡 You need {priceCalculation.creditsNeeded - priceCalculation.userCredits} more credits. Buy a package to continue.
                         </div>
                       )}
                    </div>

                    {/* Main Action Button */}
                    <button
                      onClick={handleStartAnalysis}
                      disabled={analysis.isLoading}
                      className={`
                        w-full py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg transition-all
                        ${analysis.isLoading 
                          ? 'bg-slate-400 cursor-not-allowed' 
                          : priceCalculation.needsLogin
                            ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
                            : priceCalculation.canAfford
                              ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20 hover:shadow-green-600/30 hover:-translate-y-0.5 active:translate-y-0'
                              : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                        }
                      `}
                    >
                      {analysis.isLoading ? (
                        <span className="flex items-center gap-2">Processing...</span>
                      ) : priceCalculation.needsLogin ? (
                        <>
                          <LogIn size={20} /> Login to Analyze
                        </>
                      ) : priceCalculation.canAfford ? (
                        <>
                          Use {priceCalculation.creditsNeeded} Credits & Analyze <ArrowRight size={20} />
                        </>
                      ) : (
                        <>
                          Buy Credits to Continue <ArrowRight size={20} />
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
                         <FileText size={20} />
                       </div>
                       <div>
                         <h4 className="font-semibold text-slate-900 text-sm">Text Analysis</h4>
                         <p className="text-xs text-slate-500 mt-1">We read the text in your documents and create a structured report.</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                       <div className="bg-white p-2 rounded-lg border border-slate-200 text-brand-600 h-fit">
                         <Shield size={20} />
                       </div>
                       <div>
                         <h4 className="font-semibold text-slate-900 text-sm">Bangla Report</h4>
                         <p className="text-xs text-slate-500 mt-1">Get results in Bangla. Ownership chain, missing info, potential issues.</p>
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
                  <LoadingState progress={analysis.progress} />
                </div>
              )}

              {/* Scenario 2: Result Available */}
              {analysis.result && !analysis.isLoading ? (
                <div className="h-full flex flex-col animate-in fade-in duration-500">
                   {/* Report Toolbar & Tabs */}
                   <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shadow-sm z-10 shrink-0 print:hidden">
                      
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
                        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 bg-slate-100/50 print:p-0 print:bg-white">
                          <div className="max-w-4xl mx-auto bg-white min-h-full shadow-sm border border-slate-200 rounded-xl p-8 md:p-12 print:max-w-full print:shadow-none print:border-none print:p-4">
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
                /* Scenario 3: Idle / Welcome State */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 select-none bg-slate-50/50">
                  <div className="max-w-sm">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 mx-auto flex items-center justify-center mb-6">
                      <FileSearch size={36} className="text-slate-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2 bangla-text">দলিল আপলোড করুন</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      বাম পাশ থেকে দলিল আপলোড করুন।<br/>
                      আমরা পড়ে বাংলায় রিপোর্ট দেব।
                    </p>
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
            {currentPage === 'terms' && <Terms />}
            {currentPage === 'privacy' && <Privacy />}
          </div>
        )}

      </main>

      {/* Footer - Only show on static pages */}
      {currentPage !== 'home' && (
        <Footer onNavigate={setCurrentPage} />
      )}
    </div>
  );
};

// Wrap with AuthProvider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
