import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { Trash2, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

interface ImagePreviewCardProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
  onScan: () => void;
  scanning?: boolean;
}

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({
  file,
  previewUrl,
  onRemove,
  onScan,
  scanning = false,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <GlassCard variant="elevated" className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header with file metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-glass-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-glass-border flex items-center justify-center shrink-0 text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-headline text-base text-color-offwhite truncate">
              {file.name}
            </h4>
            <span className="font-mono text-xs text-on-surface-variant">
              {formatBytes(file.size)} • {file.type || 'image/png'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={scanning}
          aria-label="Remove uploaded image"
          className="min-h-[44px] px-3 py-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high text-xs font-mono text-on-surface-variant hover:text-color-offwhite border border-glass-border flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5 text-color-crimson" />
          <span>Remove Image</span>
        </button>
      </div>

      {/* Image Preview Container (Preserves Aspect Ratio, No Distortion, No Overflow) */}
      <div className="relative w-full max-h-[380px] rounded-2xl bg-surface-container-lowest/80 border border-glass-border overflow-hidden flex items-center justify-center p-2">
        <img
          src={previewUrl}
          alt={`Forensic inspection view of uploaded screenshot ${file.name}`}
          className="max-h-[340px] max-w-full object-contain rounded-xl shadow-md transition-transform duration-300"
        />
      </div>

      {/* Safety Notice & Scan CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <span className="font-mono text-[11px] text-on-surface-variant/80 text-center sm:text-left">
          * Local analysis preview. Image is not persisted.
        </span>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <GlassButton
            variant="outline"
            size="md"
            onClick={onRemove}
            disabled={scanning}
            className="min-h-[44px] flex-1 sm:flex-initial"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Replace
          </GlassButton>

          <GlassButton
            variant="primary"
            size="md"
            onClick={onScan}
            loading={scanning}
            className="min-h-[44px] flex-1 sm:flex-initial"
            icon={<ShieldCheck className="w-5 h-5" />}
          >
            Scan Screenshot
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
};
