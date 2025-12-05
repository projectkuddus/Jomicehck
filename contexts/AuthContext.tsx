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
  signOut: () => Promise<void>;
  addCredits: (amount: number) => Promise<boolean>;
  useCredits: (amount: number) => Promise<boolean>;
  applyReferralCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constants
export const CREDIT_PACKAGES = [
  { name: "Starter", credits: 20, price: 199, perPage: 10 },
  { name: "Popular", credits: 50, price: 399, perPage: 8, isPopular: true },
  { name: "Pro", credits: 100, price: 699, perPage: 7 },
  { name: "Agent", credits: 250, price: 1499, perPage: 6 },
];

export const REFERRAL_BONUS_CREDITS = 10;
export const FREE_SIGNUP_CREDITS = 5;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Generate referral code - FIXED: Ensure uniqueness
  const generateReferralCode = async (): Promise<string> => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      let code = 'JOMI';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if code already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', code)
        .single();
      
      if (!existing) {
        console.log('✅ Generated unique referral code:', code);
        return code;
      }
      
      attempts++;
      console.warn(`⚠️ Referral code ${code} already exists, trying again...`);
    }
    
    // Fallback: Use timestamp if all attempts fail
    const fallbackCode = `JOMI${Date.now().toString(36).toUpperCase().slice(-4)}`;
    console.warn('⚠️ Using fallback referral code:', fallbackCode);
    return fallbackCode;
  };

  // Fetch or create profile
  const fetchProfile = async (userId: string, userEmail?: string | null): Promise<UserProfile | null> => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return existingProfile as UserProfile;
      }

      // Create new profile if doesn't exist
      if (fetchError && fetchError.code === 'PGRST116') {
        // Generate unique referral code
        const referralCode = await generateReferralCode();
        
        const newProfile = {
          id: userId,
          email: userEmail || '',
          credits: FREE_SIGNUP_CREDITS,
          referral_code: referralCode,
          total_referrals: 0,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create profile:', createError);
          console.error('❌ Profile data attempted:', newProfile);
          
          // CRITICAL FIX: Retry profile creation once if it fails
          // Sometimes RLS policies or timing issues cause first attempt to fail
          console.log('🔄 Retrying profile creation...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
          
          if (retryError) {
            console.error('❌ Profile creation retry also failed:', retryError);
            // Still return null, but log detailed error
            return null;
          }
          
          console.log('✅ Profile created on retry');
          return retryProfile as UserProfile;
        }

        console.log('✅ Profile created successfully:', createdProfile?.id);
        return createdProfile as UserProfile;
      }

      return null;
    } catch (err) {
      console.error('Profile error:', err);
      return null;
    }
  };

  // Initialize auth
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('🔔 Auth event:', event, 'User:', newSession?.user?.email);

      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setUser(null);
        setProfile(null);
        setSession(null);
        setLoading(false);
        return;
      }

      // Handle OAuth callback - this fires when user returns from Google
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (newSession?.user) {
          console.log('✅ User signed in - fetching profile...');
          setSession(newSession);
          setUser(newSession.user);
          
          // Always fetch profile to ensure it's up to date
          const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
          if (mounted) {
            setProfile(profileData);
            if (profileData) {
              console.log('✅ Profile loaded - Credits:', profileData.credits);
            }
          }
        }
      }

      // Also handle any session updates
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        
        // Fetch profile if not already set or if it's a new session
        if (!profile || profile.id !== newSession.user.id) {
          const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
          if (mounted) setProfile(profileData);
        }
      }
      
      setLoading(false);
    });

    // Get initial session - also handles OAuth callback
    const initializeSession = async () => {
      try {
        // Check for OAuth callback in URL hash first
        const hash = window.location.hash;
        const isOAuthCallback = hash.includes('access_token') || hash.includes('error');
        
        if (isOAuthCallback) {
          console.log('🔍 OAuth callback detected in URL - waiting for Supabase to process...');
          // Give Supabase time to process the OAuth callback from the hash
          // Supabase's detectSessionInUrl: true should handle this automatically
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Get session - Supabase will extract tokens from hash if present
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Session error:', error);
          setLoading(false);
          return;
        }
        
        if (initialSession?.user) {
          console.log('✅ Session found - User:', initialSession.user.email);
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Fetch profile - this might take a moment
          const profileData = await fetchProfile(initialSession.user.id, initialSession.user.email);
          if (mounted) {
            setProfile(profileData);
            if (profileData) {
              console.log('✅ Profile loaded - Credits:', profileData.credits);
            } else {
              console.warn('⚠️ Profile not found - will be created');
            }
          }
        } else {
          console.log('ℹ️ No session found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to get session:', err);
        if (mounted) setLoading(false);
      }
    };

    initializeSession();

    // Timeout
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Sign out
  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (e) {}
    
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {}
  };

  // Add credits - FIXED: Re-check from database to prevent race conditions
  const addCredits = async (amount: number): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      // CRITICAL FIX: Re-fetch profile from database to get latest credits
      // This prevents race conditions where credits were deducted but local state is stale
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (fetchError || !currentProfile) {
        console.error('❌ Failed to fetch current credits for refund:', fetchError);
        return false;
      }

      const currentCredits = currentProfile.credits || 0;
      const newCredits = currentCredits + amount;

      // Add credits using database value, not local state
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Failed to add credits:', updateError);
        return false;
      }

      // Update local state with actual database value
      setProfile({ ...profile, credits: newCredits });
      console.log('✅ Credits added:', { amount, oldCredits: currentCredits, newCredits });
      return true;
    } catch (error: any) {
      console.error('❌ Credit addition error:', error);
      return false;
    }
  };

  // Use credits - FIXED: Re-check from database to prevent stale data issues
  const useCredits = async (amount: number): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      // CRITICAL FIX: Re-fetch profile from database to get latest credits
      // This prevents race conditions where credits were added but local state is stale
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (fetchError || !currentProfile) {
        console.error('❌ Failed to fetch current credits:', fetchError);
        return false;
      }

      const currentCredits = currentProfile.credits || 0;

      // Check if user actually has enough credits (from database, not stale state)
      if (currentCredits < amount) {
        console.warn('⚠️ Insufficient credits:', { currentCredits, needed: amount });
        // Update local state to reflect reality
        setProfile({ ...profile, credits: currentCredits });
        return false;
      }

      // Deduct credits using database value, not local state
      const newCredits = currentCredits - amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Failed to deduct credits:', updateError);
        return false;
      }

      // Update local state with actual database value
      setProfile({ ...profile, credits: newCredits });
      console.log('✅ Credits deducted:', { amount, oldCredits: currentCredits, newCredits });
      return true;
    } catch (error: any) {
      console.error('❌ Credit deduction error:', error);
      return false;
    }
  };

  // Apply referral code - FIXED: Use database-first approach and proper tracking
  const applyReferralCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !profile) return { success: false, error: 'Not logged in' };
    
    // Re-fetch profile to check current state
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('referred_by, credits')
      .eq('id', user.id)
      .single();
    
    if (fetchError || !currentProfile) {
      return { success: false, error: 'Failed to verify account status' };
    }
    
    if (currentProfile.referred_by) {
      return { success: false, error: 'Already used a referral code' };
    }

    try {
      // Find referrer by code
      const { data: referrer, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', code.toUpperCase().trim())
        .single();

      if (findError || !referrer) {
        return { success: false, error: 'Invalid referral code' };
      }
      
      if (referrer.id === user.id) {
        return { success: false, error: 'Cannot use your own code' };
      }

      // CRITICAL: Use database values, not local state
      const userCurrentCredits = currentProfile.credits || 0;
      const referrerCurrentCredits = referrer.credits || 0;
      const referrerCurrentTotal = referrer.total_referrals || 0;

      // Update user (new user gets bonus)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          referred_by: referrer.id,
          credits: userCurrentCredits + REFERRAL_BONUS_CREDITS,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Failed to apply referral code to user:', updateError);
        return { success: false, error: 'Failed to apply code' };
      }

      // Update referrer (referrer gets bonus and count increases)
      const { error: referrerUpdateError } = await supabase
        .from('profiles')
        .update({
          credits: referrerCurrentCredits + REFERRAL_BONUS_CREDITS,
          total_referrals: referrerCurrentTotal + 1,
        })
        .eq('id', referrer.id);

      if (referrerUpdateError) {
        console.error('❌ Failed to update referrer:', referrerUpdateError);
        // User was already updated, so we should still return success
        // But log the error for admin review
      }

      // Refresh profile to get updated values
      await refreshProfile();

      console.log('✅ Referral code applied:', {
        code: code.toUpperCase(),
        userCredits: userCurrentCredits + REFERRAL_BONUS_CREDITS,
        referrerCredits: referrerCurrentCredits + REFERRAL_BONUS_CREDITS,
        referrerTotal: referrerCurrentTotal + 1,
      });

      return { success: true };
    } catch (err: any) {
      console.error('❌ Referral code application error:', err);
      return { success: false, error: err.message || 'Failed to apply referral code' };
    }
  };

  // Refresh profile - FIXED: Force refresh to sync with database
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile from database...');
      const profileData = await fetchProfile(user.id, user.email);
      if (profileData) {
        setProfile(profileData);
        console.log('✅ Profile refreshed - Credits:', profileData.credits);
      } else {
        console.error('❌ Failed to refresh profile');
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      isConfigured,
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
