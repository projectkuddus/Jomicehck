import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'আসসালামু আলাইকুম! 👋 আমি নির্ণয়, JomiCheck এর AI সহকারী। জমি দলিল বা JomiCheck সম্পর্কে কোনো প্রশ্ন থাকলে জিজ্ঞেস করুন!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Show unread indicator after a delay if chat is closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setHasUnread(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history for API (exclude the welcome message)
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const response = await fetch('/api/support-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          history
        })
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        text: data.reply || data.error || 'দুঃখিত, উত্তর দিতে সমস্যা হচ্ছে।',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'দুঃখিত, সংযোগে সমস্যা হচ্ছে। আবার চেষ্টা করুন।',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'JomiCheck কী?',
    'এটা কীভাবে কাজ করে?',
    'খরচ কত?',
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/30 hover:scale-110 transition-all duration-300 group"
        aria-label="Open Live Chat"
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            1
          </span>
        )}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          💬 নির্ণয় - 24/7 সাপোর্ট
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-72 h-14' : 'w-[360px] h-[520px] max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center justify-between cursor-pointer"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg">নির্ণয়</h3>
            {!isMinimized && (
              <p className="text-emerald-100 text-xs">AI সাপোর্ট • 24/7 অনলাইন</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[340px] overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-emerald-500 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => { setInputValue(q); inputRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full whitespace-nowrap hover:bg-emerald-100 transition-colors border border-emerald-100"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="আপনার প্রশ্ন লিখুন..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Powered by AI • সাধারণ তথ্যের জন্য • আইনি পরামর্শ নয়
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveChat;

