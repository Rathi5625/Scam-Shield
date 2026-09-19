import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { GlassButton } from '../components/common/GlassButton';
import { HistoryCard } from '../components/history/HistoryCard';
import { ThreatAnalyticsBar } from '../components/history/ThreatAnalyticsBar';
import { HistoryExportModal } from '../components/history/HistoryExportModal';
import {
  historyRepository,
  calculateThreatAnalytics,
} from '../services/history/LocalScanHistoryRepository';
import type {
  HistoryRecord,
  RiskFilter,
  ScanTypeFilter,
  DateRangeFilter,
  SortOption,
} from '../types/history';
import { LoadingState } from '../components/common/LoadingState';
import {
  Search,
  FileDown,
  Trash2,
  Shield,
  ArrowRight,
  Sparkles,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const HistoryPage: React.FC = () => {
  usePageMeta({
    title: 'Scan History — ScamShield',
    description: 'Review, search, and export your local and synchronized threat scan history with privacy sanitization.',
  });

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [scanTypeFilter, setScanTypeFilter] = useState<ScanTypeFilter>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');

  // Modals State
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load records from local repository
  const loadRecords = async () => {
    try {
      const all = await historyRepository.getAllScans();
      setRecords(all);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live threat analytics
  const analytics = useMemo(() => {
    return calculateThreatAnalytics(records);
  }, [records]);

  // Handle single item deletion
  const handleDeleteRecord = async (id: string) => {
    await historyRepository.deleteScan(id);
    await loadRecords();
  };

  // Handle clear all history
  const handleClearAll = async () => {
    await historyRepository.clearAllScans();
    setIsClearConfirmOpen(false);
    await loadRecords();
  };

  // Filter & Sort records
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        // Risk Filter
        if (riskFilter !== 'ALL' && record.riskLevel !== riskFilter) {
          return false;
        }

        // Scan Type Filter
        if (scanTypeFilter !== 'ALL' && record.scanType !== scanTypeFilter) {
          return false;
        }

        // Date Range Filter
        if (dateRangeFilter !== 'ALL') {
          const scanTime = new Date(record.scannedAt).getTime();
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;

          if (dateRangeFilter === 'TODAY') {
            const midnight = new Date();
            midnight.setHours(0, 0, 0, 0);
            if (scanTime < midnight.getTime()) return false;
          } else if (dateRangeFilter === '7_DAYS') {
            if (now - scanTime > 7 * oneDayMs) return false;
          } else if (dateRangeFilter === '30_DAYS') {
            if (now - scanTime > 30 * oneDayMs) return false;
          }
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCategory = (record.category || '').toLowerCase().includes(q);
          const matchSummary = (record.summary || '').toLowerCase().includes(q);
          const matchRisk = record.riskLevel.toLowerCase().includes(q);
          const matchType = record.scanType.toLowerCase().includes(q);
          const matchSnippet = (record.sourceMetadata?.previewSnippet || '')
            .toLowerCase()
            .includes(q);

          if (!matchCategory && !matchSummary && !matchRisk && !matchType && !matchSnippet) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime();
        }
        if (sortBy === 'THREAT_HIGHEST') {
          return (b.riskScore || 0) - (a.riskScore || 0);
        }
        return 0;
      });
  }, [records, riskFilter, scanTypeFilter, dateRangeFilter, searchQuery, sortBy]);

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="py-24">
          <LoadingState message="Loading threat archive from local vault..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
      <div className="space-y-8 animate-fadeIn">
        {/* Top Header matching Stitch screen ad7205133dec43159a4c1b8d774d8d2a */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 backdrop-blur-md border border-glass-border w-fit">
              <span className="w-2 h-2 rounded-full bg-color-crimson animate-ping" />
              <span className="font-mono text-xs text-color-offwhite tracking-wider uppercase">
                Forensic Archive • Persistent Telemetry
              </span>
            </div>

            <h1 className="font-headline text-4xl sm:text-5xl text-color-offwhite tracking-tight">
              Your scan history
            </h1>

            <p className="font-body text-base text-on-surface-variant leading-relaxed">
              Review verified messages, spoofed links, and neural threat verdicts recorded across your defense boundary.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-end">
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              disabled={records.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-high/80 hover:bg-surface-container-highest text-color-offwhite font-mono text-xs transition-all shadow-sm border border-glass-border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4 text-primary" />
              <span>Export (JSON/CSV)</span>
            </button>

            {records.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-color-crimson/15 hover:bg-color-crimson/30 text-primary hover:text-color-offwhite font-mono text-xs transition-all border border-color-crimson/40 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Telemetry Summary Cards */}
        <ThreatAnalyticsBar analytics={analytics} />

        {/* Sticky Search & Multi-Filter Control Bar matching Stitch design */}
        <div className="sticky top-20 z-30 flex flex-col gap-3 p-3 rounded-3xl bg-surface-dark/95 backdrop-blur-2xl border border-glass-border shadow-[0_16px_32px_-12px_rgba(0,0,0,0.85)]">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-2.5 flex-1 max-w-xl px-4 py-2 rounded-full bg-surface-container-low/80 border border-glass-border/60 focus-within:border-glass-border transition-colors">
              <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by domain, keyword, or threat vector..."
                className="w-full bg-transparent font-body text-sm text-color-offwhite placeholder:text-on-surface-variant/50 focus:outline-none min-w-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-on-surface-variant hover:text-color-offwhite p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[10px] border border-glass-border">
                ⌘K
              </kbd>
            </div>

            {/* Risk Filter Chips */}
            <div className="flex items-center overflow-x-auto gap-1.5 py-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setRiskFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all whitespace-nowrap cursor-pointer ${
                  riskFilter === 'ALL'
                    ? 'bg-surface-bright text-color-offwhite shadow-sm border border-glass-border'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high'
                }`}
              >
                All ({records.length})
              </button>

              <button
                type="button"
                onClick={() => setRiskFilter('HIGH')}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  riskFilter === 'HIGH'
                    ? 'bg-color-crimson text-color-offwhite shadow-crimson-glow border border-color-crimson'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-color-crimson" />
                <span>High Risk ({analytics.highRiskCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRiskFilter('MEDIUM')}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  riskFilter === 'MEDIUM'
                    ? 'bg-risk-medium text-color-offwhite shadow-sm border border-risk-medium'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-risk-medium" />
                <span>Medium Risk ({analytics.mediumRiskCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRiskFilter('LOW')}
                className={`px-3.5 py-1.5 rounded-full font-mono text-xs transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  riskFilter === 'LOW'
                    ? 'bg-risk-low text-color-offwhite shadow-sm border border-risk-low'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-risk-low" />
                <span>Low Risk ({analytics.lowRiskCount})</span>
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 pr-2">
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider hidden sm:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort scan records"
                className="bg-surface-container-low border border-glass-border text-color-offwhite font-mono text-xs rounded-full px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="NEWEST" className="bg-surface-container-high">
                  Newest first
                </option>
                <option value="OLDEST" className="bg-surface-container-high">
                  Oldest first
                </option>
                <option value="THREAT_HIGHEST" className="bg-surface-container-high">
                  Highest threat score
                </option>
              </select>
            </div>
          </div>

          {/* Sub-Filters: Scan Type & Date Range */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-glass-border/40 text-xs font-mono">
            {/* Scan Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant/70 uppercase text-[10px]">Type:</span>
              <div className="flex items-center gap-1">
                {(['ALL', 'TEXT', 'SCREENSHOT', 'LINK'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setScanTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      scanTypeFilter === type
                        ? 'bg-surface-container-high text-color-offwhite font-semibold border border-glass-border'
                        : 'text-on-surface-variant hover:text-color-offwhite'
                    }`}
                  >
                    {type === 'ALL'
                      ? 'All'
                      : type === 'TEXT'
                      ? 'Messages'
                      : type === 'SCREENSHOT'
                      ? 'Screenshots'
                      : 'Links'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant/70 uppercase text-[10px]">Date:</span>
              <div className="flex items-center gap-1">
                {(['ALL', 'TODAY', '7_DAYS', '30_DAYS'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setDateRangeFilter(range)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      dateRangeFilter === range
                        ? 'bg-surface-container-high text-color-offwhite font-semibold border border-glass-border'
                        : 'text-on-surface-variant hover:text-color-offwhite'
                    }`}
                  >
                    {range === 'ALL'
                      ? 'All Time'
                      : range === 'TODAY'
                      ? 'Today'
                      : range === '7_DAYS'
                      ? 'Last 7 Days'
                      : 'Last 30 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scan List / Empty State */}
        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 sm:p-20 rounded-3xl bg-surface-container-low/40 backdrop-blur-2xl border border-glass-border py-20">
            <div className="relative w-20 h-20 rounded-full bg-surface-container-high/60 flex items-center justify-center mb-5 border border-glass-border">
              <div className="absolute inset-0 rounded-full border border-color-crimson/30 animate-ping" />
              <Shield className="w-9 h-9 text-primary" />
            </div>

            <h3 className="font-headline text-2xl sm:text-3xl text-color-offwhite">
              {records.length === 0 ? 'Nothing suspicious here yet.' : 'No matching threat scans found.'}
            </h3>

            <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-md mt-2 leading-relaxed">
              {records.length === 0
                ? 'Your analyzed messages, suspicious link redirections, and uploaded screenshots will appear here chronologically.'
                : 'Try adjusting your risk filter, scan type, or search terms to locate stored records.'}
            </p>

            {records.length === 0 ? (
              <Link
                to="/scan"
                className="mt-6 px-7 py-3 rounded-full bg-color-crimson hover:bg-primary-container text-color-offwhite font-headline text-sm transition-all shadow-[0_12px_28px_-6px_rgba(139,13,26,0.6)] flex items-center gap-2.5 cursor-pointer border border-color-crimson/40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start your first scan</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setRiskFilter('ALL');
                  setScanTypeFilter('ALL');
                  setDateRangeFilter('ALL');
                  setSearchQuery('');
                }}
                className="mt-6 px-6 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-color-offwhite font-mono text-xs transition-colors flex items-center gap-2 cursor-pointer border border-glass-border"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline of History Cards */}
            <div className="space-y-3.5">
              {filteredRecords.map((record) => (
                <HistoryCard
                  key={record.id}
                  record={record}
                  onDelete={handleDeleteRecord}
                />
              ))}
            </div>

            {/* Bottom Footer Information Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-glass-border/40 px-2 font-mono text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-color-offwhite">{filteredRecords.length}</strong> of{' '}
                  <strong className="text-color-offwhite">{records.length}</strong> scans
                </span>
                <span>•</span>
                <span className="text-risk-low flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-risk-low" />
                  Local Vault Encrypted
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/scan"
                  className="hover:text-color-offwhite transition-colors flex items-center gap-1"
                >
                  <span>New Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {isClearConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md rounded-3xl bg-surface-container-lowest/90 border border-color-crimson/50 shadow-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3 text-primary">
                <div className="w-10 h-10 rounded-full bg-color-crimson/20 flex items-center justify-center border border-color-crimson/40">
                  <AlertTriangle className="w-5 h-5 text-color-crimson" />
                </div>
                <div>
                  <h3 className="font-headline text-xl text-color-offwhite">Clear Local History?</h3>
                  <p className="font-mono text-xs text-on-surface-variant">Permanent Destruction</p>
                </div>
              </div>

              <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                This will permanently purge all stored threat reports, optical forensic captures, and URL inspection records from this browser’s local storage. This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <GlassButton variant="secondary" size="sm" onClick={() => setIsClearConfirmOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={handleClearAll}>
                  Clear All Forever
                </GlassButton>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        <HistoryExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          records={filteredRecords}
        />
      </div>
    </PageContainer>
  );
};

export default HistoryPage;
