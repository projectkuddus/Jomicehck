import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const REFERRAL_BONUS_CREDITS = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return res.status(400).json({ error: 'Missing userId or referralCode' });
    }

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get current user's profile
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id, credits, referred_by')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      console.error('❌ User not found:', userError);
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Check if user already used a referral code
    if (userProfile.referred_by) {
      return res.status(400).json({ error: 'You have already used a referral code' });
    }

    // 3. Find referrer by code
    const normalizedCode = referralCode.toUpperCase().trim();
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, credits, total_referrals')
      .eq('referral_code', normalizedCode)
      .single();

    if (referrerError || !referrer) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }

    // 4. Can't use own code
    if (referrer.id === userId) {
      return res.status(400).json({ error: 'Cannot use your own referral code' });
    }

    // 5. Update user (mark as referred, add bonus credits)
    const { error: updateUserError } = await supabase
      .from('profiles')
      .update({
        referred_by: referrer.id,
        credits: (userProfile.credits || 0) + REFERRAL_BONUS_CREDITS,
      })
      .eq('id', userId);

    if (updateUserError) {
      console.error('❌ Failed to update user:', updateUserError);
      return res.status(500).json({ error: 'Failed to apply referral code' });
    }

    // 6. Update referrer (add bonus credits, increment count)
    const { error: updateReferrerError } = await supabase
      .from('profiles')
      .update({
        credits: (referrer.credits || 0) + REFERRAL_BONUS_CREDITS,
        total_referrals: (referrer.total_referrals || 0) + 1,
      })
      .eq('id', referrer.id);

    if (updateReferrerError) {
      console.error('❌ Failed to update referrer:', updateReferrerError);
      // User was already updated, so continue but log error
    }

    console.log('✅ Referral applied:', {
      user: userId,
      referrer: referrer.id,
      code: normalizedCode,
    });

    return res.json({
      success: true,
      bonusCredits: REFERRAL_BONUS_CREDITS,
      newCredits: (userProfile.credits || 0) + REFERRAL_BONUS_CREDITS,
    });

  } catch (error: any) {
    console.error('❌ Referral error:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}

