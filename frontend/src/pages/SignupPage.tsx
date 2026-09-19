import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { BrandEmblem } from '../components/common/BrandEmblem';
import { usePageMeta } from '../hooks/usePageMeta';

export const SignupPage: React.FC = () => {
  usePageMeta({
    title: 'Request Access — ScamShield',
    description: 'Establish your authenticated operative security node on the ScamShield sovereign defense perimeter.',
  });

  const { user, isAuthenticated, signUp, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/scanner', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Compute password entropy and strength level matching Stitch Screen f47a66b8...
  const entropy = useMemo(() => {
    if (!password) {
      return { score: 0, label: 'Entropy: Awaiting passphrase input', pct: '0%' };
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 1) {
      return { score: 1, label: 'Entropy: Vulnerable / Insufficient', pct: '25%' };
    }
    if (score === 2) {
      return { score: 2, label: 'Entropy: Standard Baseline', pct: '50%' };
    }
    if (score === 3) {
      return { score: 3, label: 'Entropy: High Resilience', pct: '75%' };
    }
    return { score: 4, label: 'Entropy: Cryptographic Grade', pct: '100%' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Bot trap check
    if (honeypot) {
      setFormError('Automated bot interaction detected.');
      return;
    }

    if (!displayName.trim()) {
      setFormError('Please enter your full name or operative callsign.');
      return;
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setFormError('Please enter a valid email address format (e.g. name@domain.com).');
      return;
    }

    if (password.length < 8) {
      setFormError('Passphrase must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passphrase confirmation does not match.');
      return;
    }

    try {
      await signUp({
        displayName: displayName.trim(),
        email: trimmedEmail,
        password,
      });

      // On successful signup, navigate to onboarding to build the shield
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed.');
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-8 animate-fadeIn">
        {/* Atmospheric Crimson Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(139,13,26,0.25)_0%,_rgba(139,13,26,0.06)_45%,_transparent_75%)] blur-3xl -z-10" />

        <div className="w-full max-w-[540px] relative">
          {/* Main Glass Card */}
          <div className="relative rounded-3xl bg-surface-container-lowest/85 backdrop-blur-2xl p-7 sm:p-10 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(139,13,26,0.25)] border border-glass-border overflow-hidden">
            {/* Top Hairline Specular Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-color-offwhite/25 to-transparent" />

            {/* Header Block matching Stitch screen f47a66b8... */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-glass-surface border border-glass-border mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
                  Vigilant Sentinel • Initialize Node
                </span>
              </div>

              <div className="w-14 h-14 rounded-full bg-surface-dark flex items-center justify-center shadow-lg border border-glass-border mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 to-transparent" />
                <BrandEmblem size={32} />
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl text-color-offwhite tracking-tight">
                Build your shield.
              </h1>
              <p className="font-body text-sm text-on-surface-variant max-w-sm mt-1">
                Create your ScamShield operative identity and verify digital intent before you click.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bot Honeypot (Accessibility Hidden) */}
              <input
                type="text"
                name="scamshield_signup_trap"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="sr-only opacity-0 absolute -left-[9999px]"
                aria-hidden="true"
              />

              {/* Name Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
                  <label htmlFor="signup-name" className="uppercase tracking-wider">
                    Full Name / Callsign
                  </label>
                  <span className="text-on-surface-variant/60 font-mono text-[10px]">REQUIRED</span>
                </div>

                <div className="relative flex items-center">
                  <UserIcon className="absolute left-4 text-on-surface-variant/60 pointer-events-none w-4 h-4" />
                  <input
                    id="signup-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="e.g. Eleanor Vance"
                    autoComplete="name"
                    required
                    className="w-full pl-11 pr-4 py-3 ss-input text-color-offwhite font-body text-sm rounded-xl border border-glass-border focus:border-color-crimson/80 focus:ring-1 focus:ring-color-crimson/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
                  <label htmlFor="signup-email" className="uppercase tracking-wider">
                    Operative Identifier / Email
                  </label>
                  <span className="text-risk-low font-mono text-[10px]">TLS VALIDATED</span>
                </div>

                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-on-surface-variant/60 pointer-events-none w-4 h-4" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="alex.vance@defense.internal"
                    autoComplete="email"
                    required
                    className="w-full pl-11 pr-4 py-3 ss-input text-color-offwhite font-mono text-xs sm:text-sm rounded-xl border border-glass-border focus:border-color-crimson/80 focus:ring-1 focus:ring-color-crimson/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Master Password */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="signup-password" className="font-mono text-xs text-on-surface-variant uppercase tracking-wider block">
                    Master Passphrase
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 text-on-surface-variant/60 pointer-events-none w-4 h-4" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-10 py-3 ss-input text-color-offwhite font-mono text-xs rounded-xl border border-glass-border focus:border-color-crimson/80 focus:ring-1 focus:ring-color-crimson/50 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 p-1 text-on-surface-variant/70 hover:text-color-offwhite cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5 text-left">
                  <label htmlFor="signup-confirm-password" className="font-mono text-xs text-on-surface-variant uppercase tracking-wider block">
                    Confirm Passphrase
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 text-on-surface-variant/60 pointer-events-none w-4 h-4" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setFormError(null);
                      }}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-10 py-3 ss-input text-color-offwhite font-mono text-xs rounded-xl border border-glass-border focus:border-color-crimson/80 focus:ring-1 focus:ring-color-crimson/50 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 p-1 text-on-surface-variant/70 hover:text-color-offwhite cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Passphrase Strength Meter matching Stitch screen */}
              <div className="space-y-1.5 pt-1 text-left">
                <div className="flex items-center justify-between text-on-surface-variant font-mono text-[11px]">
                  <span>{entropy.label}</span>
                  <span className="font-semibold text-color-offwhite">{entropy.pct}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-colors duration-300 ${
                      entropy.score >= 1 ? (entropy.score === 1 ? 'bg-color-crimson' : entropy.score === 2 ? 'bg-risk-medium' : 'bg-risk-low') : 'bg-surface-variant'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-colors duration-300 ${
                      entropy.score >= 2 ? (entropy.score === 2 ? 'bg-risk-medium' : 'bg-risk-low') : 'bg-surface-variant'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-colors duration-300 ${
                      entropy.score >= 3 ? 'bg-risk-low' : 'bg-surface-variant'
                    }`}
                  />
                  <div
                    className={`h-full rounded-full transition-colors duration-300 ${
                      entropy.score >= 4 ? 'bg-risk-low' : 'bg-surface-variant'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] text-on-surface-variant/70 pt-0.5">
                  <Shield className="w-3 h-3 text-risk-low shrink-0" />
                  <span>Min. 8 characters • Web Crypto SHA-256 local seed • Zero PII leaked</span>
                </div>
              </div>

              {/* Error Banner */}
              {(formError || error) && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-3 rounded-xl bg-color-crimson/20 border border-color-crimson/40 text-primary text-xs font-mono animate-fadeIn"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-color-crimson" />
                  <span>{formError || error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 rounded-full bg-gradient-to-r from-color-crimson via-[#8e101c] to-color-crimson text-color-offwhite font-headline text-base tracking-wide shadow-[0_12px_28px_-6px_rgba(139,13,26,0.6)] hover:shadow-[0_16px_36px_-4px_rgba(139,13,26,0.75)] hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Creating Operative Identity...' : 'Initialize Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch to Sign In */}
            <div className="mt-6 text-center">
              <p className="font-body text-xs text-on-surface-variant">
                Already initialized?{' '}
                <Link
                  to="/login"
                  className="text-color-offwhite hover:text-primary font-medium underline decoration-color-crimson decoration-2 underline-offset-4 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Footer Trust Badges */}
            <div className="mt-6 pt-5 border-t border-glass-border/40 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-on-surface-variant font-mono text-[10px]">
              <span>Ephemeral Encryption</span>
              <span>•</span>
              <span>Zero-Knowledge Core</span>
              <span>•</span>
              <span>LOCAL MOCK AUTH ONLY</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SignupPage;
