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
  X
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  credits: number;
  referral_code: string;
  total_referrals: number;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalCredits: number;
  usersToday: number;
  usersThisWeek: number;
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
  const [sortField, setSortField] = useState<'created_at' | 'credits'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Simple admin password (change this!)
  const ADMIN_PASSWORD = 'jomicheck2024admin';

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

      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalUsers = usersData?.length || 0;
      const totalCredits = usersData?.reduce((sum, u) => sum + (u.credits || 0), 0) || 0;
      const usersToday = usersData?.filter(u => new Date(u.created_at) >= today).length || 0;
      const usersThisWeek = usersData?.filter(u => new Date(u.created_at) >= weekAgo).length || 0;

      setStats({
        totalUsers,
        totalCredits,
        usersToday,
        usersThisWeek
      });

    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
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
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
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
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">Total Users</span>
                <Users size={20} className="text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">Total Credits</span>
                <CreditCard size={20} className="text-green-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.totalCredits}</div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">New Today</span>
                <Calendar size={20} className="text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.usersToday}</div>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-sm font-medium">This Week</span>
                <TrendingUp size={20} className="text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{stats.usersThisWeek}</div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">All Users</h2>
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-900">{user.email || 'N/A'}</span>
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
                ))}
                
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

        {/* Instructions */}
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <h3 className="font-bold text-amber-800 mb-2">Admin Notes</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• This panel shows all registered users and their credits</li>
            <li>• Users get 5 free credits on signup</li>
            <li>• Referral bonus: 10 credits for both parties</li>
            <li>• To add credits manually, use Supabase Dashboard → Table Editor → profiles</li>
            <li>• For feedback, add a feedback table in Supabase (coming soon)</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;

