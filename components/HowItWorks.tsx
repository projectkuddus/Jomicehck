import React from 'react';
import { Upload, FileText, FileCheck, AlertTriangle, Users, MapPin, FileX, Scale, Clock } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Upload size={28} />,
      title: "1. Upload",
      desc: "Upload your Dolil, Khatian, or land document. PDF, JPG, or photo.",
    },
    {
      icon: <FileText size={28} />,
      title: "2. We Read",
      desc: "AI reads the Bangla text and extracts key information.",
    },
    {
      icon: <FileCheck size={28} />,
      title: "3. Get Report",
      desc: "Structured Bangla report with ownership chain, missing info, issues.",
    }
  ];

  const realProblems = [
    {
      icon: <Users size={20} />,
      title: "ওয়ারিশ বাদ পড়েছে",
      titleEn: "Missing Heir (Warish)",
      desc: "দলিলে সব উত্তরাধিকারীর স্বাক্ষর নেই। পরে বাদ পড়া ওয়ারিশ মামলা করে।",
      descEn: "Not all legal heirs signed the deed. Later, missing heir files case."
    },
    {
      icon: <MapPin size={20} />,
      title: "দাগ/খতিয়ান ভুল",
      titleEn: "Wrong Dag/Khatian",
      desc: "দলিলে লেখা দাগ নম্বর আর জমির আসল দাগ নম্বর মিলছে না।",
      descEn: "Dag number in deed doesn't match actual land records."
    },
    {
      icon: <FileX size={20} />,
      title: "সীমানা অস্পষ্ট",
      titleEn: "Vague Boundaries",
      desc: "চৌহদ্দি/সীমানা স্পষ্টভাবে লেখা নেই। পরে প্রতিবেশী দাবি করে।",
      descEn: "Property boundaries not clearly written. Neighbor claims land later."
    },
    {
      icon: <Scale size={20} />,
      title: "অর্পিত সম্পত্তি",
      titleEn: "Vested Property",
      desc: "মালিকানা চেইনে সংখ্যালঘু নাম আছে যা হঠাৎ বদলে গেছে। ভেস্টেড আইনে জটিলতা।",
      descEn: "Minority name in ownership chain disappeared. Vested property risk."
    },
    {
      icon: <Clock size={20} />,
      title: "মেয়াদোত্তীর্ণ POA",
      titleEn: "Expired Power of Attorney",
      desc: "পাওয়ার অফ অ্যাটর্নির মেয়াদ শেষ হয়ে গেছে, কিন্তু সেটা দিয়েই বিক্রি হচ্ছে।",
      descEn: "Power of Attorney has expired but still being used for sale."
    },
    {
      icon: <AlertTriangle size={20} />,
      title: "লুকানো দায়",
      titleEn: "Hidden Encumbrance",
      desc: "ব্যাংক মর্টগেজ বা আদালতের নিষেধাজ্ঞা আছে যা দলিলের শেষে ছোট করে লেখা।",
      descEn: "Bank mortgage or court injunction mentioned in fine print."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 font-sans text-slate-800">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 bangla-text">কিভাবে কাজ করে?</h2>
        <p className="text-slate-600 max-w-xl mx-auto">
          Upload your deed. We read the text. You get a Bangla report.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center bg-white p-6 rounded-xl border border-slate-200">
            <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-4">
              {step.icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
            <p className="text-slate-600 text-sm">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Real Problems Section */}
      <div className="bg-slate-900 rounded-2xl p-8 md:p-10 text-white mb-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2 bangla-text">দলিল না বুঝে সাইন করলে যা হয়</h3>
          <p className="text-slate-400 text-sm">Real problems people face from not reading their deed properly</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {realProblems.map((problem, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-amber-400">
                  {problem.icon}
                </div>
                <div>
                  <div className="font-bold text-white bangla-text text-sm">{problem.title}</div>
                  <div className="text-slate-400 text-xs">{problem.titleEn}</div>
                </div>
              </div>
              <p className="text-slate-300 text-xs bangla-text leading-relaxed mb-1">{problem.desc}</p>
              <p className="text-slate-500 text-[10px]">{problem.descEn}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-slate-400 text-sm">
            এই সমস্যাগুলো হয় কারণ মানুষ দলিল পড়ে না বা বুঝে না।<br/>
            <span className="text-white">JomiCheck দলিলের টেক্সট পড়ে এবং এই সমস্যাগুলো খুঁজে বের করে।</span>
          </p>
        </div>
      </div>

      {/* What We Check */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">দলিলে আমরা যা চেক করি</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold text-slate-800 text-sm">মালিকানা চেইন</div>
            <div className="text-slate-500 text-xs">Ownership Chain</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">📍</div>
            <div className="font-semibold text-slate-800 text-sm">দাগ ও খতিয়ান</div>
            <div className="text-slate-500 text-xs">Dag & Khatian</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">📐</div>
            <div className="font-semibold text-slate-800 text-sm">সীমানা/চৌহদ্দি</div>
            <div className="text-slate-500 text-xs">Boundaries</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold text-slate-800 text-sm">তারিখ ও নাম</div>
            <div className="text-slate-500 text-xs">Dates & Names</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">⚖️</div>
            <div className="font-semibold text-slate-800 text-sm">আইনি ক্লজ</div>
            <div className="text-slate-500 text-xs">Legal Clauses</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold text-slate-800 text-sm">ওয়ারিশ তালিকা</div>
            <div className="text-slate-500 text-xs">Heir List</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">🏦</div>
            <div className="font-semibold text-slate-800 text-sm">দায়/মর্টগেজ</div>
            <div className="text-slate-500 text-xs">Encumbrance</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-2xl mb-2">❓</div>
            <div className="font-semibold text-slate-800 text-sm">অনুপস্থিত তথ্য</div>
            <div className="text-slate-500 text-xs">Missing Info</div>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-6">
          আমরা শুধু দলিলে যা লেখা আছে তা পড়ি। রেজিস্ট্রি অফিসে যাচাই করতে হবে আলাদাভাবে।
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
