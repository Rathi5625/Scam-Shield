import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HistoryRecord } from '../../types/history';
import {
  MessageSquare,
  Image as ImageIcon,
  Link as LinkIcon,
  ArrowRight,
  Trash2,
  Check,
  X,
} from 'lucide-react';

interface HistoryCardProps {
  record: HistoryRecord;
  onDelete: (id: string) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ record, onDelete }) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Determine risk styling
  const isHigh = record.riskLevel === 'HIGH';
  const isMedium = record.riskLevel === 'MEDIUM';
  const isLow = record.riskLevel === 'LOW';

  const riskBorderColor = isHigh
    ? 'bg-color-crimson shadow-[0_0_12px_#8b0d1a]'
    : isMedium
    ? 'bg-risk-medium shadow-[0_0_12px_#c97a2b]'
    : isLow
    ? 'bg-risk-low shadow-[0_0_12px_#3a7d5c]'
    : 'bg-surface-container-highest';

  const riskBadgeClass = isHigh
    ? 'bg-color-crimson text-color-offwhite'
    : isMedium
    ? 'bg-risk-medium text-color-offwhite'
    : isLow
    ? 'bg-risk-low text-color-offwhite'
    : 'bg-surface-container-high text-on-surface-variant';

  const riskScoreColor = isHigh
    ? 'text-primary'
    : isMedium
    ? 'text-tertiary-fixed-dim'
    : isLow
    ? 'text-risk-low'
    : 'text-on-surface-variant';

  // Format date readable
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(record.scannedAt);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isToday) return `Today, ${timeStr}`;
      if (isYesterday) return `Yesterday, ${timeStr}`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${timeStr}`;
    } catch {
      return record.scannedAt;
    }
  }, [record.scannedAt]);

  const renderIcon = () => {
    if (record.scanType === 'SCREENSHOT') {
      return <ImageIcon className="w-5 h-5 text-primary" />;
    }
    if (record.scanType === 'LINK') {
      return <LinkIcon className="w-5 h-5 text-primary" />;
    }
    return <MessageSquare className="w-5 h-5 text-primary" />;
  };

  const getCategoryTitle = () => {
    if (record.category) {
      return record.category
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return record.scanType === 'LINK' ? 'URL Inspection' : 'Threat Analysis';
  };

  const previewSnippet =
    record.sourceMetadata?.previewSnippet ||
    record.summary ||
    'Archived forensic scan record.';

  return (
    <article
      className="group relative rounded-2xl bg-surface-container-low/75 hover:bg-surface-container/85 backdrop-blur-xl p-5 sm:p-6 transition-all duration-300 border border-glass-border hover:border-glass-border/80 hover:shadow-[0_16px_40px_-12px_rgba(139,13,26,0.3)]"
      data-risk={record.riskLevel.toLowerCase()}
    >
      {/* Left risk indicator bar */}
      <div className={`absolute left-0 top-5 bottom-5 w-1 rounded-r ${riskBorderColor}`} />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 pl-2">
        {/* Main Content Area */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex-shrink-0 flex items-center justify-center border border-glass-border">
            {renderIcon()}
          </div>

          <div className="flex flex-col min-w-0 flex-1 space-y-1.5">
            {/* Top Badge & Metric Meta Line */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold ${riskBadgeClass}`}
              >
                {record.riskLevel} RISK
              </span>

              <span className={`font-mono text-xs font-semibold ${riskScoreColor}`}>
                {record.riskScore} / 100 Threat Index
              </span>

              <span className="text-on-surface-variant/40 hidden sm:inline">•</span>

              <span className="font-mono text-xs text-on-surface-variant flex items-center gap-1">
                {record.scanType === 'TEXT'
                  ? 'Message Scan'
                  : record.scanType === 'SCREENSHOT'
                  ? 'Screenshot OCR'
                  : 'Link Shield'}
              </span>

              <span className="text-on-surface-variant/40 hidden sm:inline">•</span>

              <time
                dateTime={record.scannedAt}
                title={record.scannedAt}
                className="font-mono text-xs text-on-surface-variant/70"
              >
                {formattedDate}
              </time>
            </div>

            {/* Category / Target Headline */}
            <h3
              onClick={() => navigate(`/history/${record.id}`)}
              className="font-headline text-lg sm:text-xl text-color-offwhite hover:text-primary transition-colors cursor-pointer truncate"
            >
              {getCategoryTitle()}
            </h3>

            {/* Sanitized Threat Preview */}
            <p className="font-body text-xs sm:text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
              {previewSnippet}
            </p>

            {/* Red Flag & Indicator Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[10px] border border-glass-border">
                #{record.category || 'THREAT'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[10px] border border-glass-border">
                #{record.scanType}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-container/30 text-primary font-mono text-[10px] border border-color-crimson/30">
                Local Telemetry Verified
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Area */}
        <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-glass-border/40">
          {/* Delete Action with In-Place Confirmation */}
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-color-crimson/20 border border-color-crimson animate-fadeIn">
              <span className="font-mono text-[11px] text-color-offwhite px-2">Delete?</span>
              <button
                type="button"
                onClick={() => onDelete(record.id)}
                className="w-7 h-7 rounded-full bg-color-crimson hover:bg-color-crimson/80 text-color-offwhite flex items-center justify-center transition-colors cursor-pointer"
                title="Confirm delete"
                aria-label="Confirm delete scan"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
                title="Cancel delete"
                aria-label="Cancel delete"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-color-crimson/20 text-on-surface-variant hover:text-color-crimson flex items-center justify-center transition-colors border border-glass-border cursor-pointer"
              title="Delete scan record"
              aria-label="Delete scan record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Open Historical Report CTA */}
          <button
            type="button"
            onClick={() => navigate(`/history/${record.id}`)}
            className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-color-crimson text-color-offwhite flex items-center justify-center transition-all shadow-md group cursor-pointer border border-glass-border"
            title="Inspect historical report"
            aria-label={`Inspect report for ${record.id}`}
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};
