import React from 'react';
import { UserPlus } from 'lucide-react';

interface ExpandCircleCardProps {
  onInviteClick: () => void;
}

export const ExpandCircleCard: React.FC<ExpandCircleCardProps> = ({ onInviteClick }) => {
  return (
    <div
      onClick={onInviteClick}
      className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-surface-container-lowest/60 hover:bg-surface-container-low transition-all duration-300 cursor-pointer group shadow-lg min-h-[260px] border border-dashed border-glass-border hover:border-color-crimson/50"
    >
      <div className="w-14 h-14 rounded-full bg-surface-container-high group-hover:bg-surface-variant flex items-center justify-center text-on-surface-variant group-hover:text-color-offwhite transition-all transform group-hover:scale-105 border border-glass-border">
        <UserPlus className="w-6 h-6 text-primary" />
      </div>

      <h3 className="font-headline text-lg text-color-offwhite mt-4">Expand Circle</h3>

      <p className="font-body text-xs text-on-surface-variant mt-1.5 max-w-[210px] leading-relaxed">
        Add child, spouse, or grandparent. Up to 5 members on Family Plan.
      </p>

      <span className="mt-4 font-mono text-[11px] text-primary uppercase tracking-wider group-hover:underline font-semibold">
        Send Setup Link
      </span>
    </div>
  );
};
