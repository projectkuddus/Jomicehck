import React, { useState } from 'react';
import { X, Mail, KeyRound, Loader2, Gift, CheckCircle2, Copy, Share2, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth, REFERRAL_BONUS_CREDITS, FREE_SIGNUP_CREDITS } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';
type AuthStep = 'email' | 'otp' | 'password' | 'referral' | 'success';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    sendOTP, 
    verifyOTP, 
    setPasswordAfterOTP,
    signInWithPassword, 
    resetPassword, 
    updatePassword,
    profile, 
    applyReferralCode, 
    isConfigured 
  } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login'); // 'login' | 'signup' | 'forgot-password'
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  // Handle login with password
  const handleLogin = async () => {
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signInWithPassword(email, password);
    
    setLoading(false);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  // Handle signup: send OTP
  const handleSendOTP = async () => {
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    const result = await sendOTP(email);
    
    setLoading(false);
    
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send verification code');
    }
  };

  // Verify OTP (for signup)
  const handleVerifyOTP = async () => {
    if (!otp || otp.trim().length < 6) {
      setError('Please enter the verification code from your email');
      return;
    }

    setLoading(true);
    setError('');

    // Extract token from link if user pasted a full URL
    let token = otp.trim();
    if (token.includes('token=')) {
      const urlParams = new URLSearchParams(token.split('?')[1] || '');
      token = urlParams.get('token') || token;
    } else if (token.includes('http')) {
      try {
        const url = new URL(token);
        token = url.searchParams.get('token') || token.split('token=')[1]?.split('&')[0] || token;
      } catch {
        // Not a valid URL, use as-is
      }
    }

    const result = await verifyOTP(email, token);
    
    setLoading(false);
    
    if (result.success) {
      setStep('password'); // Next: set password
    } else {
      setError(result.error || 'Invalid code. Please check your email and try again.');
    }
  };

  // Set password after OTP verification
  const handleSetPassword = async () => {
    if (!password || !validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const result = await setPasswordAfterOTP(email, password);
    
    setLoading(false);
    
    if (result.success) {
      setStep('referral'); // Next: optional referral code
    } else {
      setError(result.error || 'Failed to set password');
    }
  };

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    const result = await resetPassword(email);
    
    setLoading(false);
    
    if (result.success) {
      setError('');
      alert('Password reset link sent! Check your email and click the link to reset your password.');
      setMode('login');
      setStep('email');
      setEmail('');
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  // Handle referral code
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
    setMode('login');
    setStep('email');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setReferralCode('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const switchToSignup = () => {
    setMode('signup');
    setStep('email');
    setError('');
  };

  const switchToLogin = () => {
    setMode('login');
    setStep('email');
    setError('');
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
              {mode === 'login' && <KeyRound size={24} />}
              {mode === 'signup' && step === 'email' && <Mail size={24} />}
              {mode === 'signup' && step === 'otp' && <KeyRound size={24} />}
              {mode === 'signup' && step === 'password' && <Lock size={24} />}
              {mode === 'signup' && step === 'referral' && <Gift size={24} />}
              {mode === 'signup' && step === 'success' && <CheckCircle2 size={24} />}
              {mode === 'forgot-password' && <Mail size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {mode === 'login' && 'Login'}
                {mode === 'signup' && step === 'email' && 'Sign Up'}
                {mode === 'signup' && step === 'otp' && 'Verify Email'}
                {mode === 'signup' && step === 'password' && 'Set Password'}
                {mode === 'signup' && step === 'referral' && 'Referral Code'}
                {mode === 'signup' && step === 'success' && 'Welcome!'}
                {mode === 'forgot-password' && 'Reset Password'}
              </h3>
              <p className="text-white/70 text-sm">
                {mode === 'login' && 'Enter your email and password'}
                {mode === 'signup' && step === 'email' && 'Create your account'}
                {mode === 'signup' && step === 'otp' && 'Check your email'}
                {mode === 'signup' && step === 'password' && 'Choose a secure password'}
                {mode === 'signup' && step === 'referral' && 'Have a friend\'s code?'}
                {mode === 'signup' && step === 'success' && 'You\'re all set'}
                {mode === 'forgot-password' && 'We\'ll send you a reset link'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* LOGIN MODE */}
          {mode === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading || !validateEmail(email) || !password}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Logging in...</>
                ) : (
                  <>Login <KeyRound size={18} /></>
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => { setMode('forgot-password'); setStep('email'); setError(''); }}
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
                  Forgot password?
                </button>
                <button
                  onClick={switchToSignup}
                  className="text-slate-600 hover:text-slate-700"
                >
                  Don't have an account? <span className="font-medium text-brand-600">Sign up</span>
                </button>
              </div>
            </div>
          )}

          {/* SIGNUP MODE - Step 1: Email */}
          {mode === 'signup' && step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || !validateEmail(email)}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Sending...</>
                ) : (
                  <>Send Verification Code <Mail size={18} /></>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                We'll send a verification code to your email
              </p>

              <button
                onClick={switchToLogin}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
              >
                Already have an account? <span className="font-medium text-brand-600">Login</span>
              </button>
            </div>
          )}

          {/* SIGNUP MODE - Step 2: OTP */}
          {mode === 'signup' && step === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="Paste the code from email"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-center text-lg font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                />
              </div>

              <p className="text-sm text-slate-500 text-center">
                Check your inbox: <span className="font-medium text-slate-700">{email}</span>
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.trim().length < 6}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Verifying...</>
                ) : (
                  <>Verify <KeyRound size={18} /></>
                )}
              </button>

              <button
                onClick={() => { setStep('email'); setError(''); setOtp(''); }}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
              >
                ← Change email
              </button>
            </div>
          )}

          {/* SIGNUP MODE - Step 3: Set Password */}
          {mode === 'signup' && step === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSetPassword}
                disabled={loading || !validatePassword(password) || password !== confirmPassword}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Setting password...</>
                ) : (
                  <>Continue <Lock size={18} /></>
                )}
              </button>
            </div>
          )}

          {/* SIGNUP MODE - Step 4: Referral Code (Optional) */}
          {mode === 'signup' && step === 'referral' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <p className="text-green-600 font-medium">Account created!</p>
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

          {/* SIGNUP MODE - Step 5: Success */}
          {mode === 'signup' && step === 'success' && (
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

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot-password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleForgotPassword}
                disabled={loading || !validateEmail(email)}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Sending...</>
                ) : (
                  <>Send Reset Link <Mail size={18} /></>
                )}
              </button>

              <button
                onClick={switchToLogin}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
              >
                ← Back to login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthModal;
