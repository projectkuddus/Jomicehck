import React from 'react';
import { Upload, BrainCircuit, FileCheck, ShieldCheck, Search } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Upload size={32} />,
      title: "1. Upload Documents",
      desc: "Upload your Property Deed (Dolil), Khatian, or any land document. We support PDF, JPG, and even mobile photos.",
      detail: "Supports drafts & signed copies."
    },
    {
      icon: <BrainCircuit size={32} />,
      title: "2. AI Forensic Scan",
      desc: "Our 'Paranoid Lawyer' AI reads every clause, cross-checks chains of title, and looks for hidden risks or missing names.",
      detail: "Uses Gemini 3 Pro technology."
    },
    {
      icon: <FileCheck size={32} />,
      title: "3. Get Risk Report",
      desc: "Receive a comprehensive risk analysis in simple Bangla. See what's good, what's bad, and exactly what to fix.",
      detail: "Ready in ~2 minutes."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-sans text-slate-800">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 bangla-text">কিভাবে কাজ করে? (How it works)</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Your personal AI Property Legal Assistant. We turn complex legal jargon into a clear, actionable checklist in minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative">
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 z-0"></div>

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              {step.desc}
            </p>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
              {step.detail}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-10 shadow-xl">
        <div className="flex-1 space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" />
            Why trust JomiCheck?
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Search className="shrink-0 text-brand-400 mt-1" size={20} />
              <div>
                <strong className="block text-brand-200">Beyond Simple OCR</strong>
                <span className="text-slate-300 text-sm">We don't just read text. We understand legal logic, ownership chains (Warish), and validity rules.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="shrink-0 text-brand-400 mt-1" size={20} />
              <div>
                <strong className="block text-brand-200">Unbiased Opinion</strong>
                <span className="text-slate-300 text-sm">We don't work for the seller or the broker. We work for YOU to find every possible fault.</span>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex-1 w-full">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
               <div className="w-3 h-3 rounded-full bg-green-500"></div>
               <span className="ml-auto text-xs text-white/50">Analysis Sample</span>
            </div>
            <div className="space-y-3">
               <div className="h-4 bg-white/20 rounded w-3/4"></div>
               <div className="h-4 bg-white/20 rounded w-1/2"></div>
               <div className="h-20 bg-white/10 rounded w-full border-l-4 border-red-400 p-2">
                 <div className="h-3 bg-red-400/20 rounded w-full mb-2"></div>
                 <div className="h-3 bg-red-400/20 rounded w-2/3"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;