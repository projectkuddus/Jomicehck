import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Verify payment and add credits to user account
// This can be called by admin or automatically by SSLCommerz webhook

interface VerifyRequest {
  paymentId: string;
  verified?: boolean; // Admin can manually verify
}

const CREDIT_PACKAGES: Record<string, { credits: number; price: number }> = {
  starter: { credits: 20, price: 199 },
  popular: { credits: 50, price: 399 },
  pro: { credits: 100, price: 699 },
  agent: { credits: 250, price: 1499 },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Payment verify - Missing Supabase credentials');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error: Supabase credentials missing' 
      });
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { paymentId, verified } = req.body as VerifyRequest;

    if (!paymentId) {
      return res.status(400).json({ success: false, error: 'Payment ID required' });
    }

    // Get payment record
    const { data: payment, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !payment) {
      console.error('❌ Payment fetch error:', fetchError);
      return res.status(404).json({ 
        success: false,
        error: 'Payment not found' 
      });
    }

    if (payment.status === 'completed') {
      return res.status(200).json({ 
        success: true, 
        message: 'Payment already verified',
        credits: payment.credits 
      });
    }

    // Verify payment (admin verification or SSLCommerz webhook)
    const isVerified = verified !== false; // Default to true unless explicitly false

    if (isVerified) {
      // Update payment status
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({ 
          status: 'completed',
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) {
        console.error('❌ Payment update error:', updateError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to update payment' 
        });
      }

      // Add credits to user account
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', payment.user_id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to fetch user profile' 
        });
      }

      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: (profile.credits || 0) + payment.credits })
        .eq('id', payment.user_id);

      if (creditError) {
        console.error('❌ Credit update error:', creditError);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to add credits' 
        });
      }

      // Record credit transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: payment.user_id,
          amount: payment.credits,
          type: 'purchase',
          description: `Purchased ${payment.credits} credits via ${payment.payment_method}`,
        });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and credits added',
        credits: payment.credits,
        totalCredits: (profile.credits || 0) + payment.credits,
      });
    } else {
      // Mark as failed
      await supabase
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', paymentId);

      return res.status(200).json({
        success: false,
        message: 'Payment verification failed',
      });
    }
  } catch (error: any) {
    console.error('❌ Payment verification error:', error);
    console.error('❌ Error stack:', error.stack);
    // Always return valid JSON, never HTML
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
}

