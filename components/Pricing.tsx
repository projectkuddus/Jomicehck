import React from 'react';
import { Check, Info, Building2, FileSignature, Languages } from 'lucide-react';

const Pricing: React.FC = () => {
  const tiers = [
    {
      name: "Lite",
      pages: "Up to 6 pages",
      price: "500",
      desc: "For simple, single documents.",
      features: [
        "Full Bangla Risk Report",
        "Basic Clause Check",
        "Risk Score & Meter",
        "PDF Download"
      ],
      idealFor: "Draft Deeds, Mutation Copies"
    },
    {
      name: "Standard",
      pages: "7–20 pages",
      price: "1,500",
      desc: "For complete deeds & history.",
      isPopular: true,
      features: [
        "Everything in Lite",
        "Chain of Title Analysis",
        "Vested Property Check",
        "Detailed 'Must Fix' List",
        "Buyer Fairness Verdict"
      ],
      idealFor: "Registered Deeds + Khatian"
    },
    {
      name: "Deep / Developer",
      pages: "21+ pages",
      price: "3,000+",
      desc: "For complex, multi-doc deals.",
      features: [
        "Everything in Standard",
        "Multiple Document Correlation",
        "Power of Attorney Verification",
        "Complex Warish Analysis",
        "Priority Processing"
      ],
      idealFor: "Full Property Files, Developer Projects"
    }
  ];

  const faqs = [
    {
      q: "How is the page count calculated?",
      a: "Each image file counts as 1 page. Each PDF file is estimated as 5 pages. This helps us calculate complexity. You can combine multiple files in one check."
    },
    {
      q: "Is this report legally binding?",
      a: "No. JomiCheck provides a risk assessment for your awareness. For final legal validation and registry checks, you must consult a lawyer or the AC Land office. We give you the checklist of WHAT to verify."
    },
    {
      q: "What documents can I upload?",
      a: "We support all major Bangladeshi land documents including Saf Kabala, Heba, Khatian (CS, SA, RS, BS), Namjari (Mutation), DCR, Tax Receipts (Khajna), and Power of Attorney."
    },
    {
      q: "Is my data secure?",
      a: "Yes. Your documents are processed via encrypted connections and are not shared with third parties. We are a privacy-first platform, and you can request data deletion at any time."
    },
    {
      q: "Can you detect fake documents?",
      a: "We detect logical errors, missing legal clauses, and format inconsistencies that often indicate forgery. However, we cannot physically verify the seal or paper quality. We recommend verifying the Volume/Page number at the Registry office."
    },
    {
      q: "Do you check for Vested Property issues?",
      a: "Yes. Our AI analyzes the Chain of Title to identify potential Vested Property (Arpita Sompotti) risks, especially looking for gaps in ownership transfer involving minority communities."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-slate-800">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Transparent Pricing</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Pay per check. No subscriptions. No hidden fees. <br/>
          We estimate the cost automatically based on your document size.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {tiers.map((tier, idx) => (
          <div 
            key={idx} 
            className={`
              relative bg-white rounded-2xl p-8 border transition-all hover:shadow-xl flex flex-col
              ${tier.isPopular ? 'border-brand-500 shadow-lg ring-1 ring-brand-500 scale-105 z-10' : 'border-slate-200 shadow-sm'}
            `}
          >
            {tier.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
              <p className="text-sm text-slate-500 font-medium mb-4">{tier.pages}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">৳{tier.price}</span>
                <span className="text-slate-500">/check</span>
              </div>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                {tier.desc}
              </p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
               <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Includes</div>
               {tier.features.map((feat, fIdx) => (
                 <div key={fIdx} className="flex items-start gap-3 text-sm text-slate-700">
                   <div className="mt-0.5 p-0.5 rounded-full bg-brand-50 text-brand-600">
                     <Check size={12} strokeWidth={3} />
                   </div>
                   {feat}
                 </div>
               ))}
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-center text-xs text-slate-600 font-medium">
               Ideal for: {tier.idealFor}
            </div>
          </div>
        ))}
      </div>

      {/* Premium Services Section */}
      <div className="mt-20 max-w-5xl mx-auto bg-slate-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600 rounded-full blur-[120px] opacity-20 pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-brand-500/30">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                Premium Hybrid Services
              </div>
              <h3 className="text-3xl font-bold mb-4">Need Physical Verification or Legal Stamp?</h3>
              <p className="text-slate-300 text-lg leading-relaxed">
                Our AI is world-class, but for high-stakes deals, you might need human intervention. 
                We offer manual verification services upon request.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="bg-brand-500/20 w-10 h-10 rounded-lg flex items-center justify-center text-brand-400 mb-3">
                   <Building2 size={20} />
                 </div>
                 <h4 className="font-bold text-white mb-1">Registry Search</h4>
                 <p className="text-xs text-slate-400 leading-snug">Physical check at AC Land office to verify volume/page existence.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="bg-brand-500/20 w-10 h-10 rounded-lg flex items-center justify-center text-brand-400 mb-3">
                   <FileSignature size={20} />
                 </div>
                 <h4 className="font-bold text-white mb-1">Lawyer Review</h4>
                 <p className="text-xs text-slate-400 leading-snug">Review & Digital Signature by a Supreme Court Advocate.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                 <div className="bg-brand-500/20 w-10 h-10 rounded-lg flex items-center justify-center text-brand-400 mb-3">
                   <Languages size={20} />
                 </div>
                 <h4 className="font-bold text-white mb-1">Translation</h4>
                 <p className="text-xs text-slate-400 leading-snug">Certified English translation for banks & embassies.</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white p-6 rounded-xl text-slate-900 shadow-xl shrink-0">
             <h4 className="text-xl font-bold mb-2">Request a Quote</h4>
             <p className="text-slate-500 text-sm mb-6">These services are handled manually by our partner law firms.</p>
             <a 
               href="mailto:support@jomicheck.com?subject=Inquiry about Premium Verification Services"
               className="flex items-center justify-center w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition-colors gap-2"
             >
               Email Us
             </a>
             <p className="text-[10px] text-center text-slate-400 mt-3">
               Subject: Inquiry about Premium Verification
             </p>
          </div>
        </div>
      </div>

      <div className="mt-20 max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h3>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
               <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                 <Info size={18} className="text-brand-600 flex-shrink-0"/> {faq.q}
               </h4>
               <p className="text-slate-600 text-sm leading-relaxed ml-7">
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