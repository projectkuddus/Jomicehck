import React from 'react';
import { 
  Upload, FileText, FileCheck, AlertTriangle, Clock, Banknote, 
  Home, Users, Gavel, ShieldAlert, ArrowRight, CheckCircle2,
  FileWarning, Scale, Link2, MapPin, Calendar, UserCheck, FileX, Landmark
} from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Upload size={28} />,
      title: "Upload",
      titleBn: "আপলোড",
      desc: "Upload your Dolil, Khatian, or land document. PDF, JPG, or photo.",
      color: "bg-blue-500",
    },
    {
      icon: <FileText size={28} />,
      title: "We Read",
      titleBn: "আমরা পড়ি",
      desc: "AI reads the Bangla text and extracts key information.",
      color: "bg-brand-500",
    },
    {
      icon: <FileCheck size={28} />,
      title: "Get Report",
      titleBn: "রিপোর্ট পান",
      desc: "Structured Bangla report with ownership chain, missing info, issues.",
      color: "bg-green-500",
    }
  ];

  const problems = [
    {
      icon: <FileWarning size={20} />,
      text: "সম্পত্তি জালিয়াতি",
      textEn: "Property Fraud"
    },
    {
      icon: <FileX size={20} />,
      text: "দলিলে ভুল",
      textEn: "Deed Mistakes"
    },
    {
      icon: <Landmark size={20} />,
      text: "লুকানো মর্টগেজ",
      textEn: "Hidden Mortgage"
    },
    {
      icon: <Scale size={20} />,
      text: "জমি বিরোধ",
      textEn: "Land Disputes"
    },
  ];

  const buyerReliesOn = [
    {
      icon: <Users size={18} />,
      title: "দালাল / ডেভেলপার",
      desc: "যাদের স্বার্থ বিক্রেতার সাথে",
      bad: true
    },
    {
      icon: <Scale size={18} />,
      title: "উকিল",
      desc: "ব্যয়বহুল, সবার নাগালে নেই",
      bad: true
    },
    {
      icon: <UserCheck size={18} />,
      title: "নিজের অনুমান",
      desc: "যা প্রায়ই ভুল হয়",
      bad: true
    },
  ];

  const consequences = [
    {
      icon: <Gavel size={24} />,
      title: "১০-২০ বছরের মামলা",
      titleEn: "10-20 years court case",
      desc: "একটি ভুল দলিলে সাইন মানে বছরের পর বছর আদালতে যাওয়া।",
    },
    {
      icon: <Banknote size={24} />,
      title: "টাকা ফেরত নেই",
      titleEn: "Money gone forever",
      desc: "রেজিস্ট্রি হয়ে গেলে টাকা ফেরত পাওয়া প্রায় অসম্ভব।",
    },
    {
      icon: <Home size={24} />,
      title: "জমি দখল",
      titleEn: "Land taken",
      desc: "আসল মালিক এসে দাবি করলে জমি হাতছাড়া।",
    },
    {
      icon: <Users size={24} />,
      title: "পারিবারিক সমস্যা",
      titleEn: "Family disputes",
      desc: "জমি নিয়ে ঝামেলা = পরিবারে অশান্তি।",
    },
    {
      icon: <Clock size={24} />,
      title: "সময় নষ্ট",
      titleEn: "Years wasted",
      desc: "মামলা চলাকালীন জমি ব্যবহার করা যায় না।",
    },
    {
      icon: <AlertTriangle size={24} />,
      title: "পরের প্রজন্মেও সমস্যা",
      titleEn: "Inherited problems",
      desc: "সন্তানদেরও এই মামলা বহন করতে হয়।",
    },
  ];

  const whatWeRead = [
    { icon: <Link2 size={18} />, title: "মালিকানা চেইন", desc: "Ownership Chain" },
    { icon: <MapPin size={18} />, title: "দাগ ও খতিয়ান", desc: "Plot Numbers" },
    { icon: <Home size={18} />, title: "সীমানা", desc: "Boundaries" },
    { icon: <Users size={18} />, title: "ওয়ারিশ", desc: "Heirs" },
    { icon: <Calendar size={18} />, title: "তারিখ", desc: "Dates" },
    { icon: <FileText size={18} />, title: "ক্লজ", desc: "Legal Clauses" },
    { icon: <Landmark size={18} />, title: "দায়/মর্টগেজ", desc: "Liabilities" },
    { icon: <AlertTriangle size={18} />, title: "অনুপস্থিত তথ্য", desc: "Missing Info" },
  ];

  return (
    <div className="font-sans text-slate-800">
      
      {/* Hero Problem Statement */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Main Problem */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-6">
              <ShieldAlert size={16} />
              সত্যিকারের সমস্যা
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 bangla-text leading-tight">
              জমি/ফ্ল্যাট কেনা = সারাজীবনের সঞ্চয়
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Property is usually a person's lifetime savings. One wrong signature can destroy everything.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {problems.map((problem, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    {problem.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm bangla-text">{problem.text}</div>
                    <div className="text-slate-500 text-xs">{problem.textEn}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Stats */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-orange-100">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              
              {/* Stat 1 */}
              <div className="text-center">
                <div className="text-4xl font-black text-red-600 mb-2">৫-১০</div>
                <div className="text-slate-700 font-semibold bangla-text">বছরের মামলা</div>
                <div className="text-slate-500 text-sm">Years of court case</div>
              </div>
              
              {/* Divider */}
              <div className="hidden md:flex items-center justify-center">
                <div className="w-px h-16 bg-slate-200"></div>
              </div>
              
              {/* Stat 2 */}
              <div className="text-center">
                <div className="text-4xl font-black text-red-600 mb-2 bangla-text">০%</div>
                <div className="text-slate-700 font-semibold bangla-text">টাকা ফেরত</div>
                <div className="text-slate-500 text-sm">Money back if fraud</div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-slate-600 text-sm">
                <span className="font-semibold text-slate-800">দলিল জটিল আইনি বাংলায় লেখা।</span> ক্রেতা বুঝতেই পারে না কী সাইন করছে।
              </p>
            </div>
          </div>

          {/* Who buyers rely on */}
          <div className="mt-10">
            <h3 className="text-center font-bold text-slate-800 mb-6 bangla-text">ক্রেতারা এখন কার উপর নির্ভর করে?</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {buyerReliesOn.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/60 rounded-xl p-4 border border-orange-100">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 bangla-text">{item.title}</div>
                    <div className="text-slate-500 text-sm bangla-text">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* JomiCheck Solution */}
      <div className="bg-brand-600 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 bangla-text">
            JomiCheck — সাইন করার আগে দলিল বুঝুন
          </h2>
          <p className="text-brand-100 text-lg">
            দ্রুত • বোধগম্য • সাশ্রয়ী
          </p>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 bangla-text">কিভাবে কাজ করে?</h2>
            <p className="text-slate-500">3 simple steps to understand your deed</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center text-center bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full md:w-64 hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 ${step.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="text-2xl font-black text-slate-300 mb-2">{idx + 1}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                  <div className="text-brand-600 font-semibold text-sm bangla-text mb-2">{step.titleBn}</div>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </div>
                
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-slate-300">
                    <ArrowRight size={24} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Consequences Section */}
      <div className="bg-slate-900 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 bangla-text">
              ভুল দলিলে সাইন করলে কী হয়?
            </h3>
            <p className="text-slate-400 max-w-lg mx-auto">
              একবার রেজিস্ট্রি হয়ে গেলে ফেরত নেই। এই সমস্যাগুলো বাস্তব।
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {consequences.map((item, idx) => (
              <div key={idx} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-colors">
                <div className="text-red-400 mb-3">
                  {item.icon}
                </div>
                <div className="font-bold text-white bangla-text mb-1">{item.title}</div>
                <div className="text-slate-500 text-xs mb-2">{item.titleEn}</div>
                <p className="text-slate-400 text-sm bangla-text leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-xl font-bold text-white bangla-text mb-2">
              সাইন করার আগে দলিল পড়ুন।
            </p>
            <p className="text-slate-400 text-sm">
              JomiCheck দলিলের টেক্সট পড়ে সমস্যা খুঁজে বের করে।
            </p>
          </div>
        </div>
      </div>

      {/* What We Read */}
      <div className="bg-slate-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 mb-3 bangla-text">দলিলে আমরা কী পড়ি?</h3>
            <p className="text-slate-500">What we analyze in your documents</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {whatWeRead.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-brand-100 transition-colors">
                  {item.icon}
                </div>
                <div className="font-semibold text-slate-800 bangla-text">{item.title}</div>
                <div className="text-slate-500 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-amber-800 text-sm">
              <span className="font-semibold">⚠️ দ্রষ্টব্য:</span> আমরা শুধু দলিলে যা লেখা আছে তা পড়ি। রেজিস্ট্রি অফিসে ভেরিফাই করতে হবে আলাদাভাবে।
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HowItWorks;
