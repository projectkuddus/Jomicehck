import React from 'react';
import { Check, X, Info, Building2, FileSignature, Languages, Gift, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

const Pricing: React.FC = () => {
  const creditPackages = [
    {
      name: "Starter",
      credits: 20,
      price: "199",
      perPage: "10",
      desc: "Perfect for first-time users",
      color: "slate"
    },
    {
      name: "Popular",
      credits: 50,
      price: "399",
      perPage: "8",
      savings: "20%",
      desc: "Best value for most buyers",
      isPopular: true,
      color: "brand"
    },
    {
      name: "Pro",
      credits: 100,
      price: "699",
      perPage: "7",
      savings: "30%",
      desc: "For multiple properties",
      color: "blue"
    },
    {
      name: "Agent",
      credits: 250,
      price: "1,499",
      perPage: "6",
      savings: "40%",
      desc: "For real estate professionals",
      color: "purple"
    }
  ];

  const features = [
    { icon: Zap, title: "1 Credit = 1 Page", desc: "Simple, transparent pricing" },
    { icon: Gift, title: "5 Pages FREE", desc: "Try before you buy" },
    { icon: TrendingUp, title: "Never Expires", desc: "Use credits anytime" },
    { icon: Users, title: "Share with Family", desc: "One account, multiple properties" }
  ];

  const faqs = [
    {
      q: "What does JomiCheck do?",
      a: "We read the text in your property documents and create a structured report. We identify missing information, check ownership chain from what's written, and flag potential issues. We output everything in Bangla."
    },
    {
      q: "What can't JomiCheck do?",
      a: "We cannot verify if the physical document is real. We cannot check registry records. We cannot confirm signatures are authentic. We only analyze what's written in the text."
    },
    {
      q: "How do credits work?",
      a: "1 credit = 1 page. Images count as 1 page. PDFs are estimated at 5 pages. New users get 5 free pages to try."
    },
    {
      q: "Do credits expire?",
      a: "No. Use them whenever."
    },
    {
      q: "Is this report legally valid?",
      a: "No. This is not a legal opinion or certificate. It's an analysis report for your reference. For legal matters, consult a lawyer."
    },
    {
      q: "What documents can I upload?",
      a: "Saf Kabala, Heba, Khatian (CS, SA, RS, BS), Namjari, DCR, Tax Receipts, Power of Attorney, and similar land documents."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-slate-800">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold mb-6 border border-brand-100">
          <Gift size={16} />
          Try 5 Pages Free
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Read Your Deed Before You Sign</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Upload your property documents. Get a structured Bangla report.<br/>
          <span className="text-slate-500">Know what's written before you commit.</span>
        </p>
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
              <div className="text-xs text-slate-500">{feat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Credit Packages */}
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
                <div className="text-2xl font-bold text-slate-700">৳{pkg.perPage}</div>
                <div className="text-xs text-slate-500">per page</div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-brand-600" />
                Full Bangla Report
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-brand-600" />
                AI Chat Assistant
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-brand-600" />
                Risk Score & Analysis
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What We Do - Honest & Clear */}
      <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl p-8 md:p-10 text-white mb-16">
        <h3 className="text-xl font-bold mb-6 text-center">What JomiCheck Does</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* We DO */}
          <div>
            <div className="text-green-400 font-semibold mb-4 text-sm uppercase tracking-wide">We Read & Analyze</div>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Text written in your documents</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Ownership chain from document text</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Missing dates, names, boundaries</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Clause inconsistencies</span>
              </li>
            </ul>
          </div>
          
          {/* We DON'T */}
          <div>
            <div className="text-amber-400 font-semibold mb-4 text-sm uppercase tracking-wide">We Cannot Verify</div>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span>If the paper/seal is real</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span>Registry office records</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span>Physical property status</span>
              </li>
              <li className="flex items-start gap-2">
                <X size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span>Signature authenticity</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            We read what's written in your deed. That's it. <br/>
            For physical verification, visit the Sub-Registrar office.
          </p>
        </div>
      </div>

      {/* Premium Services Section */}
      <div className="max-w-5xl mx-auto bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-200 mb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Premium Services
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Need Physical Verification?</h3>
            <p className="text-slate-600">
              For high-stakes deals, we offer manual verification services through our partner law firms.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <Building2 size={20} className="text-brand-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Registry Search</h4>
                  <p className="text-xs text-slate-500">Physical verification at AC Land office</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileSignature size={20} className="text-brand-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Lawyer Review</h4>
                  <p className="text-xs text-slate-500">Supreme Court Advocate review</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Languages size={20} className="text-brand-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Translation</h4>
                  <p className="text-xs text-slate-500">Certified English translation</p>
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
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Custom quotes available
            </p>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Info size={16} className="text-brand-600 flex-shrink-0"/> {faq.q}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed ml-6">
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
