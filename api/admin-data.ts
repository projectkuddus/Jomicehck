import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Admin data API endpoint
// Uses service role key to bypass RLS and fetch all users/payments

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check admin password
    const adminPassword = req.headers['x-admin-password'] || req.query.password;
    const expectedPassword = process.env.VITE_ADMIN_PASSWORD || 'jomicheck2024admin';

    if (adminPassword !== expectedPassword) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Check Supabase configuration
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        success: false,
        error: 'Server configuration error: Supabase credentials missing' 
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

    // Fetch all users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Users fetch error:', usersError);
      return res.status(500).json({ 
        success: false,
        error: `Failed to fetch users: ${usersError.message}` 
      });
    }

    // Fetch payment transactions
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (paymentsError) {
      console.error('❌ Payments fetch error:', paymentsError);
      // Continue even if payments fail
    }

    // Get user emails for payments
    let paymentsWithEmails: any[] = [];
    if (paymentsData) {
      paymentsWithEmails = await Promise.all(
        paymentsData.map(async (payment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', payment.user_id)
            .single();
          return { ...payment, user_email: profile?.email || 'Unknown' };
        })
      );
    }

    // Add payment info to each user
    const usersWithPayments = (usersData || []).map(user => {
      const userPayments = paymentsWithEmails.filter(p => p.user_id === user.id && p.status === 'completed');
      const totalPaid = userPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const transactionIds = userPayments.map((p: any) => p.transaction_id).filter(Boolean) as string[];
      const lastPayment = userPayments.length > 0 ? userPayments[0].created_at : undefined;

      return {
        ...user,
        payment_info: {
          totalPaid,
          totalPayments: userPayments.length,
          lastPayment,
          transactionIds
        }
      };
    });

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = usersData?.length || 0;
    const totalCredits = usersData?.reduce((sum: number, u: any) => sum + (u.credits || 0), 0) || 0;
    const usersToday = usersData?.filter((u: any) => new Date(u.created_at) >= today).length || 0;
    const usersThisWeek = usersData?.filter((u: any) => new Date(u.created_at) >= weekAgo).length || 0;

    const completedPayments = paymentsWithEmails.filter((p: any) => p.status === 'completed');
    const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const paymentsToday = paymentsWithEmails.filter((p: any) => {
      const paymentDate = new Date(p.created_at);
      return paymentDate >= today;
    }).length;

    return res.status(200).json({
      success: true,
      users: usersWithPayments,
      payments: paymentsWithEmails,
      stats: {
        totalUsers,
        totalCredits,
        usersToday,
        usersThisWeek,
        totalRevenue,
        paymentsToday
      }
    });

  } catch (error: any) {
    console.error('❌ Admin data API error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
}

