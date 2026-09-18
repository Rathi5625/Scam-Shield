import React from 'react';

export const BackgroundAtmosphere: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Deep obsidian base */}
      <div className="absolute inset-0 bg-color-black" />

      {/* Subtle crimson ambient glow top center */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[48rem] h-[26rem] bg-color-crimson/15 rounded-full blur-[140px]" />

      {/* Secondary restrained ambient shadow bottom right */}
      <div className="absolute top-[32rem] -right-24 w-[32rem] h-[32rem] bg-color-crimson/5 rounded-full blur-[160px]" />
    </div>
  );
};
