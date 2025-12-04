
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, FileText, PenTool, AlertTriangle, Sparkles, Gavel, ScrollText } from 'lucide-react';
import { AnalysisResult } from '../types';
import { startChatSession, sendMessageToAI } from '../services/geminiService';

interface ChatInterfaceProps {
  analysisResult: AnalysisResult;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ analysisResult }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: `Hello! I have analyzed your ${analysisResult.documentType}. \n\nI can help you:\n1. Explain any critical issues found.\n2. Draft a "Broma Songshodhon" (Correction Deed).\n3. Prepare a better "Bayna Nama" draft.\n\nWhat would you like to do?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session with context
    const initChat = async () => {
      try {
        await startChatSession(analysisResult);
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    };
    initChat();
  }, [analysisResult]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: 'user', text } as Message];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToAI(text);
      setMessages([...newMessages, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let prompt = "";
    switch (action) {
      case 'draft_correction':
        prompt = "Draft a 'Broma Songshodhon' (Deed of Rectification) outline. Specifically list the errors found in the analysis (like names, mouza, or amounts) and write the corrected versions in standard Bangla legal format.";
        break;
      case 'explain_risk':
        prompt = "Explain the 'Critical Issues' you found in simple language. Why are they dangerous for me as a buyer? What could happen if I ignore them?";
        break;
      case 'draft_bayna':
        prompt = "Draft a strong, buyer-protected 'Bayna Nama' (Agreement for Sale) in Bangla. Include clauses for: 1. Refund with penalty if documents are fake. 2. Specific deadline for registration. 3. Seller's guarantee of no hidden mortgages.";
        break;
      case 'draft_notice':
        prompt = "Draft a formal Legal Notice (Ukili Notish) in Bangla to the seller. Demand the missing documents and correction of the specific errors found in the analysis before we proceed with the payment.";
        break;
      case 'draft_saf_kabala':
        prompt = "Draft the 'Topsil' (Schedule) and 'Indemnity Clauses' for the final Saf Kabala (Sale Deed). Ensure it explicitly states the seller will be liable for any future claims on this property.";
        break;
      case 'list_missing':
        prompt = "Create a checklist of all the missing documents or information I need to ask the seller for immediately.";
        break;
      default:
        return;
    }
    handleSend(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      {/* Quick Actions Toolbar */}
      <div className="bg-white border-b border-slate-200 p-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
           <button 
             onClick={() => handleQuickAction('explain_risk')}
             className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100 hover:bg-red-100 transition-colors"
           >
             <AlertTriangle size={14} /> Explain Risks
           </button>
           <button 
             onClick={() => handleQuickAction('draft_correction')}
             className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
           >
             <PenTool size={14} /> Draft Correction
           </button>
           <button 
             onClick={() => handleQuickAction('draft_bayna')}
             className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
           >
             <FileText size={14} /> Buyer-Safe Bayna
           </button>
           <button 
             onClick={() => handleQuickAction('draft_notice')}
             className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
           >
             <Gavel size={14} /> Legal Notice
           </button>
           <button 
             onClick={() => handleQuickAction('draft_saf_kabala')}
             className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
           >
             <ScrollText size={14} /> Saf Kabala
           </button>
           <button 
             onClick={() => handleQuickAction('list_missing')}
             className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-200 transition-colors"
           >
             <Sparkles size={14} /> Action Checklist
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-brand-600 text-white'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div 
              className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === 'user' 
                  ? 'bg-slate-200 text-slate-900 rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none bangla-text'
                }
              `}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask a question or request a draft..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
            disabled={isLoading}
          />
          <button 
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          AI Legal Assistant can make mistakes. Verify critical drafts with a human lawyer.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
