import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const [session, setSession] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setSession(!!token);
      setLoading(false);
    };
    
    checkAuth();
    
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-secondary animate-spin" />
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
