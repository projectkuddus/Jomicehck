import React from 'react';
import { FileCheck, Menu, X, History } from 'lucide-react';
import UserMenu from './UserMenu';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: 'home' | 'how-it-works' | 'pricing' | 'support' | 'terms' | 'privacy' | 'blog' | 'blog-article') => void;
  onToggleHistory: () => void;
  onOpenAuth: () => void;
  onBuyCredits: () => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onToggleHistory, onOpenAuth, onBuyCredits, currentPage }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'how-it-works', label: 'How it works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'blog', label: 'Blog' },
    { id: 'support', label: 'Support' },
  ];

  const handleNavClick = (page: any) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleHistoryClick = () => {
    if (user) {
      onToggleHistory();
    } else {
      onOpenAuth();
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 py-3 px-4 md:px-6 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer" 
          onClick={() => onNavigate('home')}
        >
          <div className="bg-brand-600 p-2 rounded-lg text-white">
            <FileCheck size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">jomicheck.com</h1>
            <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:block">Bangla Property Risk Analyzer</p>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors ${currentPage === item.id ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          
          {/* My Reports - Only show if logged in */}
          {user && (
            <button 
              onClick={handleHistoryClick}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
            >
              <History size={18} />
              <span>My Reports</span>
            </button>
          )}

          {/* User Menu */}
          <UserMenu onOpenAuth={onOpenAuth} onBuyCredits={onBuyCredits} onNavigate={onNavigate} />
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2 px-2 rounded-lg ${currentPage === item.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600'}`}
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button 
                onClick={handleHistoryClick}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 py-2 px-2 border-t border-slate-100 mt-2 pt-4"
              >
                <History size={20} />
                <span>My Reports</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
