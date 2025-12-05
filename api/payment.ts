import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Payment gateway integration
// Auto-approves payments and adds credits immediately
// Sends email notification to admin for new payments

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

// Send email notification for new payments
async function sendPaymentNotification({
  paymentId,
  userId,
  userEmail,
  amount,
  credits,
  transactionId,
  status,
  error,
}: {
  paymentId: string;
  userId: string;
  userEmail: string;
  amount: number;
  credits: number;
  transactionId: string;
  status: string;
  error?: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || 'admin@jomicheck.com';

  if (!resendApiKey) {
    console.log('📧 Email service not configured. Payment notification logged:', {
      paymentId,
      userId,
      userEmail,
      amount,
      credits,
      transactionId,
      status,
      error,
    });
    return;
  }

  try {
    const subject = error 
      ? `⚠️ [JomiCheck] Payment Issue - Manual Review Needed`
      : `💰 [JomiCheck] New Payment Received - ${credits} Credits`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${error ? '#dc2626' : '#059669'};">
          ${error ? '⚠️ Payment Issue' : '💰 New Payment Received'}
        </h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>User Email:</strong> ${userEmail}</p>
          <p><strong>Amount:</strong> ৳${amount}</p>
          <p><strong>Credits:</strong> ${credits}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${error ? `<p style="color: #dc2626;"><strong>Error:</strong> ${error}</p>` : ''}
        </div>

        ${error ? `
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Action Required:</strong> Please manually verify this payment and add credits if payment is valid.</p>
          </div>
        ` : `
          <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✅ Auto-approved:</strong> Credits have been automatically added to the user's account.</p>
            <p style="margin: 5px 0 0 0;">Please verify the transaction in your bKash account.</p>
          </div>
        `}

        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          This is an automated notification from JomiCheck payment system.
        </p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'JomiCheck Payments <noreply@jomicheck.com>',
        to: [adminEmail],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Failed to send payment notification email:', errorData);
    } else {
      console.log('✅ Payment notification email sent to:', adminEmail);
    }
  } catch (emailError: any) {
    console.error('❌ Email notification error:', emailError);
    // Don't fail the payment if email fails
  }
}

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

    // AUTO-APPROVE: Create payment record and immediately add credits
    // Note: Service role key should bypass RLS, but if it doesn't, we need to check RLS policies
    try {
      console.log('💳 Auto-approving payment:', {
        user_id: userId,
        package_id: packageId,
        amount: packageData.price,
        credits: packageData.credits,
        payment_method: 'bkash',
        transaction_id: transactionId.trim(),
      });

      // Step 1: Create payment record with 'completed' status
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          package_id: packageId,
          amount: packageData.price,
          credits: packageData.credits,
          payment_method: 'bkash',
          status: 'completed', // Auto-approved
          transaction_id: transactionId.trim(),
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) {
        console.error('❌ Payment record error:', paymentError);
        console.error('❌ Error code:', paymentError.code);
        console.error('❌ Error message:', paymentError.message);
        console.error('❌ Error details:', JSON.stringify(paymentError, null, 2));
        console.error('❌ Error hint:', paymentError.hint);
        
        // Provide more specific error messages
        let errorMessage = paymentError.message || 'Failed to create payment record';
        
        if (paymentError.code === 'PGRST116') {
          errorMessage = 'Payment table not found. Please create payment_transactions table in Supabase.';
        } else if (paymentError.code === '42501') {
          errorMessage = 'Permission denied. Service role key may not have insert permissions. Check RLS policies.';
        } else if (paymentError.code === '23503') {
          errorMessage = 'Invalid user ID. User does not exist in profiles table.';
        } else if (paymentError.message?.includes('RLS')) {
          errorMessage = 'Row Level Security blocking insert. Service role key should bypass RLS. Check RLS policies.';
        }
        
        return res.status(500).json({ 
          success: false,
          error: errorMessage,
          errorCode: paymentError.code,
          hint: paymentError.hint,
        });
      }

      if (!paymentData) {
        return res.status(500).json({ 
          success: false,
          error: 'Payment record created but no data returned' 
        });
      }

      // Step 2: Get user profile to add credits
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits, email')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        // Payment is already recorded, but credits couldn't be added
        // Send email notification about this issue
        await sendPaymentNotification({
          paymentId: paymentData.id,
          userId,
          userEmail: 'unknown',
          amount: packageData.price,
          credits: packageData.credits,
          transactionId: transactionId.trim(),
          status: 'completed',
          error: 'Failed to add credits - manual intervention needed',
        });
        
        return res.status(500).json({ 
          success: false,
          error: 'Payment recorded but failed to add credits. Please contact support.',
        });
      }

      // Step 3: Add credits to user account
      const newCredits = (profile.credits || 0) + packageData.credits;
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (creditError) {
        console.error('❌ Credit update error:', creditError);
        // Payment is already recorded, but credits couldn't be added
        await sendPaymentNotification({
          paymentId: paymentData.id,
          userId,
          userEmail: profile.email || 'unknown',
          amount: packageData.price,
          credits: packageData.credits,
          transactionId: transactionId.trim(),
          status: 'completed',
          error: 'Failed to add credits - manual intervention needed',
        });
        
        return res.status(500).json({ 
          success: false,
          error: 'Payment recorded but failed to add credits. Please contact support.',
        });
      }

      // Step 4: Record credit transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: packageData.credits,
          type: 'purchase',
          description: `Purchased ${packageData.credits} credits via bKash (Transaction: ${transactionId.trim()})`,
        });

      // Step 5: Send email notification to admin
      await sendPaymentNotification({
        paymentId: paymentData.id,
        userId,
        userEmail: profile.email || 'unknown',
        amount: packageData.price,
        credits: packageData.credits,
        transactionId: transactionId.trim(),
        status: 'completed',
      });

      console.log('✅ Payment auto-approved and credits added:', {
        paymentId: paymentData.id,
        userId,
        creditsAdded: packageData.credits,
        newTotalCredits: newCredits,
      });

      return res.status(200).json({
        success: true,
        paymentId: paymentData.id,
        status: 'completed',
        message: `✅ Payment approved! ${packageData.credits} credits added to your account.`,
        amount: packageData.price,
        credits: packageData.credits,
        totalCredits: newCredits,
      });
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      console.error('❌ Database error stack:', dbError.stack);
      return res.status(500).json({ 
        success: false,
        error: dbError.message || 'Database error occurred',
        errorType: 'DatabaseError',
      });
    }
  } catch (error: any) {
    console.error('❌ Payment API error:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error stack:', error.stack);
    
    // Always return valid JSON, even for unexpected errors
    try {
      return res.status(500).json({ 
        success: false,
        error: error?.message || 'Internal server error. Please check Vercel logs for details.',
        errorType: 'UnexpectedError',
      });
    } catch (jsonError) {
      // If even JSON response fails, log it
      console.error('❌ Failed to send JSON response:', jsonError);
      // Try to send plain text as last resort
      res.status(500).send('Internal server error');
    }
  }
}

