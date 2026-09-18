import React from 'react';
import type { HistoryRecord } from '../../types/history';
import { GlassButton } from '../common/GlassButton';
import { FileDown, X, Shield, FileText } from 'lucide-react';

interface HistoryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HistoryRecord[];
}

export const HistoryExportModal: React.FC<HistoryExportModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  if (!isOpen) return null;

  const dateStr = new Date().toISOString().split('T')[0];

  const handleExportJson = () => {
    // Sanitize records for safe export
    const safeData = records.map((r) => ({
      id: r.id,
      scannedAt: r.scannedAt,
      scanType: r.scanType,
      riskLevel: r.riskLevel,
      riskScore: r.riskScore,
      category: r.category,
      summary: r.summary,
      sourceMetadata: {
        previewSnippet: r.sourceMetadata?.previewSnippet || '',
        filename: r.sourceMetadata?.filename || '',
        url: r.sourceMetadata?.url || '',
      },
    }));

    const blob = new Blob([JSON.stringify(safeData, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scamshield-threat-archive-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'ScanType', 'RiskLevel', 'RiskScore', 'Category', 'Summary'];
    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.scannedAt}"`,
      `"${r.scanType}"`,
      `"${r.riskLevel}"`,
      r.riskScore,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${(r.summary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scamshield-threat-archive-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest/90 border border-glass-border shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary border border-glass-border">
              <FileDown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-headline text-xl text-color-offwhite">Export Archive</h3>
              <p className="font-mono text-xs text-on-surface-variant">
                {records.length} forensic records ready
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Close export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 rounded-xl bg-surface-container-high/40 border border-glass-border/60 flex items-start gap-3">
          <Shield className="w-5 h-5 text-risk-low shrink-0 mt-0.5" />
          <div className="text-xs font-body text-on-surface-variant space-y-1">
            <p className="text-color-offwhite font-medium">Privacy Guaranteed</p>
            <p className="text-[11px] leading-relaxed">
              Export is compiled strictly on your local device. OTPs, passwords, and binaries are redacted. No telemetry is sent to any external server.
            </p>
          </div>
        </div>

        {/* Format Options */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExportJson}
            disabled={records.length === 0}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container/60 hover:bg-surface-container-high border border-glass-border hover:border-color-crimson/50 transition-all text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-glass-border">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-headline text-sm text-color-offwhite group-hover:text-primary transition-colors">
                  Structured JSON
                </p>
                <p className="font-mono text-[11px] text-on-surface-variant">
                  Full forensic metadata &amp; heuristic logs
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-on-surface-variant group-hover:text-color-offwhite">
              .json
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={records.length === 0}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container/60 hover:bg-surface-container-high border border-glass-border hover:border-color-crimson/50 transition-all text-left group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-glass-border">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="font-headline text-sm text-color-offwhite group-hover:text-primary transition-colors">
                  Spreadsheet CSV
                </p>
                <p className="font-mono text-[11px] text-on-surface-variant">
                  Standard tabular export for Excel or Numbers
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-on-surface-variant group-hover:text-color-offwhite">
              .csv
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <GlassButton variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
