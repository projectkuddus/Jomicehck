import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAuth, FREE_SIGNUP_CREDITS } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { profile, isConfigured } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGoogleLoading(false);
      setAppleLoading(false);
      setError('');
    }
  }, [isOpen]);

  // Close modal if user is logged in
  useEffect(() => {
    if (isOpen && profile) {
      onClose();
    }
  }, [isOpen, profile, onClose]);

  if (!isOpen) return null;

  // Don't render if user is logged in
  if (profile) return null;

  // Sign in with Google
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      // Get the full redirect URL including hash
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google login error:', error);
        setError(error.message || 'Failed to connect to Google. Please check your browser settings.');
        setGoogleLoading(false);
      } else if (data?.url) {
        // Redirect should happen automatically, but if it doesn't, redirect manually
        window.location.href = data.url;
      } else {
        // No error but no URL - might be a configuration issue
        setError('OAuth configuration error. Please contact support.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      console.error('Google login exception:', err);
      setError(err.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  // Sign in with Apple
  const handleAppleLogin = async () => {
    setAppleLoading(true);
    setError('');

    try {
      // Get the full redirect URL including hash
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Apple login error:', error);
        setError(error.message || 'Failed to connect to Apple. Please check your browser settings.');
        setAppleLoading(false);
      } else if (data?.url) {
        // Redirect should happen automatically, but if it doesn't, redirect manually
        window.location.href = data.url;
      } else {
        // No error but no URL - might be a configuration issue
        setError('OAuth configuration error. Please contact support.');
        setAppleLoading(false);
      }
    } catch (err: any) {
      console.error('Apple login exception:', err);
      setError(err.message || 'Failed to sign in with Apple');
      setAppleLoading(false);
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
            <h3 className="text-2xl font-bold">Login to JomiCheck</h3>
            <p className="text-white/80 text-sm mt-1">Continue with your account</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-4">
            
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || appleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            {/* Apple Login Button */}
            <button
              onClick={handleAppleLogin}
              disabled={googleLoading || appleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black hover:bg-gray-900 rounded-xl transition-all font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {appleLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              )}
              {appleLoading ? 'Connecting...' : 'Continue with Apple'}
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
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
