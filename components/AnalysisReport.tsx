
import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck, 
  FileSearch, 
  Printer, 
  Scale,
  History,
  Check,
  Lock,
  Trash2,
  Shield,
  FileQuestion,
  HelpCircle,
  Crown,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Target,
  FileText,
  MapPin,
  TrendingUp,
  Eye,
  Clock,
  ArrowRight,
  Star,
  Sparkles,
  BookOpen,
  Gavel,
  Users,
  Banknote,
  ClipboardList
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisReportProps {
  report: AnalysisResult;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ report }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pageAnalysis: true,
    riskBreakdown: true,
    redFlags: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isPro = report.proAnalysis === true;
  
  // Determine color theme based on risk level
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score < 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const riskColorClass = getRiskColor(report.riskScore);

  // Expert verdict colors
  const getVerdictColor = (recommendation?: string) => {
    if (!recommendation) return 'bg-slate-100 text-slate-700 border-slate-300';
    switch (recommendation) {
      case 'Buy': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Buy with Caution': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Negotiate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Do Not Buy': return 'bg-red-100 text-red-800 border-red-300';
      case 'Need More Documents': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Severity colors for red flags
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  // Priority colors for action items
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'Important': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Optional': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Buyer Protection Theme
  const isBuyerSafe = report.buyerProtection.verdict === 'Buyer Safe' || report.buyerProtection.verdict === 'Neutral';
  const protectionTheme = isBuyerSafe 
    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
    : 'bg-red-50 border-red-200 text-red-900';
  const protectionBadgeTheme = isBuyerSafe
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-red-100 text-red-800';

  const handlePrint = () => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="print-report bg-slate-50 font-sans" style={{ minHeight: '100%' }}>
      
      {/* Professional Header - Hidden when printing */}
      <div className="mb-8 no-print">
        {/* Top bar with badge and download */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isPro ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-xl shadow-lg">
                <Crown size={18} />
                <span className="font-bold">PRO বিশ্লেষণ</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg">
                <CheckCircle size={18} />
                <span className="font-bold">PLUS বিশ্লেষণ</span>
              </div>
            )}
            {report.modelUsed && (
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border">
                🤖 {report.modelUsed}
              </span>
            )}
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-md transition-colors"
          >
            <Printer size={16} />
            <span>রিপোর্ট ডাউনলোড</span>
          </button>
        </div>
        
        {/* Main Title Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 bangla-text mb-2">
                সম্পত্তি ঝুঁকি বিশ্লেষণ রিপোর্ট
              </h1>
              <p className="text-slate-500">
                Generated by JomiCheck AI • {new Date().toLocaleDateString('bn-BD', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-black ${report.riskScore > 60 ? 'text-red-500' : report.riskScore > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {report.riskScore}
              </div>
              <div className="text-sm text-slate-500">ঝুঁকি স্কোর</div>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="text-2xl font-bold text-slate-800">{report.documentTypes?.length || 1}</div>
              <div className="text-xs text-slate-500 bangla-text">ডকুমেন্ট</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className={`text-lg font-bold ${report.riskScore > 60 ? 'text-red-600' : report.riskScore > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {report.riskLevel}
              </div>
              <div className="text-xs text-slate-500 bangla-text">ঝুঁকির মাত্রা</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className="text-lg font-bold text-slate-800">{report.confidenceScore || 85}%</div>
              <div className="text-xs text-slate-500 bangla-text">AI কনফিডেন্স</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <div className={`text-lg font-bold ${report.isSameProperty === false ? 'text-red-600' : 'text-emerald-600'}`}>
                {report.isSameProperty === false ? 'ভিন্ন' : 'একই'}
              </div>
              <div className="text-xs text-slate-500 bangla-text">সম্পত্তি</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:flex print:items-center print:justify-between print:mb-2 print:pb-2 print:border-b print:border-green-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900">JomiCheck {isPro ? 'PRO' : ''} Report</span>
          <span className="text-xs text-slate-500">• জমি চেক রিপোর্ট</span>
        </div>
        <span className="text-xs text-slate-400">
          {new Date().toLocaleDateString('en-BD')} • www.jomicheck.com
        </span>
      </div>

      <div className="pb-10">
        
        {/* PRO: Expert Verdict Card - Top Priority */}
        {isPro && report.expertVerdict && (
          <div className={`mb-8 rounded-2xl border-2 overflow-hidden shadow-lg ${getVerdictColor(report.expertVerdict.recommendation)}`}>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/50 rounded-xl">
                    <Gavel size={28} className="text-current" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Expert Verdict</span>
                    <h3 className="text-2xl md:text-3xl font-extrabold">{report.expertVerdict.recommendation}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs opacity-70">Confidence</span>
                  <div className="text-2xl font-bold">{report.expertVerdict.confidence}%</div>
                </div>
              </div>
              <p className="text-lg bangla-text mb-4">{report.expertVerdict.summary}</p>
              {report.expertVerdict.keyReasons && report.expertVerdict.keyReasons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {report.expertVerdict.keyReasons.map((reason, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/30 rounded-full text-sm font-medium bangla-text">
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRO: Legal Advice */}
        {isPro && report.legalAdvice && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Gavel size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-indigo-800 mb-2">আইনি পরামর্শ</h3>
                <p className="text-indigo-900 bangla-text leading-relaxed">{report.legalAdvice}</p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Risk Gauge Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Risk Score</span>
              <div className={`text-6xl font-extrabold mt-3 mb-2 ${report.riskScore > 50 ? 'text-red-600' : 'text-emerald-600'}`}>
                {report.riskScore}/100
              </div>
              <div className={`inline-block px-4 py-1.5 rounded-full text-base font-bold border ${riskColorClass}`}>
                {report.riskLevel}
              </div>
              {isPro && report.confidenceScore && (
                <div className="mt-3 text-sm text-slate-500">
                  AI Confidence: <span className="font-bold">{report.confidenceScore}%</span>
                </div>
              )}
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-2 ${report.riskScore > 50 ? 'bg-red-500' : 'bg-emerald-500'} opacity-20`}></div>
          </div>

          {/* Document Chain Analysis - JomiCheck's Unique Value */}
          {report.documentTypes && report.documentTypes.length > 0 && (
            <div className={`md:col-span-3 p-4 rounded-xl border-2 ${
              report.isSameProperty === false 
                ? 'bg-red-50 border-red-300' 
                : 'bg-emerald-50 border-emerald-300'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  report.isSameProperty === false ? 'bg-red-100' : 'bg-emerald-100'
                }`}>
                  {report.isSameProperty === false ? (
                    <AlertTriangle className="text-red-600" size={20} />
                  ) : (
                    <CheckCircle className="text-emerald-600" size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    report.isSameProperty === false ? 'text-red-800' : 'text-emerald-800'
                  }`}>
                    {report.isSameProperty === false 
                      ? '⚠️ ভিন্ন সম্পত্তির ডকুমেন্ট সনাক্ত হয়েছে!' 
                      : '✓ একই সম্পত্তির সম্পর্কিত ডকুমেন্ট'}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {report.documentTypes.map((docType, idx) => (
                      <span 
                        key={idx}
                        className={`px-3 py-1 text-sm rounded-full ${
                          report.isSameProperty === false 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        📄 {docType}
                      </span>
                    ))}
                  </div>
                  {report.propertyMatchReason && (
                    <p className={`mt-2 text-sm ${
                      report.isSameProperty === false ? 'text-red-700' : 'text-emerald-700'
                    }`}>
                      {report.propertyMatchReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Document Summary - Enhanced */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileSearch size={16} /> Document Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">দলিলের ধরন</span>
                <span className="font-semibold text-sm text-slate-800 bangla-text">{report.documentType || "N/A"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">দলিল নম্বর</span>
                <span className="font-semibold text-sm text-slate-800 bangla-text">{report.summary.deedNo || "N/A"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">তারিখ</span>
                <span className="font-semibold text-sm text-slate-800 bangla-text">{report.summary.date || "N/A"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">সম্পত্তির মূল্য</span>
                <span className="font-semibold text-sm text-slate-800 bangla-text">{report.summary.propertyAmount || "N/A"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block">মৌজা</span>
                <span className="font-semibold text-sm text-slate-800 bangla-text">{report.summary.mouza || "N/A"}</span>
              </div>
              {(report.summary.thana || report.summary.district) && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 block">থানা/জেলা</span>
                  <span className="font-semibold text-sm text-slate-800 bangla-text">
                    {report.summary.thana || '-'}, {report.summary.district || '-'}
                  </span>
                </div>
              )}
              {report.summary.dagNo && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs text-blue-600 block">দাগ নম্বর</span>
                  <span className="font-semibold text-sm text-blue-800 bangla-text">{report.summary.dagNo}</span>
                </div>
              )}
              {report.summary.khatianNo && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs text-blue-600 block">খতিয়ান নম্বর</span>
                  <span className="font-semibold text-sm text-blue-800 bangla-text">{report.summary.khatianNo}</span>
                </div>
              )}
              {report.summary.landAmount && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-xs text-green-600 block">জমির পরিমাণ</span>
                  <span className="font-semibold text-sm text-green-800 bangla-text">{report.summary.landAmount}</span>
                </div>
              )}
              {report.summary.landType && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 block">জমির ধরন</span>
                  <span className="font-semibold text-sm text-slate-800 bangla-text">{report.summary.landType}</span>
                </div>
              )}
            </div>
            
            {/* Parties Section */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seller */}
              {report.summary.sellerName && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <span className="text-xs text-orange-600 font-semibold block mb-1">বিক্রেতা/দাতা</span>
                  <span className="font-semibold text-slate-800 bangla-text block">{report.summary.sellerName}</span>
                  {report.summary.sellerFather && (
                    <span className="text-xs text-slate-600 bangla-text">পিতা: {report.summary.sellerFather}</span>
                  )}
                </div>
              )}
              {/* Buyer */}
              {report.summary.buyerName && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-xs text-emerald-600 font-semibold block mb-1">ক্রেতা/গ্রহীতা</span>
                  <span className="font-semibold text-slate-800 bangla-text block">{report.summary.buyerName}</span>
                  {report.summary.buyerFather && (
                    <span className="text-xs text-slate-600 bangla-text">পিতা: {report.summary.buyerFather}</span>
                  )}
                </div>
              )}
            </div>

            {/* Property Description */}
            {report.summary.propertyDescription && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-500 block mb-1">সম্পত্তির বিবরণ</span>
                <span className="text-sm text-slate-800 bangla-text">{report.summary.propertyDescription}</span>
              </div>
            )}
            
            {/* Boundaries - Show for both PLUS and PRO */}
            {report.summary.boundaries && (report.summary.boundaries.north || report.summary.boundaries.south) && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <span className="text-xs text-indigo-600 font-semibold block mb-2 flex items-center gap-1">
                  <MapPin size={12} /> চৌহদ্দি (Boundaries)
                </span>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">উত্তর:</span> <span className="bangla-text font-medium">{report.summary.boundaries.north || '-'}</span></div>
                  <div><span className="text-slate-500">দক্ষিণ:</span> <span className="bangla-text font-medium">{report.summary.boundaries.south || '-'}</span></div>
                  <div><span className="text-slate-500">পূর্ব:</span> <span className="bangla-text font-medium">{report.summary.boundaries.east || '-'}</span></div>
                  <div><span className="text-slate-500">পশ্চিম:</span> <span className="bangla-text font-medium">{report.summary.boundaries.west || '-'}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRO: Risk Breakdown by Category */}
        {isPro && report.riskBreakdown && (
          <div className="mb-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleSection('riskBreakdown')}
              className="w-full px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target size={20} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Risk Breakdown by Category</h3>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">PRO</span>
              </div>
              {expandedSections.riskBreakdown ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.riskBreakdown && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Legal */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Scale size={18} className="text-blue-600" />
                      <span className="font-bold text-slate-800">আইনগত</span>
                    </div>
                    <div className="text-3xl font-extrabold text-blue-600 mb-2">{report.riskBreakdown.legal?.score || 0}</div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${report.riskBreakdown.legal?.score || 0}%` }}
                      />
                    </div>
                    {report.riskBreakdown.legal?.issues?.length > 0 && (
                      <ul className="text-xs text-slate-600 space-y-1">
                        {report.riskBreakdown.legal.issues.slice(0, 2).map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1 bangla-text">
                            <span className="text-blue-500 mt-0.5">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Ownership */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={18} className="text-green-600" />
                      <span className="font-bold text-slate-800">মালিকানা</span>
                    </div>
                    <div className="text-3xl font-extrabold text-green-600 mb-2">{report.riskBreakdown.ownership?.score || 0}</div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-green-600 rounded-full transition-all"
                        style={{ width: `${report.riskBreakdown.ownership?.score || 0}%` }}
                      />
                    </div>
                    {report.riskBreakdown.ownership?.issues?.length > 0 && (
                      <ul className="text-xs text-slate-600 space-y-1">
                        {report.riskBreakdown.ownership.issues.slice(0, 2).map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1 bangla-text">
                            <span className="text-green-500 mt-0.5">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Documentation */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={18} className="text-amber-600" />
                      <span className="font-bold text-slate-800">ডকুমেন্ট</span>
                    </div>
                    <div className="text-3xl font-extrabold text-amber-600 mb-2">{report.riskBreakdown.documentation?.score || report.riskBreakdown.financial?.score || 0}</div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-amber-600 rounded-full transition-all"
                        style={{ width: `${report.riskBreakdown.documentation?.score || report.riskBreakdown.financial?.score || 0}%` }}
                      />
                    </div>
                    {(report.riskBreakdown.documentation?.issues?.length > 0 || report.riskBreakdown.financial?.issues?.length > 0) && (
                      <ul className="text-xs text-slate-600 space-y-1">
                        {(report.riskBreakdown.documentation?.issues || report.riskBreakdown.financial?.issues || []).slice(0, 2).map((issue: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1 bangla-text">
                            <span className="text-amber-500 mt-0.5">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Possession */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={18} className="text-purple-600" />
                      <span className="font-bold text-slate-800">দখল</span>
                    </div>
                    <div className="text-3xl font-extrabold text-purple-600 mb-2">{report.riskBreakdown.possession?.score || report.riskBreakdown.procedural?.score || 0}</div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all"
                        style={{ width: `${report.riskBreakdown.possession?.score || report.riskBreakdown.procedural?.score || 0}%` }}
                      />
                    </div>
                    {(report.riskBreakdown.possession?.issues?.length > 0 || report.riskBreakdown.procedural?.issues?.length > 0) && (
                      <ul className="text-xs text-slate-600 space-y-1">
                        {(report.riskBreakdown.possession?.issues || report.riskBreakdown.procedural?.issues || []).slice(0, 2).map((issue: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1 bangla-text">
                            <span className="text-purple-500 mt-0.5">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRO: Red Flags */}
        {isPro && report.redFlags && report.redFlags.length > 0 && (
          <div className="mb-8 bg-white rounded-xl border-2 border-red-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleSection('redFlags')}
              className="w-full px-6 py-4 border-b border-red-200 flex items-center justify-between bg-red-50 hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertOctagon size={20} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-800">Red Flags ({report.redFlags.length})</h3>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">PRO</span>
              </div>
              {expandedSections.redFlags ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.redFlags && (
              <div className="p-6 space-y-4">
                {report.redFlags.map((flag, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getSeverityColor(flag.severity)}`}>
                        {flag.severity}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 bangla-text">{flag.title}</h4>
                        <p className="text-sm text-slate-600 mt-1 bangla-text">{flag.description}</p>
                        {flag.pageReference && (
                          <span className="inline-block mt-2 text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            📄 {flag.pageReference}
                          </span>
                        )}
                        {flag.recommendation && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-800 bangla-text">
                            <strong>পরামর্শ:</strong> {flag.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRO: Page-by-Page Analysis - PROMINENT SECTION */}
        {isPro && report.pageByPageAnalysis && report.pageByPageAnalysis.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl border-2 border-indigo-200 shadow-lg overflow-hidden">
            <button 
              onClick={() => toggleSection('pageAnalysis')}
              className="w-full px-6 py-5 border-b-2 border-indigo-200 flex items-center justify-between bg-gradient-to-r from-indigo-100 via-purple-50 to-blue-100 hover:from-indigo-200 hover:to-blue-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl shadow-md">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 bangla-text">পৃষ্ঠা-ভিত্তিক বিশ্লেষণ</h3>
                  <p className="text-sm text-slate-600">{report.pageByPageAnalysis.length} পৃষ্ঠা বিশ্লেষণ করা হয়েছে</p>
                </div>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow">PRO</span>
              </div>
              {expandedSections.pageAnalysis ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            {expandedSections.pageAnalysis && (
              <div className="p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
                {report.pageByPageAnalysis.map((page, idx) => (
                  <div key={idx} className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                          {page.pageNumber}
                        </div>
                        <div>
                          <span className="text-lg font-bold text-slate-800 bangla-text">{page.pageType}</span>
                          <p className="text-sm text-slate-500">পৃষ্ঠা {page.pageNumber}</p>
                        </div>
                      </div>
                      {page.readabilityScore !== undefined && (
                        <div className={`px-3 py-2 rounded-lg text-center ${
                          page.readabilityScore > 70 ? 'bg-green-100 border border-green-200' :
                          page.readabilityScore > 40 ? 'bg-yellow-100 border border-yellow-200' :
                          'bg-red-100 border border-red-200'
                        }`}>
                          <div className={`text-xl font-bold ${
                            page.readabilityScore > 70 ? 'text-green-700' :
                            page.readabilityScore > 40 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>{page.readabilityScore}%</div>
                          <div className="text-xs text-slate-600">পাঠযোগ্যতা</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Extracted Data */}
                    {page.extractedData && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                          <Eye size={14} />
                          নিষ্কাশিত তথ্য
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {page.extractedData.names && page.extractedData.names.length > 0 && (
                            <div>
                              <span className="text-blue-600 font-medium">নাম:</span>
                              <span className="text-slate-700 ml-2 bangla-text">{page.extractedData.names.join(', ')}</span>
                            </div>
                          )}
                          {page.extractedData.dates && page.extractedData.dates.length > 0 && (
                            <div>
                              <span className="text-blue-600 font-medium">তারিখ:</span>
                              <span className="text-slate-700 ml-2 bangla-text">{page.extractedData.dates.join(', ')}</span>
                            </div>
                          )}
                          {page.extractedData.amounts && page.extractedData.amounts.length > 0 && (
                            <div>
                              <span className="text-blue-600 font-medium">পরিমাণ:</span>
                              <span className="text-slate-700 ml-2 bangla-text">{page.extractedData.amounts.join(', ')}</span>
                            </div>
                          )}
                          {page.extractedData.dagKhatian && (
                            <div>
                              <span className="text-blue-600 font-medium">দাগ/খতিয়ান:</span>
                              <span className="text-slate-700 ml-2 bangla-text">{page.extractedData.dagKhatian}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Key Findings */}
                    {page.keyFindings && page.keyFindings.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Key Findings:</span>
                        <ul className="mt-1 space-y-1">
                          {page.keyFindings.map((finding, fidx) => (
                            <li key={fidx} className="text-sm text-slate-700 flex items-start gap-2 bangla-text">
                              <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {page.issues && page.issues.length > 0 && (
                      <div className="p-2 bg-red-50 rounded-lg">
                        <span className="text-xs font-semibold text-red-600 uppercase">Issues:</span>
                        <ul className="mt-1 space-y-1">
                          {page.issues.map((issue, iidx) => (
                            <li key={iidx} className="text-sm text-red-700 flex items-start gap-2 bangla-text">
                              <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRO: Standard Comparison */}
        {isPro && report.standardComparison && (
          <div className="mb-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
              <BookOpen size={20} className="text-slate-600" />
              <h3 className="text-xl font-bold text-slate-800">Standard Comparison</h3>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">PRO</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Present */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} /> আছে ✓
                  </h4>
                  <ul className="space-y-1">
                    {report.standardComparison.presentItems?.map((item, idx) => (
                      <li key={idx} className="text-sm text-emerald-700 bangla-text">• {item}</li>
                    ))}
                  </ul>
                </div>
                {/* Missing */}
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <XCircle size={16} /> নেই ✗
                  </h4>
                  <ul className="space-y-1">
                    {report.standardComparison.missingItems?.map((item, idx) => (
                      <li key={idx} className="text-sm text-red-700 bangla-text">• {item}</li>
                    ))}
                  </ul>
                </div>
                {/* Unusual */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} /> অস্বাভাবিক ⚠
                  </h4>
                  <ul className="space-y-1">
                    {report.standardComparison.unusualItems?.map((item, idx) => (
                      <li key={idx} className="text-sm text-amber-700 bangla-text">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {report.standardComparison.comparisonNote && (
                <div className="p-4 bg-slate-100 rounded-lg text-sm text-slate-700 bangla-text">
                  <strong>Note:</strong> {report.standardComparison.comparisonNote}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Critical Issues */}
        {report.criticalIssues.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-red-100/50 px-6 py-4 border-b border-red-200 flex items-center gap-3">
              <ShieldAlert className="text-red-600" size={24} />
              <h3 className="text-xl font-bold text-red-800">What to Fix</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {report.criticalIssues.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-red-900 font-medium text-base bangla-text">
                    <XCircle className="shrink-0 mt-0.5 text-red-500" size={20} />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* What is Missing */}
        {report.missingInfo && report.missingInfo.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-blue-100/50 px-6 py-4 border-b border-blue-200 flex items-center gap-3">
              <FileQuestion className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-blue-800">What is Missing</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {report.missingInfo.map((info, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-blue-900 font-medium text-base bangla-text">
                    <HelpCircle className="shrink-0 mt-0.5 text-blue-500" size={20} />
                    {info}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Good vs Bad Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/50 flex items-center gap-2">
              <CheckCircle className="text-emerald-600" size={20} />
              <h3 className="font-bold text-lg text-slate-800">What is Good</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {report.goodPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 text-base bangla-text">
                    <div className="bg-emerald-100 text-emerald-600 rounded-full p-0.5 mt-0.5 shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    {point}
                  </li>
                ))}
                {report.goodPoints.length === 0 && <span className="text-slate-400 text-sm italic">No significant strengths found.</span>}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-orange-50/50 flex items-center gap-2">
              <AlertTriangle className="text-orange-600" size={20} />
              <h3 className="font-bold text-lg text-slate-800">What is Bad</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {report.badPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 text-base bangla-text">
                    <span className="mt-2 w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                    {point}
                  </li>
                ))}
                {report.badPoints.length === 0 && <span className="text-slate-400 text-sm italic">No minor issues found.</span>}
              </ul>
            </div>
          </div>
        </div>

        {/* PRO: Action Items */}
        {isPro && report.actionItems && report.actionItems.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ClipboardList size={24} />
              Action Items
              <span className="px-2 py-0.5 bg-white/20 text-xs font-bold rounded">PRO</span>
            </h3>
            <div className="space-y-3">
              {report.actionItems.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${getPriorityColor(item.priority)} bg-white text-slate-800`}>
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      item.priority === 'Urgent' ? 'bg-red-600 text-white' :
                      item.priority === 'Important' ? 'bg-orange-500 text-white' :
                      'bg-slate-400 text-white'
                    }`}>
                      {item.priority}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold bangla-text">{item.action}</p>
                      <p className="text-sm text-slate-600 mt-1 bangla-text">{item.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRO: Documents Needed */}
        {isPro && report.documentsNeeded && report.documentsNeeded.length > 0 && (
          <div className="mb-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-blue-50 flex items-center gap-3">
              <FileSearch size={20} className="text-blue-600" />
              <h3 className="text-xl font-bold text-slate-800">Documents Needed</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">PRO</span>
            </div>
            <div className="p-6 space-y-3">
              {report.documentsNeeded.map((doc, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    doc.priority === 'Essential' ? 'bg-red-100 text-red-700' :
                    doc.priority === 'Recommended' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {doc.priority}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 bangla-text">{doc.document}</p>
                    <p className="text-sm text-slate-600 mt-1 bangla-text">{doc.purpose}</p>
                    {doc.whereToGet && (
                      <p className="text-xs text-blue-600 mt-1 bangla-text">📍 {doc.whereToGet}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chain of Title & Buyer Protection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Chain of Title */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <History size={20} className="text-indigo-600"/> 
              Chain of Title (মালিকানা ইতিহাস)
            </h3>
            
            <div className="mb-6 relative border-l-2 border-indigo-200 ml-2.5 my-2 space-y-8">
              {(isPro && report.chainOfTitle?.timeline ? report.chainOfTitle.timeline : report.chainOfTitleTimeline)?.map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 bg-indigo-100 border-2 border-indigo-500 rounded-full"></span>
                  <span className="text-sm font-bold text-indigo-600 block mb-0.5">{item.date}</span>
                  <span className="text-base text-slate-800 bangla-text leading-tight block font-medium">{item.event}</span>
                  {isPro && 'from' in item && item.from && (
                    <span className="text-xs text-slate-500 block mt-1">
                      {item.from} → {item.to}
                    </span>
                  )}
                </div>
              )) || (
                <div className="pl-6 text-sm text-slate-400 italic">Timeline data not available.</div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200">
              <p className="text-base text-slate-600 leading-relaxed bangla-text text-justify">
                {isPro && report.chainOfTitle?.analysis ? report.chainOfTitle.analysis : report.chainOfTitleAnalysis}
              </p>
              {isPro && report.chainOfTitle?.gaps && report.chainOfTitle.gaps.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-xs font-bold text-amber-700 uppercase">Gaps Found:</span>
                  <ul className="mt-1">
                    {report.chainOfTitle.gaps.map((gap, idx) => (
                      <li key={idx} className="text-sm text-amber-800 bangla-text">• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Buyer Fairness Check */}
          <div className={`rounded-xl border p-6 ${protectionTheme}`}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              {isBuyerSafe ? (
                <ShieldCheck size={20} className="text-emerald-600"/>
              ) : (
                <ShieldAlert size={20} className="text-red-600"/>
              )}
              Buyer Fairness Check
            </h3>
            <div className="mb-4 flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded text-sm font-bold uppercase tracking-wide ${protectionBadgeTheme}`}>
                {report.buyerProtection.verdict}
              </span>
              {isPro && report.buyerProtection.score !== undefined && (
                <span className="text-sm">Score: <strong>{report.buyerProtection.score}/100</strong></span>
              )}
            </div>
            <p className="text-base leading-relaxed bangla-text mb-4">
              {report.buyerProtection.details}
            </p>
            {isPro && report.buyerProtection.protectionClauses && report.buyerProtection.protectionClauses.length > 0 && (
              <div className="mt-4 p-3 bg-white/50 rounded-lg">
                <span className="text-xs font-bold text-emerald-700 uppercase">Protection Clauses:</span>
                <ul className="mt-1 space-y-1">
                  {report.buyerProtection.protectionClauses.map((clause, idx) => (
                    <li key={idx} className="text-sm bangla-text flex items-start gap-1">
                      <Check size={14} className="text-emerald-600 mt-0.5" /> {clause}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isPro && report.buyerProtection.riskClauses && report.buyerProtection.riskClauses.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <span className="text-xs font-bold text-red-700 uppercase">Risk Clauses:</span>
                <ul className="mt-1 space-y-1">
                  {report.buyerProtection.riskClauses.map((clause, idx) => (
                    <li key={idx} className="text-sm text-red-800 bangla-text flex items-start gap-1">
                      <AlertTriangle size={14} className="text-red-600 mt-0.5" /> {clause}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* PRO: Legal Clauses Analysis */}
        {isPro && report.legalClausesAnalysis && report.legalClausesAnalysis.length > 0 && (
          <div className="mb-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <Scale className="text-slate-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Legal Clauses Analysis</h3>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">PRO</span>
            </div>
            <div className="p-6 space-y-4">
              {report.legalClausesAnalysis.map((clause, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    {clause.clauseNumber && (
                      <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                        {clause.clauseNumber}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      clause.buyerImpact === 'Favorable' ? 'bg-green-100 text-green-700' :
                      clause.buyerImpact === 'Unfavorable' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {clause.buyerImpact === 'Favorable' ? '✓ ক্রেতার পক্ষে' :
                       clause.buyerImpact === 'Unfavorable' ? '⚠ ক্রেতার বিপক্ষে' :
                       '○ নিরপেক্ষ'}
                    </span>
                  </div>
                  {clause.originalText && (
                    <p className="text-sm text-slate-500 italic mb-2 bangla-text">"{clause.originalText}"</p>
                  )}
                  <p className="text-base text-slate-800 bangla-text">
                    <strong>সহজ অর্থ:</strong> {clause.simpleMeaning}
                  </p>
                  {clause.warning && (
                    <p className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded bangla-text">
                      ⚠️ {clause.warning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hidden Risks - Show as simple list for PLUS, detailed for PRO */}
        {report.hiddenRisks && report.hiddenRisks.length > 0 && (
          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-purple-100/50 px-6 py-4 border-b border-purple-200 flex items-center gap-3">
              <AlertTriangle className="text-purple-600" size={24} />
              <h3 className="text-xl font-bold text-purple-800">লুকানো ঝুঁকি (Hidden Risks)</h3>
            </div>
            <div className="p-6">
              {isPro && typeof report.hiddenRisks[0] === 'object' ? (
                <div className="space-y-4">
                  {(report.hiddenRisks as any[]).map((risk, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-purple-200">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-purple-900 bangla-text">{risk.risk}</span>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            risk.probability === 'High' ? 'bg-red-100 text-red-700' :
                            risk.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            সম্ভাবনা: {risk.probability}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            risk.impact === 'High' ? 'bg-red-100 text-red-700' :
                            risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            প্রভাব: {risk.impact}
                          </span>
                        </div>
                      </div>
                      {risk.mitigation && (
                        <p className="text-sm text-purple-700 bg-purple-50 p-2 rounded bangla-text">
                          <strong>প্রতিকার:</strong> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-4">
                  {(report.hiddenRisks as string[]).map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-purple-900 font-medium text-base bangla-text">
                      <AlertTriangle className="shrink-0 mt-0.5 text-purple-500" size={20} />
                      {risk}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Legacy Legal Clauses (for PLUS) */}
        {!isPro && report.legalClauses && report.legalClauses.length > 0 && (
          <div className="mb-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <Scale className="text-slate-600" size={24} />
              <h3 className="text-xl font-bold text-slate-800">গুরুত্বপূর্ণ শর্তাবলী</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {report.legalClauses.map((clause, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 text-base bangla-text p-3 bg-slate-50 rounded-lg">
                    <span className="bg-slate-200 text-slate-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-sm font-bold">
                      {idx + 1}
                    </span>
                    {clause}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Suggestions for Improvement */}
        <div className="bg-slate-900 rounded-xl p-6 md:p-8 text-white shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ShieldCheck size={28} className="text-emerald-400" />
            Suggestions for Improvement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white/10 p-4 rounded-lg border border-white/10">
                <div className="bg-brand-500 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-sm font-bold text-white">
                  {idx + 1}
                </div>
                <span className="text-base text-slate-200 bangla-text">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Privacy */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield size={18} className="text-slate-400" />
            Trust & Privacy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 rounded-full text-slate-500">
                <Lock size={18} />
              </div>
              <span className="text-sm text-slate-600 font-medium">Your documents are encrypted.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 rounded-full text-slate-500">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm text-slate-600 font-medium">We never sell or share your deeds.</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-50 rounded-full text-slate-500">
                <Trash2 size={18} />
              </div>
              <span className="text-sm text-slate-600 font-medium">Delete any document from your account anytime.</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 max-w-2xl mx-auto bangla-text leading-relaxed">
            <strong>Disclaimer:</strong> This report is generated by AI based on the documents provided. It does not constitute a final legal opinion. Always verify the physical records at the local AC Land and Registry office before financial transaction.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AnalysisReport;
