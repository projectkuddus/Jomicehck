
import React, { useEffect, useState } from 'react';
import { BrainCircuit, Search, FileSearch, Scale, FileText, AlertTriangle } from 'lucide-react';

const LoadingState: React.FC = () => {
  const [currentLog, setCurrentLog] = useState<string[]>([]);
  const [phase, setPhase] = useState(0);

  const phases = [
    { title: "Document Digestion", sub: "Extracting Bangla text & layout...", icon: FileText },
    { title: "Forensic Scanning", sub: "Checking clause validity...", icon: Search },
    { title: "Legal Logic Analysis", sub: "Cross-referencing laws...", icon: BrainCircuit },
    { title: "Risk Assessment", sub: "Calculating fairness score...", icon: AlertTriangle },
    { title: "Finalizing Verdict", sub: "Generating Bangla report...", icon: Scale },
  ];

  const detailedLogs = [
    "Initializing OCR engine...",
    "Detecting Bengali script (Bangla)...",
    "Segmenting paragraphs...",
    "Identifying 'Schedule of Property'...",
    "Extracting deed number and date...",
    "Verifying mouza map references...",
    "Checking for 'Power of Attorney' keywords...",
    "Analyzing 'Warish' (Heir) lineage...",
    "Scanning for Vested Property indicators...",
    "Validating signature timestamps...",
    "Cross-referencing Land Registration Act...",
    "Checking standard biometric clauses...",
    "Detecting hidden mortgage terms...",
    "Analyzing handover conditions...",
    "Computing fairness index...",
    "Drafting 'Good Points' section...",
    "Compiling 'Critical Issues' list...",
    "Formatting JSON output...",
  ];

  useEffect(() => {
    // Phase timer
    const phaseInterval = setInterval(() => {
      setPhase(p => (p + 1) % phases.length);
    }, 3500); // 3.5s per phase

    return () => clearInterval(phaseInterval);
  }, [phases.length]);

  useEffect(() => {
    // Log timer - adds a new log line every ~800ms to simulate processing
    let logIndex = 0;
    const logInterval = setInterval(() => {
      setCurrentLog(prev => {
        const newLogs = [...prev, detailedLogs[logIndex % detailedLogs.length]];
        if (newLogs.length > 5) newLogs.shift(); // Keep last 5 logs
        return newLogs;
      });
      logIndex++;
    }, 800);

    return () => clearInterval(logInterval);
  }, []);

  const CurrentIcon = phases[phase].icon;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-8 font-sans">
      
      {/* Central Animation */}
      <div className="relative mb-8">
        {/* Pulsing rings */}
        <div className="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-20"></div>
        <div className="absolute inset-2 bg-brand-400 rounded-full animate-pulse opacity-30"></div>
        
        <div className="relative bg-white p-8 rounded-full shadow-xl border-4 border-brand-50 transition-all duration-500 transform hover:scale-105">
          <CurrentIcon size={48} className="text-brand-600 animate-bounce-slight" />
        </div>
      </div>

      {/* Main Status Text */}
      <div className="text-center mb-10 h-20">
        <h3 className="text-2xl font-bold text-slate-800 mb-2 transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in">
          {phases[phase].title}
        </h3>
        <p className="text-slate-500 text-base font-medium">
          {phases[phase].sub}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden shadow-inner">
        <div className="h-full bg-brand-500 animate-progress origin-left rounded-full"></div>
      </div>

      {/* Terminal / Log Output */}
      <div className="w-full bg-slate-900 rounded-lg p-5 font-mono text-xs md:text-sm text-brand-400 shadow-xl border border-slate-700 h-48 overflow-hidden flex flex-col justify-end relative">
        <div className="absolute top-3 right-3 flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        
        {currentLog.map((log, idx) => (
          <div key={idx} className="truncate opacity-90 animate-in slide-in-from-bottom-1 fade-in duration-300 flex items-center gap-2">
            <span className="text-slate-600">{'>'}</span>
            <span className={idx === currentLog.length - 1 ? 'text-brand-200 font-bold' : 'text-brand-400/80'}>
              {log}
            </span>
          </div>
        ))}
        <div className="animate-pulse mt-1 text-brand-500 font-bold">_</div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-bold">
        <BrainCircuit size={16} className="text-brand-500" />
        Powered by Gemini 3.0 Pro
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 5%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 18s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite; 
        }
        @keyframes bounce-slight {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slight {
          animation: bounce-slight 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
