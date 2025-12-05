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
          email: userEmail || user?.email || '',
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
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email).then(setProfile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email);
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  // Refresh profile when user changes (fallback)
  useEffect(() => {
    if (user && !profile && !loading && isConfigured) {
      fetchProfile(user.id, user.email).then(setProfile);
    }
  }, [user, profile, loading, isConfigured]);

  // Send OTP code to email (6-digit code, not magic link)
  const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isConfigured) {
      return { success: false, error: 'Auth not configured' };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: true,
          // This tells Supabase we want to verify with a code, not a link
          emailRedirectTo: undefined,
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

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
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
