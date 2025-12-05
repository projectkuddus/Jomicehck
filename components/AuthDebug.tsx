import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthDebug: React.FC = () => {
  const { user, profile, loading, isConfigured } = useAuth();
  const [envCheck, setEnvCheck] = useState<any>({});
  const [sessionCheck, setSessionCheck] = useState<any>(null);

  useEffect(() => {
    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setEnvCheck({
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
      isConfigured: isSupabaseConfigured(),
    });

    // Check session
    supabase.auth.getSession().then(({ data, error }) => {
      setSessionCheck({
        hasSession: !!data.session,
        hasUser: !!data.session?.user,
        userEmail: data.session?.user?.email || null,
        error: error?.message || null,
      });
    });
  }, []);

  // Only show in development or if there's an issue
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md z-50">
      <div className="font-bold mb-2">🔍 Auth Debug Info</div>
      
      <div className="space-y-2">
        <div>
          <div className="text-yellow-400">Environment:</div>
          <div>URL: {envCheck.hasUrl ? '✅' : '❌'} ({envCheck.urlPreview})</div>
          <div>Key: {envCheck.hasKey ? '✅' : '❌'} ({envCheck.keyLength} chars)</div>
          <div>Configured: {envCheck.isConfigured ? '✅' : '❌'}</div>
        </div>
        
        <div>
          <div className="text-yellow-400">Auth State:</div>
          <div>Loading: {loading ? '⏳' : '✅'}</div>
          <div>User: {user ? `✅ ${user.email}` : '❌'}</div>
          <div>Profile: {profile ? `✅ ${profile.credits} credits` : '❌'}</div>
        </div>
        
        <div>
          <div className="text-yellow-400">Session:</div>
          <div>Has Session: {sessionCheck?.hasSession ? '✅' : '❌'}</div>
          <div>User Email: {sessionCheck?.userEmail || 'None'}</div>
          {sessionCheck?.error && (
            <div className="text-red-400">Error: {sessionCheck.error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;

