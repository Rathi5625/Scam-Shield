import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon } from 'lucide-react';

export const AppearanceModeSection: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="appearance-section"
      className="relative rounded-3xl bg-surface-dark p-6 sm:p-8 md:p-10 shadow-[0_12px_36px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(245,242,237,0.1)] border border-glass-border/40 overflow-hidden scroll-mt-28"
    >
      <div className="flex items-center gap-3 mb-2">
        <Moon className="w-6 h-6 text-primary" />
        <h2 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
          Appearance Mode
        </h2>
      </div>
      <p className="font-body text-sm text-secondary mb-8">
        Switch between deep Obsidian nocturnal theme and high-visibility Daylight contrast.
      </p>

      {/* Interactive Mode Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dark Mode Tile */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setTheme('dark')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setTheme('dark');
          }}
          className={`cursor-pointer group relative p-6 rounded-2xl transition-all ${
            isDark
              ? 'bg-surface-container-lowest shadow-[0_0_0_2px_#8B0D1A,0_12px_36px_-8px_rgba(139,13,26,0.35)] border border-color-crimson/50'
              : 'bg-surface-container-low shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] opacity-70 hover:opacity-100 border border-glass-border/30'
          }`}
          id="theme-dark-tile"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-risk-high shadow-[0_0_8px_#8B0D1A]" />
              <span className="font-title text-base font-semibold text-color-offwhite">
                Obsidian Nocturnal
              </span>
            </div>
            <span
              className={`font-mono text-xs uppercase tracking-wider ${
                isDark ? 'text-primary font-bold' : 'text-secondary'
              }`}
            >
              {isDark ? 'Active' : 'Standby'}
            </span>
          </div>

          {/* Mini UI Mockup */}
          <div className="p-4 rounded-xl bg-color-black/80 space-y-2.5 mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] border border-white/5">
            <div className="h-2.5 w-1/3 bg-surface-bright rounded-full" />
            <div className="h-2 w-full bg-surface-container-high rounded-full" />
            <div className="h-2 w-2/3 bg-surface-container-high rounded-full" />
            <div className="flex items-center gap-2 pt-1">
              <div className="w-4 h-4 rounded-full bg-risk-high" />
              <div className="h-2 w-1/4 bg-primary/40 rounded-full" />
            </div>
          </div>

          <p className="font-body text-xs text-secondary">
            Designed for low-light digital command centers, minimal optical fatigue, and maximized threat alert clarity.
          </p>
        </div>

        {/* Daylight Contrast Tile */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setTheme('light')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setTheme('light');
          }}
          className={`cursor-pointer group relative p-6 rounded-2xl transition-all ${
            !isDark
              ? 'bg-surface-container-lowest shadow-[0_0_0_2px_#8B0D1A,0_12px_36px_-8px_rgba(139,13,26,0.35)] border border-color-crimson/50'
              : 'bg-surface-container-low shadow-[inset_0_1px_0_0_rgba(245,242,237,0.06)] opacity-70 hover:opacity-100 border border-glass-border/30'
          }`}
          id="theme-light-tile"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-title text-base font-semibold text-color-offwhite">
                Daylight Contrast
              </span>
            </div>
            <span
              className={`font-mono text-xs uppercase tracking-wider ${
                !isDark ? 'text-primary font-bold' : 'text-secondary'
              }`}
            >
              {!isDark ? 'Active' : 'Standby'}
            </span>
          </div>

          {/* Mini UI Mockup Daylight */}
          <div className="p-4 rounded-xl bg-[#F5F2ED] space-y-2.5 mb-4 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.05)] border border-black/10">
            <div className="h-2.5 w-1/3 bg-black/30 rounded-full" />
            <div className="h-2 w-full bg-black/15 rounded-full" />
            <div className="h-2 w-2/3 bg-black/15 rounded-full" />
            <div className="flex items-center gap-2 pt-1">
              <div className="w-4 h-4 rounded-full bg-color-crimson" />
              <div className="h-2 w-1/4 bg-color-crimson/40 rounded-full" />
            </div>
          </div>

          <p className="font-body text-xs text-secondary">
            Calibrated for high-glare environments and direct sunlight field diagnostics.
          </p>
        </div>
      </div>
    </section>
  );
};
