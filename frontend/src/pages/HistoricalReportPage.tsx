import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ScanResultReport } from '../components/scanner/ScanResultReport';
import { UrlForensicPanel } from '../components/scanner/UrlForensicPanel';
import { historyRepository } from '../services/history/LocalScanHistoryRepository';
import type { HistoryRecord } from '../types/history';
import type { ScanResponse, UrlScanResponse } from '../types/api';
import { ArrowLeft, Clock, Archive } from 'lucide-react';

export const HistoricalReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadRecord = async () => {
      if (!id) {
        setError('Missing scan identifier.');
        setLoading(false);
        return;
      }
      try {
        const found = await historyRepository.getScanById(id);
        if (isMounted) {
          if (found) {
            setRecord(found);
          } else {
            setError('Historical record not found or was removed from this browser.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve scan record.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecord();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="py-20">
          <LoadingState message="Retrieving historical telemetry from local vault..." />
        </div>
      </PageContainer>
    );
  }

  if (error || !record) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="py-12 max-w-xl mx-auto">
          <ErrorState
            title="Record Not Found"
            message={error || 'The requested forensic scan does not exist in local storage.'}
            onRetry={() => navigate('/history')}
          />
        </div>
      </PageContainer>
    );
  }

  const formattedDate = new Date(record.scannedAt).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <PageContainer maxWidth="7xl">
      <div className="space-y-8 animate-fadeIn">
        {/* Top Historical Vault Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface-container-lowest/80 border border-glass-border backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3">
            <Link
              to="/history"
              className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-color-offwhite flex items-center justify-center transition-colors border border-glass-border cursor-pointer shrink-0"
              title="Return to Scan History"
              aria-label="Back to history"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high font-mono text-[10px] uppercase tracking-wider text-primary border border-color-crimson/30">
                  <Archive className="w-3 h-3 text-color-crimson" />
                  HISTORICAL ARCHIVE
                </span>
                <span className="font-mono text-xs text-on-surface-variant">
                  ID: #{record.id}
                </span>
              </div>
              <p className="font-mono text-xs text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-on-surface-variant/70" />
                <span>Captured on {formattedDate}</span>
                <span className="text-on-surface-variant/40 hidden sm:inline">•</span>
                <span className="text-risk-low hidden sm:inline">Zero Network Call Guarantee</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Link
              to="/history"
              className="px-4 py-2 rounded-full font-mono text-xs text-on-surface-variant hover:text-color-offwhite hover:bg-surface-container-high transition-colors border border-glass-border"
            >
              All Records
            </Link>
          </div>
        </div>

        {/* Render Appropriate Report Component */}
        {record.scanType === 'LINK' ? (
          <UrlForensicPanel
            url={record.sourceMetadata?.url || 'https://unknown-target.example'}
            result={record.originalResult as UrlScanResponse}
            onReset={() => navigate('/history')}
          />
        ) : (
          <ScanResultReport
            scanResult={record.originalResult as ScanResponse}
            originalMessage={
              record.sourceMetadata?.previewSnippet ||
              (record.scanType === 'SCREENSHOT'
                ? `[Visual OCR: ${record.sourceMetadata?.filename || 'image.png'}]`
                : '[Historical Text Message]')
            }
            analysisSource={
              record.scanType === 'SCREENSHOT'
                ? 'HISTORICAL SCREENSHOT OCR'
                : 'HISTORICAL MESSAGE SCAN'
            }
            onScanAnother={() => navigate('/history')}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default HistoricalReportPage;
