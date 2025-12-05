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
  
  // Simple auth methods
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  
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
export const REFERRAL_BONUS_CREDITS = 10;
export const FREE_SIGNUP_CREDITS = 5;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Generate referral code
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'JOMI';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Fetch or create profile
  const fetchProfile = async (userId: string, userEmail?: string | null): Promise<UserProfile | null> => {
    try {
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return existingProfile as UserProfile;
      }

      // If no profile exists, create one
      if (fetchError && fetchError.code === 'PGRST116') {
        const newProfile = {
          id: userId,
          email: userEmail || '',
          credits: FREE_SIGNUP_CREDITS,
          referral_code: generateReferralCode(),
          total_referrals: 0,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Failed to create profile:', createError);
          return null;
        }

        return createdProfile as UserProfile;
      }

      console.error('Profile fetch error:', fetchError);
      return null;
    } catch (err) {
      console.error('Profile error:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('Auth event:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSession(null);
        setLoading(false);
        return;
      }

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        
        // Fetch profile (defer to avoid blocking)
        setTimeout(async () => {
          if (mounted) {
            const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
            if (mounted) setProfile(profileData);
          }
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return;
      
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        
        const profileData = await fetchProfile(initialSession.user.id, initialSession.user.email);
        if (mounted) setProfile(profileData);
      }
      
      setLoading(false);
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth timeout');
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Sign up with email and password
  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    if (!isConfigured) {
      return { success: false, error: 'Auth not configured' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { success: true, needsConfirmation: true };
      }

      // User is logged in immediately (email confirmation disabled in Supabase)
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to sign up' };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return { success: false, error: 'Auth not configured' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to sign in' };
    }
  };

  // Sign out
  const signOut = async () => {
    // Clear state first
    setUser(null);
    setProfile(null);
    setSession(null);
    
    // Clear localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
    
    // Sign out from Supabase
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return { success: false, error: 'Auth not configured' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/#reset`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send reset email' };
    }
  };

  // Add credits
  const addCredits = async (amount: number): Promise<boolean> => {
    if (!profile) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: profile.credits + amount })
        .eq('id', profile.id);

      if (error) {
        console.error('Add credits error:', error);
        return false;
      }

      setProfile({ ...profile, credits: profile.credits + amount });
      return true;
    } catch (err) {
      console.error('Add credits error:', err);
      return false;
    }
  };

  // Use credits
  const useCredits = async (amount: number): Promise<boolean> => {
    if (!profile || profile.credits < amount) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - amount })
        .eq('id', profile.id);

      if (error) {
        console.error('Use credits error:', error);
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
      // Find referrer
      const { data: referrer, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', code.toUpperCase())
        .single();

      if (findError || !referrer) {
        return { success: false, error: 'Invalid referral code' };
      }

      if (referrer.id === profile.id) {
        return { success: false, error: 'Cannot use your own referral code' };
      }

      // Update current user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          referred_by: referrer.id,
          credits: profile.credits + REFERRAL_BONUS_CREDITS,
        })
        .eq('id', profile.id);

      if (updateError) {
        return { success: false, error: 'Failed to apply referral code' };
      }

      // Update referrer
      await supabase
        .from('profiles')
        .update({
          credits: referrer.credits + REFERRAL_BONUS_CREDITS,
          total_referrals: referrer.total_referrals + 1,
        })
        .eq('id', referrer.id);

      // Update local state
      setProfile({
        ...profile,
        referred_by: referrer.id,
        credits: profile.credits + REFERRAL_BONUS_CREDITS,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to apply referral code' };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id, user.email);
      setProfile(profileData);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
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
