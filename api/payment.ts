import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Payment gateway integration
// Supports SSLCommerz (primary) and manual verification (fallback)

interface PaymentRequest {
  userId: string;
  packageId: string; // 'starter' | 'popular' | 'pro' | 'agent'
  paymentMethod: 'bkash';
  transactionId: string; // Required for manual verification
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
    // Check Supabase configuration
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔍 Payment API - Environment Check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
      serviceKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0,
    });

    if (!supabaseUrl) {
      console.error('❌ Supabase URL not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error: Supabase URL missing. Please contact support.' 
      });
    }

    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error: Service role key missing. Please check Vercel environment variables.' 
      });
    }

    // Initialize Supabase client with service role key (bypasses RLS)
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

    const { userId, packageId, paymentMethod, transactionId } = req.body as PaymentRequest;
    
    console.log('💳 Payment request received:', { 
      userId, 
      packageId, 
      paymentMethod, 
      hasTransactionId: !!transactionId,
      transactionIdLength: transactionId?.length || 0,
    });

    // Validate input
    if (!userId || !packageId || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const packageData = CREDIT_PACKAGES[packageId];
    if (!packageData) {
      return res.status(400).json({ success: false, error: 'Invalid package' });
    }

    // Only bKash manual verification is supported
    if (paymentMethod !== 'bkash') {
      return res.status(400).json({ success: false, error: 'Only bKash payment is supported' });
    }

    if (!transactionId || !transactionId.trim()) {
      return res.status(400).json({ success: false, error: 'Transaction ID is required' });
    }

    // Create pending payment record
    // Note: Service role key should bypass RLS, but if it doesn't, we need to check RLS policies
    try {
      console.log('Attempting to insert payment:', {
        user_id: userId,
        package_id: packageId,
        amount: packageData.price,
        credits: packageData.credits,
        payment_method: 'bkash',
        status: 'pending',
        transaction_id: transactionId.trim(),
      });

      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          package_id: packageId,
          amount: packageData.price,
          credits: packageData.credits,
          payment_method: 'bkash',
          status: 'pending',
          transaction_id: transactionId.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Payment record error:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        console.error('❌ Error hint:', error.hint);
        
        // Provide more specific error messages
        let errorMessage = error.message || 'Failed to create payment record';
        
        if (error.code === 'PGRST116') {
          errorMessage = 'Payment table not found. Please create payment_transactions table in Supabase.';
        } else if (error.code === '42501') {
          errorMessage = 'Permission denied. Service role key may not have insert permissions. Check RLS policies.';
        } else if (error.code === '23503') {
          errorMessage = 'Invalid user ID. User does not exist in profiles table.';
        } else if (error.message?.includes('RLS')) {
          errorMessage = 'Row Level Security blocking insert. Service role key should bypass RLS. Check RLS policies.';
        }
        
        return res.status(500).json({ 
          success: false,
          error: errorMessage,
          errorCode: error.code,
          hint: error.hint,
        });
      }

      if (!data) {
        return res.status(500).json({ 
          success: false,
          error: 'Payment record created but no data returned' 
        });
      }

      return res.status(200).json({
        success: true,
        paymentId: data.id,
        status: 'pending_verification',
        message: 'Payment submitted for verification. Credits will be added after confirmation.',
        amount: packageData.price,
        credits: packageData.credits,
      });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        success: false,
        error: dbError.message || 'Database error occurred' 
      });
    }
  } catch (error: any) {
    console.error('Payment API error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error. Please check Vercel logs for details.' 
    });
  }
}

