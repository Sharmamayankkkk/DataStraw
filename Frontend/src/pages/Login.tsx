import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        alert('Signup must be routed through backend. Disabled in this migration step.');
      } else {
        const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });
        
        const { session, user } = response.data;
        if (session) {
          localStorage.setItem('token', session.access_token);
          if (user && user.email) {
            localStorage.setItem('userEmail', user.email);
          }
          // Dispatch a custom event so other components (like ProtectedRoute/App) know auth state changed
          window.dispatchEvent(new Event('authChange'));
        }
        
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg-secondary rounded-2xl border border-border-subtle p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-4">
            <Ticket className="w-6 h-6 text-bg-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SupportDesk</h1>
          <p className="text-text-secondary mt-2 text-sm text-center">
            {isSignUp ? 'Create a new account' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="bg-status-danger/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bg-primary border border-border-subtle text-text-primary block w-full pl-10 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-brand-secondary transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-secondary" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-bg-primary border border-border-subtle text-text-primary block w-full pl-10 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-brand-secondary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-secondary text-bg-primary font-medium py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-brand-secondary hover:text-brand-primary font-medium"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}
