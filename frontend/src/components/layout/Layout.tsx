import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { GlassNavbar } from '../common/GlassNavbar';
import { BackgroundAtmosphere } from '../common/BackgroundAtmosphere';
import { scanService } from '../../services/scanService';

export const Layout: React.FC = () => {
  const [backendMode, setBackendMode] = useState<string>('ACTIVE');

  useEffect(() => {
    scanService
      .checkHealth()
      .then((res) => setBackendMode(res.mode || 'LIVE'))
      .catch(() => setBackendMode('ACTIVE'));
  }, []);

  return (
    <div className="min-h-screen bg-color-black text-on-surface flex flex-col relative selection:bg-color-crimson selection:text-color-offwhite">
      {/* Ambient background lighting */}
      <BackgroundAtmosphere />

      {/* Floating navigation bar */}
      <GlassNavbar backendMode={backendMode} />

      {/* Dynamic route outlet */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-glass-border/40 py-8 relative z-10 bg-surface-container-lowest/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant font-mono">
          <div className="flex items-center gap-3">
            <span>SCAMSHIELD SENTRY • HEURISTIC ENGINE V1.0</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-color-offwhite transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-color-offwhite transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/settings" className="hover:text-color-offwhite transition-colors">
              Security Governance
            </Link>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>EPHEMERAL • ZERO RETENTION</span>
            <span>•</span>
            <span className="text-color-crimson font-medium">BUILT ON AWS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
