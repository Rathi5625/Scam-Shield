import React from 'react';

interface BrandEmblemProps {
  className?: string;
  size?: number;
}

/**
 * ScamShield Official Brand Emblem
 * Source of Truth: Stitch Asset `35b323287c9a4416941b34f0933e57b3`
 */
export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  className = 'w-8 h-8',
  size,
}) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      className={`shrink-0 ${className}`}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M24 4L8 10V22C8 31.8 14.8 40.9 24 44C33.2 40.9 40 31.8 40 22V10L24 4Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.06"
      />
      <path
        d="M24 12V36"
        stroke="#8B0D1A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="24"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="var(--bg-page)"
      />
      <circle
        cx="24"
        cy="24"
        r="2.5"
        fill="#8B0D1A"
      />
    </svg>
  );
};
