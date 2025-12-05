import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, Copy, Share2, Gift } from 'lucide-react';
import { useAuth, REFERRAL_BONUS_CREDITS, FREE_SIGNUP_CREDITS } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { profile, applyReferralCode, isConfigured } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError('');
      setShowSuccess(false);
      setReferralCode('');
    }
  }, [isOpen]);

  // Show success screen if user just logged in
  useEffect(() => {
    if (isOpen && profile && !showSuccess) {
      setShowSuccess(true);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Sign in with Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // If successful, user will be redirected to Google
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  // Sign in with Apple
  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Apple');
      setLoading(false);
    }
  };

  // Handle Referral Code
  const handleApplyReferral = async () => {
    if (!referralCode.trim()) return;

    setLoading(true);
    setError('');

    const result = await applyReferralCode(referralCode);
    
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid referral code');
    } else {
      setReferralCode('');
    }
  };

  const handleCopyCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (profile?.referral_code) {
      const shareText = `JomiCheck এ সাইন আপ করুন! আমার রেফারেল কোড: ${profile.referral_code}\n\nhttps://www.jomicheck.com`;
      if (navigator.share) {
        navigator.share({ title: 'JomiCheck', text: shareText });
      } else {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600">Authentication is being configured.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={20} />
          </button>
          <div className="text-center">
            <h3 className="text-2xl font-bold">
              {showSuccess && profile ? 'Welcome!' : 'Login to JomiCheck'}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              {showSuccess && profile ? 'You\'re all set' : 'Continue with your account'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* SUCCESS SCREEN */}
          {showSuccess && profile ? (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-3xl font-black text-green-600 mb-1">
                  {profile.credits}
                </div>
                <div className="text-green-700 font-medium">Credits Available</div>
              </div>

              {/* Referral Code Display */}
              {profile.referral_code && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Share & earn {REFERRAL_BONUS_CREDITS} credits:</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg font-mono font-bold text-lg">
                      {profile.referral_code}
                    </div>
                    <button onClick={handleCopyCode} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                      {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                  <button onClick={handleShare} className="text-green-600 hover:underline text-sm flex items-center justify-center gap-1 mx-auto">
                    <Share2 size={14} /> Share with friends
                  </button>
                </div>
              )}

              {/* Apply referral if not applied */}
              {!profile.referred_by && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                    <Gift size={18} />
                    Have a referral code?
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="JOMIXXXX"
                      className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-center font-mono uppercase"
                      maxLength={8}
                    />
                    <button
                      onClick={handleApplyReferral}
                      disabled={loading || !referralCode}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-medium rounded-lg"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
              >
                Start Analyzing
              </button>
            </div>
          ) : (
            /* LOGIN BUTTONS */
            <div className="space-y-4">
              
              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all font-medium text-gray-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Apple Login Button */}
              <button
                onClick={handleAppleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black hover:bg-gray-900 rounded-xl transition-all font-medium text-white disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                )}
                Continue with Apple
              </button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center pt-2">
                New users get {FREE_SIGNUP_CREDITS} free credits to start!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
