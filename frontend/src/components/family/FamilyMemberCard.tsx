import React, { useState } from 'react';
import { MoreVertical, AlertCircle, CheckCircle2, ChevronRight, Trash2 } from 'lucide-react';
import type { FamilyMember } from '../../types/family';

interface FamilyMemberCardProps {
  member: FamilyMember;
  isOwner: boolean;
  currentUserId?: string;
  onRemoveMember?: (memberId: string) => void;
  onAuditMember?: (member: FamilyMember) => void;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  isOwner,
  currentUserId,
  onRemoveMember,
  onAuditMember,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const isAttentionRequired = member.defenseState === 'ATTENTION REQUIRED' || (member.activeThreatsCount && member.activeThreatsCount > 0);
  const isSelf = member.userId === currentUserId || member.role === 'OWNER';

  return (
    <div className="group relative flex flex-col justify-between p-6 rounded-2xl bg-surface-container-low/90 hover:bg-surface-container transition-all duration-300 shadow-xl border border-glass-border overflow-hidden text-left">
      {/* Subtle Background Glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
          isAttentionRequired ? 'bg-color-crimson/15' : 'bg-risk-low/10'
        }`}
      />

      <div>
        <div className="flex items-start justify-between">
          <div className="relative">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={`Profile portrait of ${member.displayName} (${member.relationship || 'Guardian'})`}
                width={56}
                height={56}
                className={`w-14 h-14 rounded-full object-cover ring-2 ${
                  isAttentionRequired ? 'ring-color-crimson' : 'ring-risk-low/60'
                }`}
              />
            ) : (
              <div
                className={`w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-color-offwhite font-headline text-lg ring-2 ${
                  isAttentionRequired ? 'ring-color-crimson' : 'ring-risk-low/60'
                }`}
              >
                {member.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-surface-container-low ${
                isAttentionRequired ? 'bg-color-crimson' : 'bg-risk-low'
              }`}
            />
          </div>

          {isOwner && !isSelf && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Member options"
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-color-offwhite transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-44 rounded-xl bg-surface-container-high border border-glass-border p-1.5 shadow-2xl z-20 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      if (onRemoveMember) onRemoveMember(member.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-color-crimson hover:bg-color-crimson/20 transition-colors text-left cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from circle</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h3 className="font-headline text-lg text-color-offwhite">{member.displayName}</h3>
            {member.relationship && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-glass-border">
                {member.relationship}
              </span>
            )}
          </div>
          <p className="font-body text-xs text-on-surface-variant mt-0.5">
            {member.deviceInfo || 'Shield Active • Guarded Profile'}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-high/60 border border-glass-border">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-on-surface-variant">Defense State</span>
            <span
              className={`font-semibold text-[10px] uppercase tracking-wider ${
                isAttentionRequired ? 'text-color-crimson' : 'text-risk-low'
              }`}
            >
              {member.defenseState || (isAttentionRequired ? 'ATTENTION REQUIRED' : 'ALL CLEAR')}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-on-surface-variant">Telemetry</span>
            <span className="text-on-surface text-[10px]">
              {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-glass-border/60 flex items-center justify-between">
        {isAttentionRequired ? (
          <span className="font-mono text-[11px] text-color-crimson flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {member.activeThreatsCount || 1} Active Alert
          </span>
        ) : (
          <span className="font-mono text-[11px] text-risk-low flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            0 Active Threats
          </span>
        )}

        <button
          type="button"
          onClick={() => onAuditMember && onAuditMember(member)}
          className="text-primary hover:text-color-offwhite font-headline text-xs flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>{isAttentionRequired ? 'Audit' : 'Details'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
