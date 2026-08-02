import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const shield = import.meta.env.VITE_ADMIN_EMAIL_SHIELD?.trim().toLowerCase();
      if (shield && user.email?.trim().toLowerCase() === shield) {
        navigate('/priestess', { replace: true });
      } else {
        navigate('/feed', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    const shield = import.meta.env.VITE_ADMIN_EMAIL_SHIELD?.trim().toLowerCase();
    if (shield && email.trim().toLowerCase() === shield) {
      navigate('/priestess', { replace: true });
    } else {
      navigate('/feed', { replace: true });
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lavender-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-8 pb-24">
      <div className="card p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-ink-800">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-500">Sign in to access your prayer requests and account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="flex items-start gap-2 rounded-lg bg-lavender-50 px-4 py-3 text-sm text-lavender-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Check your email for a password reset link.</span>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>

          {!resetSent && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={submitting}
              className="w-full text-center text-sm font-medium text-lavender-600 hover:text-lavender-700 disabled:opacity-50"
            >
              Forgot password?
            </button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/')}
            className="font-medium text-lavender-600 hover:text-lavender-700"
          >
            Sign up from the home page
          </button>
        </p>
      </div>
    </div>
  );
}
