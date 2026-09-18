import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Production-Safe Error Boundary styled with Obsidian & Crimson Glass
 * Catches rendering exceptions and presents a secure recovery terminal
 * without exposing internal stack traces or secrets to end users.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ScamShield [RECOVERED RENDERING EXCEPTION]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReturnHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handlePurgeCacheAndReload = () => {
    try {
      // Clear temporary items without wiping user accounts
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('scamshield_temp_') || key === 'scamshield_diagnostic_cache')) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Storage unavailable
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans selection:bg-crimson selection:text-color-offwhite" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
          <div className="relative w-full max-w-lg glass-panel p-8 rounded-2xl border border-crimson/40 shadow-2xl shadow-crimson/20 text-center space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-crimson/20 border border-crimson/40 text-crimson-light mx-auto">
              <AlertOctagon className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-crimson-light">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>TERMINAL RECOVERY PROTOCOL</span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-color-offwhite tracking-wide">
                Unexpected Local Exception
              </h1>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-sm mx-auto">
                The local application encountered an isolated runtime error. Your local vaults and encrypted credentials remain secure in browser memory.
              </p>
            </div>

            <div className="p-3.5 rounded-xl ss-card text-[11px] font-mono text-on-surface-variant text-left">
              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider mb-1">
                Diagnostic Signature
              </span>
              <div className="text-crimson-light truncate font-semibold">
                {this.state.error?.message || 'Uncaught Client Exception (Suppressed)'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-color-offwhite text-xs font-mono font-semibold transition shadow-lg shadow-primary/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Terminal</span>
              </button>

              <button
                onClick={this.handleReturnHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/15 hover:bg-white/5 text-xs font-mono text-on-surface-variant transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                onClick={this.handlePurgeCacheAndReload}
                className="text-[10px] font-mono text-muted-foreground hover:text-amber-400 transition underline underline-offset-4"
              >
                Clear Ephemeral Cache & Hard Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
