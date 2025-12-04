import React from 'react';
import { Check, Info, Building2, FileSignature, Languages, Gift, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';

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
      q: "How do credits work?",
      a: "1 credit = 1 page of document analysis. Upload your documents, and credits are deducted based on page count. Images count as 1 page, PDFs are estimated at 5 pages each."
    },
    {
      q: "Do I get free credits?",
      a: "Yes! Every new user gets 5 FREE pages to try our service. No credit card required. Experience the full analysis before purchasing."
    },
    {
      q: "Do credits expire?",
      a: "No! Your credits never expire. Buy once, use whenever you need. Perfect for future property purchases."
    },
    {
      q: "Can I get a refund?",
      a: "If you're not satisfied with your first analysis, contact us within 24 hours for a full refund. We're confident you'll love the results."
    },
    {
      q: "Is this report legally binding?",
      a: "No. JomiCheck provides a risk assessment for your awareness. For final legal validation and registry checks, you must consult a lawyer or the AC Land office. We give you the checklist of WHAT to verify."
    },
    {
      q: "What documents can I upload?",
      a: "We support all major Bangladeshi land documents including Saf Kabala, Heba, Khatian (CS, SA, RS, BS), Namjari (Mutation), DCR, Tax Receipts (Khajna), and Power of Attorney."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-slate-800">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-semibold mb-6 border border-brand-100">
          <Gift size={16} />
          5 Pages FREE for New Users!
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple Credit-Based Pricing</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Buy credits, use anytime. No subscriptions. No expiry. <br/>
          <span className="text-brand-600 font-semibold">1 credit = 1 page analyzed</span>
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

      {/* Comparison Section */}
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white mb-16 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Choose JomiCheck?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-brand-400 mb-2">৳399</div>
              <div className="text-sm text-slate-300 mb-1">JomiCheck (50 pages)</div>
              <div className="text-xs text-slate-400">Instant Results</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">৳5,000+</div>
              <div className="text-sm text-slate-300 mb-1">Local Lawyer</div>
              <div className="text-xs text-slate-400">3-7 Days Wait</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">৳500+</div>
              <div className="text-sm text-slate-300 mb-1">Registry Visit</div>
              <div className="text-xs text-slate-400">Half Day + Travel</div>
            </div>
          </div>
          
          <p className="text-center text-sm text-slate-400 mt-6">
            Save money AND time. Get lawyer-quality analysis in 2 minutes.
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
