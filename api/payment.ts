import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './lib/supabase';

// Payment gateway integration
// Supports SSLCommerz (primary) and manual verification (fallback)

interface PaymentRequest {
  userId: string;
  packageId: string; // 'starter' | 'popular' | 'pro' | 'agent'
  paymentMethod: 'bkash' | 'nagad' | 'sslcommerz';
  transactionId?: string; // For manual verification
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
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const packageData = CREDIT_PACKAGES[packageId];
    if (!packageData) {
      return res.status(400).json({ error: 'Invalid package' });
    }

    // For SSLCommerz, we'll create a payment session
    if (paymentMethod === 'sslcommerz') {
      // TODO: Integrate SSLCommerz API here
      // For now, return payment URL (you'll need SSLCommerz credentials)
      const sslcommerzStoreId = process.env.SSLCOMMERZ_STORE_ID;
      const sslcommerzStorePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
      const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

      if (!sslcommerzStoreId || !sslcommerzStorePassword) {
        // Fallback: Create pending payment record for manual verification
        const { data, error } = await supabase
          .from('payment_transactions')
          .insert({
            user_id: userId,
            package_id: packageId,
            amount: packageData.price,
            credits: packageData.credits,
            payment_method: paymentMethod,
            status: 'pending',
            transaction_id: transactionId || `PENDING_${Date.now()}`,
          })
          .select()
          .single();

        if (error) {
          console.error('Payment record error:', error);
          return res.status(500).json({ error: 'Failed to create payment record' });
        }

        return res.status(200).json({
          success: true,
          paymentId: data.id,
          status: 'pending_verification',
          message: 'Payment pending manual verification. Please send payment and contact support with transaction ID.',
          amount: packageData.price,
          credits: packageData.credits,
        });
      }

      // SSLCommerz integration would go here
      // Return payment URL for redirect
      return res.status(200).json({
        success: true,
        paymentUrl: `https://${isLive ? 'securepay' : 'sandbox'}.sslcommerz.com/EasyCheckOut/${sslcommerzStoreId}`,
        amount: packageData.price,
        credits: packageData.credits,
      });
    }

    // For manual verification (bKash/Nagad)
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!transactionId) {
        return res.status(400).json({ error: 'Transaction ID required for manual payment' });
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
        return res.status(500).json({ error: 'Failed to create payment record' });
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

    return res.status(400).json({ error: 'Invalid payment method' });
  } catch (error: any) {
    console.error('Payment API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

