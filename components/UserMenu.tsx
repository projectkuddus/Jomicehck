import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, CreditCard, Gift, Copy, CheckCircle2, Share2, ChevronDown } from 'lucide-react';
import { useAuth, REFERRAL_BONUS_CREDITS } from '../contexts/AuthContext';

interface UserMenuProps {
  onOpenAuth: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuth }) => {
  const { user, profile, signOut, isConfigured, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (profile?.referral_code) {
      const shareText = `JomiCheck এ সাইন আপ করুন এবং ${REFERRAL_BONUS_CREDITS} ফ্রি ক্রেডিট পান! আমার রেফারেল কোড: ${profile.referral_code}\n\nhttps://www.jomicheck.com`;
      
      if (navigator.share) {
        navigator.share({
          title: 'JomiCheck Referral',
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  // Show loading state while checking auth (with timeout fallback)
  const [showFallback, setShowFallback] = useState(false);
  
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowFallback(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowFallback(false);
    }
  }, [loading]);

  if (loading && !showFallback) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin"></div>
        <span className="hidden sm:inline text-sm text-slate-600">Loading...</span>
      </div>
    );
  }

  // If loading takes too long, show login button
  if (loading && showFallback) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors"
      >
        <User size={18} />
        <span className="hidden sm:inline">Login</span>
      </button>
    );
  }

  // Not configured or not logged in - show login button
  if (!isConfigured || !user) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors"
      >
        <User size={18} />
        <span className="hidden sm:inline">Login</span>
      </button>
    );
  }

  // User is logged in but profile is still loading - show basic user info
  if (!profile) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
          {user.email?.charAt(0) || 'U'}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-slate-700">Loading...</div>
        </div>
      </div>
    );
  }

  // Logged in - show user menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
      >
        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
          {profile.email?.charAt(0) || 'U'}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-slate-700">
            {profile.credits} Credits
          </div>
          <div className="text-xs text-slate-500 max-w-[120px] truncate">
            {profile.email}
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Credits Section */}
          <div className="p-4 bg-brand-50 border-b border-brand-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-brand-700 font-medium">Available Credits</span>
              <CreditCard size={16} className="text-brand-600" />
            </div>
            <div className="text-3xl font-black text-brand-700">{profile.credits}</div>
          </div>

          {/* Referral Section */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Gift size={16} className="text-amber-500" />
              Your Referral Code
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-100 rounded-lg font-mono font-bold tracking-wider text-center">
                {profile.referral_code}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Earn {REFERRAL_BONUS_CREDITS} credits for each friend who signs up!
            </p>
            {profile.total_referrals > 0 && (
              <p className="text-xs text-green-600 font-medium mt-1">
                ✓ {profile.total_referrals} friends referred
              </p>
            )}
            <button
              onClick={handleShare}
              className="w-full mt-3 py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 size={14} /> Share & Earn
            </button>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

