import React from 'react';
import { FileCheck, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: 'home' | 'how-it-works' | 'pricing' | 'support' | 'terms' | 'privacy') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-6 font-sans print:hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-brand-600 p-2 rounded-lg text-white">
                <FileCheck size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white">JomiCheck</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered property document verification for Bangladesh. 
              Verify your land documents before purchase.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('support')}
                  className="hover:text-white transition-colors"
                >
                  Support
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="mailto:support@jomicheck.com"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail size={16} />
                  support@jomicheck.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} JomiCheck. All rights reserved.</p>
          <p className="text-xs">
            Made with ❤️ for Bangladesh property buyers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

