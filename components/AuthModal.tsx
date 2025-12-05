import React, { useState, useEffect } from 'react';
import { X, Mail, Loader2, Gift, CheckCircle2, Copy, Share2, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth, REFERRAL_BONUS_CREDITS, FREE_SIGNUP_CREDITS } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'success' | 'confirm';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, signIn, resetPassword, profile, applyReferralCode, isConfigured } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setMode('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setReferralCode('');
      setError('');
      setLoading(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 6;

  // Handle Login
  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    
    setLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  // Handle Sign Up
  const handleSignUp = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signUp(email, password);
    
    setLoading(false);

    if (result.success) {
      if (result.needsConfirmation) {
        setMode('confirm');
      } else {
        setMode('success');
      }
    } else {
      setError(result.error || 'Failed to create account');
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    const result = await resetPassword(email);
    
    setLoading(false);

    if (result.success) {
      alert('Password reset email sent! Check your inbox.');
      setMode('login');
    } else {
      setError(result.error || 'Failed to send reset email');
    }
  };

  // Handle Referral Code
  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      setMode('success');
      return;
    }

    setLoading(true);
    setError('');

    const result = await applyReferralCode(referralCode);
    
    setLoading(false);

    if (result.success) {
      setMode('success');
    } else {
      setError(result.error || 'Invalid referral code');
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
          <p className="text-gray-600">Authentication system is being configured.</p>
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {mode === 'login' && <KeyRound size={24} />}
              {mode === 'signup' && <Mail size={24} />}
              {mode === 'forgot' && <Mail size={24} />}
              {mode === 'confirm' && <Mail size={24} />}
              {mode === 'success' && <CheckCircle2 size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {mode === 'login' && 'Login'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'confirm' && 'Check Email'}
                {mode === 'success' && 'Welcome!'}
              </h3>
              <p className="text-white/80 text-sm">
                {mode === 'login' && 'Enter your credentials'}
                {mode === 'signup' && 'Join JomiCheck today'}
                {mode === 'forgot' && 'We\'ll send a reset link'}
                {mode === 'confirm' && 'Confirm your email'}
                {mode === 'success' && 'You\'re all set'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* LOGIN */}
          {mode === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="flex justify-between text-sm">
                <button onClick={() => { setMode('forgot'); setError(''); }} className="text-green-600 hover:underline">
                  Forgot password?
                </button>
                <button onClick={() => { setMode('signup'); setError(''); }} className="text-gray-600 hover:underline">
                  Create account
                </button>
              </div>
            </div>
          )}

          {/* SIGNUP */}
          {mode === 'signup' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                You'll get {FREE_SIGNUP_CREDITS} free credits to start!
              </p>

              <button onClick={() => { setMode('login'); setError(''); }} className="w-full text-sm text-gray-600 hover:underline">
                Already have an account? Login
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button onClick={() => { setMode('login'); setError(''); }} className="w-full text-sm text-gray-600 hover:underline">
                ← Back to login
              </button>
            </div>
          )}

          {/* EMAIL CONFIRMATION NEEDED */}
          {mode === 'confirm' && (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Mail size={40} className="text-blue-600" />
              </div>
              
              <h4 className="text-xl font-bold text-gray-900">Check Your Email</h4>
              
              <p className="text-gray-600">
                We sent a confirmation link to <strong>{email}</strong>
              </p>
              
              <p className="text-sm text-gray-500">
                Click the link in the email to activate your account, then come back to login.
              </p>

              <button
                onClick={() => setMode('login')}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* SUCCESS - Show referral */}
          {mode === 'success' && (
            <div className="space-y-4 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              
              <h4 className="text-xl font-bold text-gray-900">Welcome to JomiCheck!</h4>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-3xl font-black text-green-600 mb-1">
                  {profile?.credits || FREE_SIGNUP_CREDITS}
                </div>
                <div className="text-green-700 font-medium">Credits Available</div>
              </div>

              {/* Referral Code */}
              {profile?.referral_code && (
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
              {profile && !profile.referred_by && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
