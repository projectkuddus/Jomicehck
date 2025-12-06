import React from 'react';
import { Check, X, Info, Building2, FileSignature, Languages, Gift, Sparkles, TrendingUp, Users, Zap, Crown } from 'lucide-react';

const Pricing: React.FC = () => {
  const creditPackages = [
    {
      name: "Starter",
      credits: 20,
      price: "199",
      perCredit: "10",
      desc: "Try it out",
      color: "slate"
    },
    {
      name: "Popular",
      credits: 50,
      price: "449",
      perCredit: "9",
      savings: "10%",
      desc: "Best for most users",
      isPopular: true,
      color: "brand"
    },
    {
      name: "Value",
      credits: 100,
      price: "799",
      perCredit: "8",
      savings: "20%",
      desc: "For multiple properties",
      color: "blue"
    },
    {
      name: "Business",
      credits: 300,
      price: "1,999",
      perCredit: "6.66",
      savings: "33%",
      desc: "For professionals",
      color: "purple"
    }
  ];

  const analysisTiers = [
    {
      name: "PLUS",
      creditsPerPage: 1,
      color: "green",
      icon: Zap,
      tagline: "দ্রুত বিশ্লেষণ",
      features: [
        "AI Risk Score (0-100)",
        "সহজ বাংলায় রিপোর্ট",
        "Good/Bad Points",
        "Chain of Title",
        "AI Chat Assistant",
      ],
      bestFor: "নতুন দলিল, স্পষ্ট লেখা"
    },
    {
      name: "PRO",
      creditsPerPage: 4,
      color: "purple",
      icon: Crown,
      tagline: "গভীর বিশ্লেষণ",
      features: [
        "Everything in PLUS",
        "পুরানো/হাতের লেখা দলিল",
        "Hidden Clause Detection",
        "Legal References",
        "গভীর মালিকানা বিশ্লেষণ",
      ],
      bestFor: "পুরানো দলিল, জটিল কেস"
    }
  ];

  const features = [
    { icon: Zap, title: "1 Credit = 1 Page (PLUS)", desc: "সহজ হিসাব" },
    { icon: Gift, title: "5 Credits FREE", desc: "সাইন আপে ফ্রি" },
    { icon: TrendingUp, title: "Never Expires", desc: "যখন খুশি ব্যবহার করুন" },
    { icon: Users, title: "Family Friendly", desc: "একাধিক প্রপার্টি চেক করুন" }
  ];

  const faqs = [
    {
      q: "PLUS আর PRO এর মধ্যে পার্থক্য কী?",
      a: "PLUS দ্রুত AI বিশ্লেষণ দেয় (1 credit/page)। PRO গভীর বিশ্লেষণ দেয় পুরানো/হাতের লেখা দলিলের জন্য (4 credits/page)। নতুন, পরিষ্কার দলিলের জন্য PLUS যথেষ্ট।"
    },
    {
      q: "Credits কীভাবে কাজ করে?",
      a: "PLUS Analysis: 1 credit = 1 page। PRO Analysis: 4 credits = 1 page। যেমন: 5 পাতার দলিল PLUS এ 5 credits, PRO তে 20 credits লাগবে।"
    },
    {
      q: "Credits কি expire হয়?",
      a: "না। কখনো expire হয় না।"
    },
    {
      q: "এই রিপোর্ট কি আইনত গ্রহণযোগ্য?",
      a: "না। এটি আইনি মতামত বা সার্টিফিকেট নয়। এটি আপনার প্রাথমিক বুঝার জন্য একটি বিশ্লেষণ রিপোর্ট। চূড়ান্ত সিদ্ধান্তের আগে উকিলের পরামর্শ নিন।"
    },
    {
      q: "কোন ডকুমেন্ট আপলোড করতে পারি?",
      a: "সাফ কবলা, হেবা, খতিয়ান (CS, SA, RS, BS), নামজারি, DCR, ট্যাক্স রসিদ, পাওয়ার অফ অ্যাটর্নি ইত্যাদি।"
    },
    {
      q: "পুরানো হাতে লেখা দলিল পড়তে পারে?",
      a: "হ্যাঁ! PRO Analysis এ Gemini 1.5 Pro AI ব্যবহার করা হয় যা পুরানো, অস্পষ্ট হাতের লেখাও পড়তে পারে।"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-slate-800">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold mb-6 border border-brand-100">
          <Gift size={16} />
          ৫ Credits ফ্রি
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 bangla-text">দুই ধরনের বিশ্লেষণ, এক সহজ Credit System</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          আপনার প্রয়োজন অনুযায়ী PLUS বা PRO বেছে নিন
        </p>
      </div>

      {/* Analysis Tiers Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
        {analysisTiers.map((tier, idx) => (
          <div 
            key={idx}
            className={`
              relative bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-xl
              ${tier.name === 'PRO' ? 'border-purple-500 shadow-lg' : 'border-green-500'}
            `}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${tier.name === 'PRO' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                <tier.icon size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                <p className="text-sm text-slate-500 bangla-text">{tier.tagline}</p>
              </div>
            </div>

            <div className={`text-center py-4 rounded-xl mb-4 ${tier.name === 'PRO' ? 'bg-purple-50' : 'bg-green-50'}`}>
              <span className="text-4xl font-extrabold text-slate-900">{tier.creditsPerPage}</span>
              <span className="text-slate-600 ml-2">credit / page</span>
            </div>

            <ul className="space-y-3 mb-4">
              {tier.features.map((feature, fidx) => (
                <li key={fidx} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check size={16} className={tier.name === 'PRO' ? 'text-purple-500' : 'text-green-500'} />
                  <span className="bangla-text">{feature}</span>
                </li>
              ))}
            </ul>

            <div className={`text-center py-2 rounded-lg text-sm ${tier.name === 'PRO' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
              <span className="font-semibold bangla-text">Best for: {tier.bestFor}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Credit Calculator Example */}
      <div className="max-w-2xl mx-auto bg-slate-100 rounded-2xl p-6 mb-16 text-center">
        <h4 className="font-bold text-slate-800 mb-4 bangla-text">উদাহরণ: ৫ পাতার দলিল বিশ্লেষণ</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="text-green-600 font-bold text-lg">PLUS</div>
            <div className="text-3xl font-extrabold text-slate-900">5 credits</div>
            <div className="text-sm text-slate-500">5 pages × 1 credit</div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-purple-600 font-bold text-lg">PRO</div>
            <div className="text-3xl font-extrabold text-slate-900">20 credits</div>
            <div className="text-sm text-slate-500">5 pages × 4 credits</div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
        {features.map((feat, idx) => (
          <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
              <feat.icon size={20} />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{feat.title}</div>
              <div className="text-xs text-slate-500 bangla-text">{feat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Credit Packages */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 bangla-text">Credit কিনুন</h3>
        <p className="text-slate-600 bangla-text">PLUS বা PRO - যেকোনো বিশ্লেষণে ব্যবহার করুন</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
        {creditPackages.map((pkg, idx) => (
          <div 
            key={idx} 
            className={`
              relative bg-white rounded-2xl p-6 border transition-all hover:shadow-xl flex flex-col
              ${pkg.isPopular ? 'border-brand-500 shadow-lg ring-2 ring-brand-500/20 scale-105 z-10' : 'border-slate-200 shadow-sm'}
            `}
          >
            {pkg.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                <Sparkles size={12} /> Best Value
              </div>
            )}
            
            {pkg.savings && (
              <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Save {pkg.savings}
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">{pkg.name}</h3>
              <p className="text-xs text-slate-500">{pkg.desc}</p>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">৳{pkg.price}</span>
              </div>
              <div className="text-sm text-slate-500 mt-1">
                <span className="font-bold text-brand-600">{pkg.credits}</span> credits
              </div>
            </div>

            <div className="flex-1 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-slate-700">৳{pkg.perCredit}</div>
                <div className="text-xs text-slate-500">per credit</div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                PLUS: {pkg.credits} pages
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-purple-600" />
                PRO: {Math.floor(pkg.credits / 4)} pages
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What We Do - Honest & Clear */}
      <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl p-8 md:p-10 text-white mb-16">
        <h3 className="text-xl font-bold mb-6 text-center bangla-text">JomiCheck কী করে, কী করে না</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* We DO */}
          <div>
            <div className="text-green-400 font-semibold mb-4 text-sm uppercase tracking-wide">আমরা করি ✓</div>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span className="bangla-text">দলিলের লেখা পড়ি ও বিশ্লেষণ করি</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span className="bangla-text">মালিকানার ধারাবাহিকতা দেখাই</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span className="bangla-text">সমস্যা ও ঝুঁকি চিহ্নিত করি</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span className="bangla-text">সহজ বাংলায় বুঝিয়ে দিই</span>
              </li>
            </ul>
          </div>
          
          {/* We DON'T */}
          <div>
            <div className="text-amber-400 font-semibold mb-4 text-sm uppercase tracking-wide">আমরা করি না ✗</div>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="bangla-text">কাগজ/সিল আসল কিনা যাচাই</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="bangla-text">রেজিস্ট্রি অফিসে যাচাই</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="bangla-text">স্বাক্ষর সত্যতা যাচাই</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="bangla-text">আইনি সার্টিফিকেট প্রদান</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm bangla-text">
            বড় সিদ্ধান্তের আগে নিজে বোঝার জন্য একটি শক্তিশালী টুল।<br/>
            চূড়ান্ত যাচাইয়ের জন্য সাব-রেজিস্ট্রার অফিসে যান।
          </p>
        </div>
      </div>

      {/* Premium Services Section */}
      <div className="max-w-5xl mx-auto bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200 mb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Coming Soon
            </div>
            <h3 className="text-2xl font-bold text-slate-900 bangla-text">Physical Verification দরকার?</h3>
            <p className="text-slate-600 bangla-text">
              বড় লেনদেনের জন্য আমাদের পার্টনার আইনজীবীদের মাধ্যমে সরাসরি যাচাই সেবা।
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <Building2 size={20} className="text-brand-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Registry Search</h4>
                  <p className="text-xs text-slate-500 bangla-text">AC Land অফিসে যাচাই</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileSignature size={20} className="text-brand-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Lawyer Review</h4>
                  <p className="text-xs text-slate-500 bangla-text">উকিল দ্বারা পর্যালোচনা</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Languages size={20} className="text-brand-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Certificate</h4>
                  <p className="text-xs text-slate-500 bangla-text">আইনি সার্টিফিকেট</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-64 shrink-0">
            <a 
              href="mailto:support@jomicheck.com?subject=Premium Service Inquiry"
              className="flex items-center justify-center w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
            >
              Contact Us
            </a>
            <p className="text-[11px] text-center text-slate-400 mt-2 bangla-text">
              শীঘ্রই আসছে
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center bangla-text">সাধারণ প্রশ্নাবলী</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 bangla-text">
                <Info size={16} className="text-brand-600 flex-shrink-0"/> {faq.q}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed ml-6 bangla-text">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
