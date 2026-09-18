import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Global Theme Toggle
 * Source of Truth: Stitch Navbar Theme Switch
 * Controls centralized theme: Obsidian Nocturnal (Dark) / Daylight High-Contrast (Light)
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`relative flex items-center justify-center p-1.5 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={!isDark}
        aria-label="Toggle Obsidian Nocturnal or Daylight High-Contrast Theme"
        onClick={toggleTheme}
        className="relative w-14 h-7 rounded-full bg-[#1c1b1b] dark:bg-[#1c1b1b] light:bg-[#e2ded7] p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] flex items-center border border-white/10"
      >
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] ${
            isDark
              ? 'translate-x-0 bg-[#3a3939] text-[#F5F2ED]'
              : 'translate-x-7 bg-[#F5F2ED] text-[#8B0D1A]'
          }`}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-[#F5F2ED]" />
          ) : (
            <Sun className="w-3 h-3 text-[#8B0D1A]" />
          )}
        </div>
      </button>
    </div>
  );
};
