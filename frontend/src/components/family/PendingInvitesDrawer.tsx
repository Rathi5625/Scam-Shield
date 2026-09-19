import React, { useState } from 'react';
import { X, Check, Trash2, Clock } from 'lucide-react';
import type { FamilyInvite } from '../../types/family';

interface PendingInvitesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invites: FamilyInvite[];
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
}

export const PendingInvitesDrawer: React.FC<PendingInvitesDrawerProps> = ({
  isOpen,
  onClose,
  invites,
  onAccept,
  onDecline,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAccept = async (id: string) => {
    try {
      setProcessingId(id);
      await onAccept(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      setProcessingId(id);
      await onDecline(id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-color-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-low border border-glass-border p-6 sm:p-8 shadow-2xl text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high w-fit mb-3 border border-glass-border">
          <Clock className="w-3.5 h-3.5 text-tertiary" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-color-offwhite">
            PENDING INVITATIONS
          </span>
        </div>

        <h3 className="font-headline text-2xl text-color-offwhite">Pending Invitations</h3>
        <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
          Review and respond to family protection invitations sent to you.
        </p>

        <div className="mt-6 space-y-3 max-h-80 overflow-y-auto pr-1">
          {invites.length === 0 ? (
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-glass-border text-center text-on-surface-variant text-xs font-mono">
              No pending invitations found.
            </div>
          ) : (
            invites.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-xl bg-surface-container-lowest border border-glass-border flex items-center justify-between gap-3"
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="font-headline text-sm text-color-offwhite truncate">
                    {inv.email}
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    {inv.relationship || 'Family Member'} • Sent {new Date(inv.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={processingId === inv.id}
                    onClick={() => handleAccept(inv.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-risk-low hover:brightness-110 text-color-offwhite font-mono text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>

                  <button
                    type="button"
                    disabled={processingId === inv.id}
                    onClick={() => handleDecline(inv.id)}
                    className="p-1.5 rounded-lg bg-surface-container-high hover:bg-color-crimson/30 text-on-surface-variant hover:text-color-crimson transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-glass-border/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container-high text-xs font-mono text-color-offwhite hover:bg-surface-variant cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
