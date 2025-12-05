import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Types
export interface UserProfile {
  id: string;
  email: string;
  credits: number;
  referral_code: string;
  referred_by: string | null;
  total_referrals: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  
  // Auth methods
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Credit methods
  addCredits: (amount: number) => Promise<boolean>;
  useCredits: (amount: number) => Promise<boolean>;
  
  // Referral methods
  applyReferralCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  
  // Refresh profile
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credit packages (matching Pricing.tsx)
export const CREDIT_PACKAGES = [
  { name: "Starter", credits: 20, price: 199, perPage: 10 },
  { name: "Popular", credits: 50, price: 399, perPage: 8, isPopular: true },
  { name: "Pro", credits: 100, price: 699, perPage: 7 },
  { name: "Agent", credits: 250, price: 1499, perPage: 6 },
];

// Referral bonus
export const REFERRAL_BONUS_CREDITS = 10; // Both referrer and referee get 10 credits
export const FREE_SIGNUP_CREDITS = 5; // Free credits on signup

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  // Generate a unique referral code
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'JOMI';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Fetch user profile from database
  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const newProfile = {
          id: userId,
          email: userEmail || '',
          credits: FREE_SIGNUP_CREDITS,
          referral_code: generateReferralCode(),
          referred_by: null,
          total_referrals: 0,
        };

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }
        return created as UserProfile;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Not configured - just disable loading and let app work without auth
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;
    
    // Force loading to end after 1 second - faster UI
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth timeout - continuing without blocking UI');
        setLoading(false);
      }
    }, 1000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      // Handle SIGNED_OUT event explicitly
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const profileData = await fetchProfile(session.user.id, session.user.email);
          if (mounted) setProfile(profileData);
        } catch (err) {
          console.error('Profile fetch failed:', err);
          // Don't block - just continue without profile
        }
      } else {
        setProfile(null);
      }
      
      // Auth state changed - loading is done
      if (mounted) setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('Session error:', error.message);
          setLoading(false);
          return;
        }
        
        // If no session, just stop loading
        if (!session) {
          setLoading(false);
          return;
        }
        
        // Session exists - update state
        setSession(session);
        setUser(session.user);
        
        // Try to get profile
        fetchProfile(session.user.id, session.user.email)
          .then(profileData => {
            if (mounted) setProfile(profileData);
          })
          .catch(err => {
            console.error('Initial profile fetch failed:', err);
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
      })
      .catch(err => {
        console.error('getSession failed:', err);
        if (mounted) setLoading(false);
      });

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Note: Profile refresh is now handled in the main useEffect above

  // Send OTP code to email (token, not magic link)
  const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return { success: false, error: 'Auth not configured' };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: true,
          // Force OTP token instead of magic link
          emailRedirectTo: null,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    }
  };

  // Verify OTP
  const verifyOTP = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return { success: false, error: 'Auth not configured' };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token,
        type: 'email',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to verify OTP' };
    }
  };

  // Sign out - completely clear all state and storage
  const signOut = async () => {
    // Clear local React state FIRST (immediate UI update)
    setUser(null);
    setProfile(null);
    setSession(null);
    
    // Clear ALL Supabase-related localStorage items BEFORE signing out
    // This prevents Supabase from restoring session on refresh
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      try {
        // Extract project ref from URL (e.g., tyiuowhrdnaoxqrxpfbd from https://tyiuowhrdnaoxqrxpfbd.supabase.co)
        const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
        if (projectRef) {
          // Clear the main auth token
          localStorage.removeItem(`sb-${projectRef}-auth-token`);
        }
        
        // Clear all keys that start with 'sb-' (Supabase storage)
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (err) {
        console.error('Error clearing localStorage:', err);
      }
    }
    
    // Clear sessionStorage as well
    try {
      sessionStorage.clear();
    } catch (err) {
      console.error('Error clearing sessionStorage:', err);
    }
    
    // Then sign out from Supabase (this triggers SIGNED_OUT event)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Add credits to user account
  const addCredits = async (amount: number): Promise<boolean> => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: profile.credits + amount })
        .eq('id', profile.id);

      if (error) {
        console.error('Error adding credits:', error);
        return false;
      }

      setProfile({ ...profile, credits: profile.credits + amount });
      return true;
    } catch (err) {
      console.error('Add credits error:', err);
      return false;
    }
  };

  // Use credits from user account
  const useCredits = async (amount: number): Promise<boolean> => {
    if (!profile || profile.credits < amount) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - amount })
        .eq('id', profile.id);

      if (error) {
        console.error('Error using credits:', error);
        return false;
      }

      setProfile({ ...profile, credits: profile.credits - amount });
      return true;
    } catch (err) {
      console.error('Use credits error:', err);
      return false;
    }
  };

  // Apply referral code
  const applyReferralCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!profile) {
      return { success: false, error: 'Not logged in' };
    }

    if (profile.referred_by) {
      return { success: false, error: 'You have already used a referral code' };
    }

    try {
      // Find the referrer by code
      const { data: referrer, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', code.toUpperCase())
        .single();

      if (findError || !referrer) {
        return { success: false, error: 'Invalid referral code' };
      }

      if (referrer.id === profile.id) {
        return { success: false, error: 'You cannot use your own referral code' };
      }

      // Update current user with referred_by and add bonus credits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          referred_by: referrer.id,
          credits: profile.credits + REFERRAL_BONUS_CREDITS 
        })
        .eq('id', profile.id);

      if (updateError) {
        return { success: false, error: 'Failed to apply referral code' };
      }

      // Add bonus credits to referrer and increment their referral count
      await supabase
        .from('profiles')
        .update({ 
          credits: referrer.credits + REFERRAL_BONUS_CREDITS,
          total_referrals: referrer.total_referrals + 1
        })
        .eq('id', referrer.id);

      // Update local profile
      setProfile({ 
        ...profile, 
        referred_by: referrer.id,
        credits: profile.credits + REFERRAL_BONUS_CREDITS 
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to apply referral code' };
    }
  };

  // Refresh profile from database
  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchProfile(user.id, user.email);
      setProfile(profile);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isConfigured,
      sendOTP,
      verifyOTP,
      signOut,
      addCredits,
      useCredits,
      applyReferralCode,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
