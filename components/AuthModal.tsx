import React, { useState } from 'react';
import { X, Phone, KeyRound, Loader2, Gift, CheckCircle2, Copy, Share2 } from 'lucide-react';
import { useAuth, REFERRAL_BONUS_CREDITS, FREE_SIGNUP_CREDITS } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'phone' | 'otp' | 'referral' | 'success';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { sendOTP, verifyOTP, profile, applyReferralCode, isConfigured } = useAuth();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    const result = await sendOTP(phone);
    
    setLoading(false);
    
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    const result = await verifyOTP(phone, otp);
    
    setLoading(false);
    
    if (result.success) {
      setStep('referral');
    } else {
      setError(result.error || 'Invalid OTP');
    }
  };

  const handleApplyReferral = async () => {
    if (!referralCode) {
      // Skip referral, go to success
      setStep('success');
      return;
    }

    setLoading(true);
    setError('');

    const result = await applyReferralCode(referralCode);
    
    setLoading(false);
    
    if (result.success) {
      setStep('success');
    } else {
      setError(result.error || 'Invalid referral code');
    }
  };

  const handleSkipReferral = () => {
    setStep('success');
  };

  const handleCopyReferralCode = () => {
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
  };

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setReferralCode('');
    setError('');
    onClose();
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <p className="text-slate-600">Authentication is being set up. Please try again later.</p>
          <button onClick={handleClose} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-slate-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-brand-600 px-6 py-5 text-white relative">
          <button onClick={handleClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {step === 'phone' && <Phone size={24} />}
              {step === 'otp' && <KeyRound size={24} />}
              {step === 'referral' && <Gift size={24} />}
              {step === 'success' && <CheckCircle2 size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {step === 'phone' && 'Login / Sign Up'}
                {step === 'otp' && 'Enter OTP'}
                {step === 'referral' && 'Referral Code'}
                {step === 'success' && 'Welcome!'}
              </h3>
              <p className="text-white/70 text-sm">
                {step === 'phone' && 'Enter your mobile number'}
                {step === 'otp' && 'We sent a code to your phone'}
                {step === 'referral' && 'Have a friend\'s code?'}
                {step === 'success' && 'You\'re all set'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mobile Number (Bangladesh)
                </label>
                <div className="flex">
                  <div className="flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 font-medium">
                    +88
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="01XXXXXXXXX"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg tracking-wider"
                    maxLength={11}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length < 10}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Sending...</>
                ) : (
                  <>Send OTP <Phone size={18} /></>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                We'll send a one-time password to verify your number. No password needed!
              </p>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
              </div>

              <p className="text-sm text-slate-500 text-center">
                Sent to +88{phone}
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length < 6}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Verifying...</>
                ) : (
                  <>Verify <KeyRound size={18} /></>
                )}
              </button>

              <button
                onClick={() => { setStep('phone'); setError(''); }}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
              >
                ← Change number
              </button>
            </div>
          )}

          {/* Step 3: Referral Code (Optional) */}
          {step === 'referral' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <p className="text-green-600 font-medium">Phone verified!</p>
                <p className="text-slate-500 text-sm">You received {FREE_SIGNUP_CREDITS} free credits</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                  <Gift size={18} />
                  Got a referral code?
                </div>
                <p className="text-amber-600 text-sm mb-3">
                  Enter a friend's code to get {REFERRAL_BONUS_CREDITS} bonus credits!
                </p>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. JOMIABCD"
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-center font-mono uppercase tracking-wider"
                  maxLength={8}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSkipReferral}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleApplyReferral}
                  disabled={loading || !referralCode}
                  className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>Apply</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              
              <h4 className="text-xl font-bold text-slate-900">Welcome to JomiCheck!</h4>
              
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                <div className="text-3xl font-black text-brand-600 mb-1">
                  {profile?.credits || FREE_SIGNUP_CREDITS}
                </div>
                <div className="text-brand-700 font-medium">Credits Available</div>
              </div>

              {/* Share Your Code */}
              {profile?.referral_code && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-2">Share your code & earn {REFERRAL_BONUS_CREDITS} credits per friend!</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="px-4 py-2 bg-white border-2 border-dashed border-slate-300 rounded-lg font-mono font-bold text-lg tracking-wider">
                      {profile.referral_code}
                    </div>
                    <button
                      onClick={handleCopyReferralCode}
                      className="p-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                    >
                      {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm mx-auto"
                  >
                    <Share2 size={16} /> Share with friends
                  </button>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors"
              >
                Start Analyzing
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;

