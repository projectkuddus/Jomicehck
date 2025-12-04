import React from 'react';
import { Upload, FileText, FileCheck, AlertTriangle, Clock, Banknote, Home, Users, Gavel } from 'lucide-react';

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

  const consequences = [
    {
      icon: <Gavel size={24} />,
      title: "১০-২০ বছরের মামলা",
      titleEn: "10-20 years court case",
      desc: "একটি ভুল দলিলে সাইন মানে বছরের পর বছর আদালতে যাওয়া। উকিল ফি, তারিখ, হাজিরা — জীবন থেমে যায়।",
    },
    {
      icon: <Banknote size={24} />,
      title: "টাকা ফেরত নেই",
      titleEn: "Money gone forever",
      desc: "রেজিস্ট্রি হয়ে গেলে টাকা ফেরত পাওয়া প্রায় অসম্ভব। বিক্রেতা উধাও, আপনি আটকে।",
    },
    {
      icon: <Home size={24} />,
      title: "জমি দখল হয়ে যায়",
      titleEn: "Land taken by others",
      desc: "আসল ওয়ারিশ বা মালিক এসে দাবি করলে জমি হাতছাড়া। আপনার কাগজ থাকলেও।",
    },
    {
      icon: <Users size={24} />,
      title: "পরিবারে সমস্যা",
      titleEn: "Family disputes",
      desc: "জীবনের সঞ্চয় দিয়ে কেনা জমি নিয়ে ঝামেলা মানে পরিবারে অশান্তি, মানসিক চাপ।",
    },
    {
      icon: <Clock size={24} />,
      title: "সময় নষ্ট",
      titleEn: "Years wasted",
      desc: "মামলা চলাকালীন জমি বিক্রি করা যায় না, ঘর বানানো যায় না। জীবন আটকে থাকে।",
    },
    {
      icon: <AlertTriangle size={24} />,
      title: "পরবর্তী প্রজন্মেও সমস্যা",
      titleEn: "Problem passes to children",
      desc: "আপনার পরে সন্তানদেরও এই মামলা বহন করতে হয়। সমস্যা বংশ পরম্পরায় চলে।",
    },
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
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

      {/* Consequences Section */}
      <div className="bg-slate-900 rounded-2xl p-8 md:p-10 text-white mb-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold mb-3 bangla-text">ভুল দলিলে সাইন করলে কী হয়?</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            একবার রেজিস্ট্রি হয়ে গেলে ফেরত নেই। এই সমস্যাগুলো বাস্তব — প্রতিদিন হাজার হাজার পরিবার ভুগছে।
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {consequences.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="text-red-400 mt-1">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-white bangla-text mb-1">{item.title}</div>
                  <div className="text-slate-500 text-xs mb-2">{item.titleEn}</div>
                  <p className="text-slate-300 text-sm bangla-text leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <p className="text-lg font-bold text-white bangla-text mb-2">
            সাইন করার আগে দলিল পড়ুন।
          </p>
          <p className="text-slate-400 text-sm">
            JomiCheck দলিলের টেক্সট পড়ে সমস্যা খুঁজে বের করে — আপনি সাইন করার আগে।
          </p>
        </div>
      </div>

      {/* What We Read */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center bangla-text">দলিলে আমরা কী পড়ি?</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">মালিকানা চেইন</div>
            <div className="text-slate-500 text-xs">কে কার কাছ থেকে কিনেছে</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">দাগ ও খতিয়ান</div>
            <div className="text-slate-500 text-xs">নম্বর লেখা আছে কিনা</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">সীমানা</div>
            <div className="text-slate-500 text-xs">চৌহদ্দি স্পষ্ট কিনা</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">ওয়ারিশ</div>
            <div className="text-slate-500 text-xs">সবার নাম আছে কিনা</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">তারিখ</div>
            <div className="text-slate-500 text-xs">সব তারিখ ঠিক আছে কিনা</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">ক্লজ</div>
            <div className="text-slate-500 text-xs">আইনি শর্তাবলী</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">দায়</div>
            <div className="text-slate-500 text-xs">মর্টগেজ/ব্যাংক ঋণ</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm bangla-text">অনুপস্থিত তথ্য</div>
            <div className="text-slate-500 text-xs">কী বাদ পড়েছে</div>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-6">
          আমরা শুধু দলিলে যা লেখা আছে তা পড়ি। রেজিস্ট্রি অফিসে ভেরিফাই করতে হবে আলাদাভাবে।
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
