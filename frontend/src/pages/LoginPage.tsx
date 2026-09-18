import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Check,
} from 'lucide-react';
import { BrandEmblem } from '../components/common/BrandEmblem';

export const LoginPage: React.FC = () => {
  const { user, isAuthenticated, signIn, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Destination to return after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/scanner';

  useEffect(() => {
    if (isAuthenticated) {
      if (user && !user.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim()) {
      setFormError('Please enter your operative identifier or email.');
      return;
    }
    if (!password) {
      setFormError('Please enter your passphrase.');
      return;
    }

    try {
      const profile = await signIn({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (!profile.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@scamshield.internal');
    setPassword('ScamShield2026!');
    setFormError(null);
    clearError();
  };

  return (
    <PageContainer maxWidth="xl">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-8 animate-fadeIn">
        {/* Atmospheric Crimson Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none bg-[radial-gradient(circle,_rgba(139,13,26,0.28)_0%,_rgba(139,13,26,0.08)_45%,_transparent_75%)] blur-3xl -z-10" />

        <div className="w-full max-w-[480px] relative">
          {/* Main Glass Authentication Card matching Stitch Screen a1b1b8bc... */}
          <div className="relative rounded-3xl bg-surface-container-lowest/85 backdrop-blur-2xl p-7 sm:p-10 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(139,13,26,0.25)] border border-glass-border overflow-hidden">
            {/* Top Hairline Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-color-offwhite/25 to-transparent" />

            {/* Header Block */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-glass-surface border border-glass-border mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-color-crimson shadow-[0_0_8px_#8B0D1A] animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">
                  Vigilant Sentinel • Node Auth
                </span>
              </div>

              <div className="w-14 h-14 rounded-full bg-surface-dark flex items-center justify-center shadow-lg border border-glass-border mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 to-transparent" />
                <BrandEmblem size={32} />
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl text-color-offwhite tracking-tight">
                Welcome back.
              </h1>
              <p className="font-body text-sm text-on-surface-variant mt-1">
                Your protection starts here.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
                  <label htmlFor="auth-email" className="uppercase tracking-wider">
                    Operative ID / Email
                  </label>
                  <span className="text-primary text-[10px] tracking-widest uppercase">
                    LOCAL ENCRYPTED
                  </span>
                </div>

                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-on-surface-variant/60 pointer-events-none w-4 h-4" />
                  <input
                    id="auth-email"
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

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
                  <label htmlFor="auth-password" className="uppercase tracking-wider">
                    Passphrase Gate
                  </label>
                  <span className="text-[10px] text-on-surface-variant/60">
                    SHA-256 Hashed
                  </span>
                </div>

                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-on-surface-variant/60 pointer-events-none w-4 h-4" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-11 pr-11 py-3 ss-input text-color-offwhite font-mono text-xs sm:text-sm rounded-xl border border-glass-border focus:border-color-crimson/80 focus:ring-1 focus:ring-color-crimson/50 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 p-1.5 text-on-surface-variant/70 hover:text-color-offwhite transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me / Security Indicator */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded bg-surface-container-high border border-glass-border peer-checked:bg-color-crimson peer-checked:border-color-crimson flex items-center justify-center transition-all">
                    <Check className="w-3 h-3 text-color-offwhite opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="font-body text-xs text-on-surface-variant group-hover:text-color-offwhite transition-colors">
                    Keep perimeter authenticated
                  </span>
                </label>

                <div className="flex items-center gap-1 font-mono text-[11px] text-risk-low">
                  <Shield className="w-3 h-3" />
                  <span>Local Mock</span>
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

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3.5 rounded-full bg-gradient-to-b from-color-crimson to-[#5e0811] text-color-offwhite font-headline text-base tracking-wide shadow-[0_12px_28px_-6px_rgba(139,13,26,0.6)] hover:shadow-[0_16px_36px_-4px_rgba(139,13,26,0.75)] hover:brightness-110 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Credentials Bar */}
            <div className="mt-5 pt-4 border-t border-glass-border/40 text-center">
              <button
                type="button"
                onClick={handleFillDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high border border-glass-border text-on-surface-variant hover:text-color-offwhite font-mono text-[11px] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-color-crimson" />
                <span>Use Demo Operative Credentials</span>
              </button>
            </div>

            {/* Link to Sign Up */}
            <div className="mt-6 text-center">
              <p className="font-body text-xs text-on-surface-variant">
                No security credentials?{' '}
                <Link
                  to="/signup"
                  className="text-color-offwhite hover:text-primary font-medium underline decoration-color-crimson decoration-2 underline-offset-4 transition-colors"
                >
                  Request Protocol Access
                </Link>
              </p>
            </div>

            {/* Footer Trust Indicators */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center opacity-60 font-mono text-[10px] text-on-surface-variant">
              <span>Ephemeral Encryption</span>
              <span>•</span>
              <span>Zero-Knowledge Core</span>
              <span>•</span>
              <span>LOCAL MOCK AUTH ONLY</span>
            </div>
          </div>

          {/* Sub-footer gateway */}
          <div className="mt-4 flex items-center justify-between px-2 text-on-surface-variant/70 font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
              <span>GATEWAY: local-node-01</span>
            </div>
            <span>PORT: 443 [TLS_AES_256_GCM]</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoginPage;
