import React from 'react';
import { Mail, Phone, MessageSquare, MapPin } from 'lucide-react';

const Support: React.FC = () => {
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
           <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
             <MessageSquare size={24} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">Live Chat</h3>
           <p className="text-slate-500 text-sm mb-4">
             Available 10 AM - 6 PM (BD Time)
           </p>
           <button className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
             Start Chat
           </button>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Rahim Uddin" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="rahim@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
            <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option>Payment Issue</option>
              <option>Report Query</option>
              <option>Feature Request</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Message</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 h-32" placeholder="How can we help you?"></textarea>
          </div>
          <button type="button" className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors">
            Send Message
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