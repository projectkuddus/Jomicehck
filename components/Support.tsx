import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const Support: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Payment Issue',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      setSubmitMessage(data.message || 'Message sent successfully!');
      setFormData({ name: '', email: '', subject: 'Payment Issue', message: '' });
    } catch (error: any) {
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-slate-800">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">We're here to help</h2>
        <p className="text-lg text-slate-600">
          Have questions about your report or facing issues with payment?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
             <Mail size={24} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
           <p className="text-slate-500 text-sm mb-4">
             For refund requests, technical issues, or partnership inquiries.
           </p>
           <a href="mailto:support@jomicheck.com" className="text-brand-600 font-bold hover:underline">
             support@jomicheck.com
           </a>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
             <MessageSquare size={24} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">AI Live Chat</h3>
           <p className="text-slate-500 text-sm mb-4">
             24/7 AI সাপোর্ট - বাংলায় প্রশ্ন করুন
           </p>
           <p className="text-xs text-emerald-600 font-medium">
             👉 স্ক্রিনের নিচে ডান কোনায় চ্যাট বাটন দেখুন
           </p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500" 
                placeholder="Rahim Uddin" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500" 
                placeholder="rahim@example.com" 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
            <select 
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option>Payment Issue</option>
              <option>Report Query</option>
              <option>Feature Request</option>
              <option>Technical Support</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
            <textarea 
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 h-32" 
              placeholder="How can we help you?"
            ></textarea>
          </div>

          {/* Status Message */}
          {submitStatus !== 'idle' && (
            <div className={`p-3 rounded-lg flex items-start gap-2 ${
              submitStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {submitStatus === 'success' ? (
                <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              )}
              <p className={`text-sm ${
                submitStatus === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {submitMessage}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
        <MapPin size={16} />
        <span>Dhaka, Bangladesh</span>
      </div>
    </div>
  );
};

export default Support;