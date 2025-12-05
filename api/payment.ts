import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/supabase';

// Payment gateway integration
// Supports SSLCommerz (primary) and manual verification (fallback)

interface PaymentRequest {
  userId: string;
  packageId: string; // 'starter' | 'popular' | 'pro' | 'agent'
  paymentMethod: 'bkash' | 'nagad';
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, packageId, paymentMethod, transactionId } = req.body as PaymentRequest;

    // Validate input
    if (!userId || !packageId || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const packageData = CREDIT_PACKAGES[packageId];
    if (!packageData) {
      return res.status(400).json({ success: false, error: 'Invalid package' });
    }

    // Only manual verification (bKash/Nagad) is supported
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'Transaction ID required for manual payment' });
      }

      // Create pending payment record
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          package_id: packageId,
          amount: packageData.price,
          credits: packageData.credits,
          payment_method: paymentMethod,
          status: 'pending',
          transaction_id: transactionId,
        })
        .select()
        .single();

      if (error) {
        console.error('Payment record error:', error);
        return res.status(500).json({ 
          success: false,
          error: error.message || 'Failed to create payment record. Please check if payment_transactions table exists in Supabase.' 
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
    }

    return res.status(400).json({ success: false, error: 'Invalid payment method' });
  } catch (error: any) {
    console.error('Payment API error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error. Please check Vercel logs for details.' 
    });
  }
}

