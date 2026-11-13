import { useState, useEffect } from 'react';
import { X, Loader2, Mail, Lock, UserPlus, LogIn, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AccountModal({ open, onClose }: AccountModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      setIsSignUp(false);
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setMessage(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError(t('auth.passwordMismatch'));
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, username);
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setMessage(null);
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-parchment-200 bg-parchment-50 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100 hover:text-ink-800"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-display text-d-headline font-semibold text-ink-800">
            {isSignUp ? t('auth.signUpTitle') : t('auth.signInTitle')}
          </h2>
          <p className="mt-1 text-d-body text-ink-500">
            {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitleModal')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-d-body font-medium text-ink-700">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="mb-2 block text-d-body font-medium text-ink-700">{t('auth.username')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.usernamePlaceholder')}
                  className="input-field pl-11"
                  required
                  minLength={3}
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-d-body font-medium text-ink-700">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="input-field pl-11"
                required
                minLength={6}
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="mb-2 block text-d-body font-medium text-ink-700">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  className="input-field pl-11"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-d-body text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-lavender-50 px-4 py-3 text-d-body text-lavender-700">{message}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="h-4 w-4" />
                {t('auth.createAccount')}
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                {t('auth.signIn')}
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-d-body text-ink-500">
          {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
          <button
            onClick={resetForm}
            className="font-medium text-lavender-600 hover:text-lavender-700"
          >
            {isSignUp ? t('auth.signIn') : t('auth.signUp')}
          </button>
        </p>
      </div>
    </div>
  );
}
