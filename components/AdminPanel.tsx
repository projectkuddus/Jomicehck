import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  RefreshCcw, 
  Shield, 
  Calendar,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  X,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  credits: number;
  referral_code: string;
  total_referrals: number;
  created_at: string;
}

interface PaymentTransaction {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  credits: number;
  payment_method: string;
  transaction_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  verified_at: string | null;
  created_at: string;
  user_email?: string;
}

interface AdminStats {
  totalUsers: number;
  totalCredits: number;
  usersToday: number;
  usersThisWeek: number;
  totalRevenue?: number;
  paymentsToday?: number;
}

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('payments'); // Default to payments
  const [sortField, setSortField] = useState<'created_at' | 'credits'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Admin password from environment variable (set in Vercel)
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'jomicheck2024admin';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      fetchData();
    } else {
      setError('Invalid password');
    }
  };

  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      return;
    }

    setLoading(true);
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (usersError) throw usersError;

      setUsers(usersData || []);

      // Fetch payment transactions
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!paymentsError && paymentsData) {
        // Get user emails for payments
        const paymentsWithEmails = await Promise.all(
          paymentsData.map(async (payment) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', payment.user_id)
              .single();
            return { ...payment, user_email: profile?.email || 'Unknown' };
          })
        );
        setPayments(paymentsWithEmails);
      }

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalUsers = usersData?.length || 0;
      const totalCredits = usersData?.reduce((sum, u) => sum + (u.credits || 0), 0) || 0;
      const usersToday = usersData?.filter(u => new Date(u.created_at) >= today).length || 0;
      const usersThisWeek = usersData?.filter(u => new Date(u.created_at) >= weekAgo).length || 0;

      // Calculate payment stats
      const completedPayments = paymentsWithEmails.filter(p => p.status === 'completed');
      const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
      const paymentsToday = paymentsWithEmails.filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate >= today;
      }).length;

      setStats({
        totalUsers,
        totalCredits,
        usersToday,
        usersThisWeek,
        totalRevenue,
        paymentsToday
      } as AdminStats);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId: string) => {
    try {
      const response = await fetch('/api/payment-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, verified: true }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh data
        await fetchData();
        alert(`Payment verified! ${data.credits} credits added to user account.`);
      } else {
        alert('Failed to verify payment: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error verifying payment: ' + err.message);
    }
  };

  const rejectPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    try {
      const response = await fetch('/api/payment-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, verified: false }),
      });

      const data = await response.json();
      
      if (data.success !== false) {
        await fetchData();
        alert('Payment rejected.');
      }
    } catch (err: any) {
      alert('Error rejecting payment: ' + err.message);
    }
  };

  const toggleSort = (field: 'created_at' | 'credits') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [sortField, sortOrder]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
      setLastRefresh(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Admin Access</h2>
                <p className="text-sm text-slate-500">Enter admin password</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Admin Password"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none mb-4"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm mb-4 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
          >
            Access Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-red-400" />
          <h1 className="text-xl font-bold">JomiCheck Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            Last: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled (30s)' : 'Auto-refresh disabled'}
          >
            <RefreshCcw size={16} className={autoRefresh && !loading ? 'animate-spin' : ''} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </button>
          <button
            onClick={() => {
              fetchData();
              setLastRefresh(new Date());
            }}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh Now
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
          >
            <X size={16} />
            Close
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-semibold text-sm transition-colors ${
              activeTab === 'users'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-semibold text-sm transition-colors relative ${
              activeTab === 'payments'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign size={16} className="inline mr-2" />
            Payments ({payments.filter(p => p.status === 'pending').length} pending)
            {payments.filter(p => p.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">Total Users</span>
                <Users size={20} className="text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
              <div className="text-xs text-slate-500 mt-1">{stats.usersToday} new today</div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">Total Revenue</span>
                <DollarSign size={20} className="text-green-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">৳{stats.totalRevenue || 0}</div>
              <div className="text-xs text-slate-500 mt-1">{stats.paymentsToday || 0} payments today</div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">Total Credits</span>
                <CreditCard size={20} className="text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalCredits}</div>
              <div className="text-xs text-slate-500 mt-1">In circulation</div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">This Week</span>
                <TrendingUp size={20} className="text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.usersThisWeek}</div>
              <div className="text-xs text-slate-500 mt-1">New users</div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment Transactions</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Shows all payments with user details. Updates automatically every 30 seconds.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  {payments.filter(p => p.status === 'completed').length} completed
                </div>
                <div className="text-xs text-slate-500">
                  {payments.filter(p => p.status === 'pending').length} pending
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">User</th>
                    <th className="px-6 py-3 text-left font-semibold">Package</th>
                    <th className="px-6 py-3 text-left font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold">Credits</th>
                    <th className="px-6 py-3 text-left font-semibold">Method</th>
                    <th className="px-6 py-3 text-left font-semibold">Transaction ID</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => {
                    const isNew = new Date(payment.created_at) > new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
                    return (
                    <tr 
                      key={payment.id} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isNew ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{payment.user_email || 'Unknown'}</span>
                          {isNew && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 capitalize">{payment.package_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">৳{payment.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{payment.credits} credits</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded capitalize">
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                          {payment.transaction_id || 'N/A'}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {payment.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                          {payment.status === 'failed' && <XCircle size={12} className="mr-1" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock size={12} />
                          {formatDate(payment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => verifyPayment(payment.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={12} />
                              Verify
                            </button>
                            <button
                              onClick={() => rejectPayment(payment.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </div>
                        )}
                        {payment.status === 'completed' && (
                          <span className="text-xs text-green-600">✓ Verified</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                  
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        No payments yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Users</h2>
              <p className="text-xs text-slate-500 mt-1">
                Shows all registered users. Updates automatically when new accounts are created.
              </p>
            </div>
            <span className="text-sm text-slate-500">{users.length} total</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-100"
                    onClick={() => toggleSort('credits')}
                  >
                    <span className="flex items-center gap-1">
                      Credits
                      {sortField === 'credits' && (
                        sortOrder === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                      )}
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">Referral Code</th>
                  <th className="px-6 py-3 text-left font-semibold">Referrals</th>
                  <th 
                    className="px-6 py-3 text-left font-semibold cursor-pointer hover:bg-slate-100"
                    onClick={() => toggleSort('created_at')}
                  >
                    <span className="flex items-center gap-1">
                      Joined
                      {sortField === 'created_at' && (
                        sortOrder === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isNew = new Date(user.created_at) > new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
                  return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-50 transition-colors ${
                      isNew ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{user.email || 'N/A'}</span>
                        {isNew && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.credits > 10 ? 'bg-green-100 text-green-700' : 
                        user.credits > 0 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.credits}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                        {user.referral_code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{user.total_referrals || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={12} />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                  </tr>
                  );
                })}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      {loading ? 'Loading...' : 'No users yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-bold text-amber-800 mb-2">Admin Instructions</h3>
          <ul className="text-sm text-amber-700 space-y-2">
            <li><strong>Payment System:</strong> Payments are automatically approved and credits are added instantly. Review payments here to verify transactions in your bKash account.</li>
            <li><strong>Auto-Refresh:</strong> The panel updates automatically every 30 seconds. Toggle "Auto" button to enable/disable.</li>
            <li><strong>New Entries:</strong> New accounts and payments are highlighted with a "NEW" badge for the first 5 minutes.</li>
            <li><strong>Manual Credit Addition:</strong> Go to Supabase Dashboard → Table Editor → profiles → Edit user → Update credits field</li>
            <li><strong>Free Credits:</strong> Users get 5 free credits on signup</li>
            <li><strong>Referral Bonus:</strong> 10 credits for both referrer and referee</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;

