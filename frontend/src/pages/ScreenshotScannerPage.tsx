import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../components/common/PageContainer';
import { ScreenshotDropzone } from '../components/scanner/ScreenshotDropzone';
import { ImagePreviewCard } from '../components/scanner/ImagePreviewCard';
import { ScanResultReport } from '../components/scanner/ScanResultReport';
import { LoadingState } from '../components/common/LoadingState';
import { scanService } from '../services/scanService';
import {
  historyRepository,
  createRecordFromImageScan,
} from '../services/history/LocalScanHistoryRepository';
import type { ScanResponse } from '../types/api';
import {
  MessageSquare,
  Image as ImageIcon,
  Link as LinkIcon,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const ScreenshotScannerPage: React.FC = () => {
  usePageMeta({
    title: 'Screenshot Scanner — ScamShield',
    description: 'Upload screenshots of suspicious messages, fake banking apps, and invoices for multimodal AI forensic analysis.',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);

  // Clean up object URL when file changes or on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelected = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleScanImage = async () => {
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setLoading(true);
    setError(null);
    setScanResult(null);

    try {
      // Read file to base64 for multimodal scanning
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const commaIdx = result.indexOf(',');
          resolve(commaIdx >= 0 ? result.substring(commaIdx + 1) : result);
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(selectedFile);
      });

      const s3Key = `screenshots/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const res = await scanService.scanImage(s3Key, base64Data, selectedFile.type);
      setScanResult(res);

      // Auto-save to local history vault (strictly stores filename metadata, NEVER binary image data)
      try {
        const record = createRecordFromImageScan(res, selectedFile.name);
        await historyRepository.saveScan(record);
      } catch {
        // Non-blocking: never disrupt the result presentation
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Screenshot analysis service unreachable. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = () => {
    handleRemoveFile();
    setScanResult(null);
    setError(null);
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* If result is available, render the primary ScanResultReport */}
      {scanResult && !loading && (
        <ScanResultReport
          scanResult={scanResult}
          originalMessage={`[Uploaded Screenshot: ${selectedFile?.name || 'chat_capture.png'}]`}
          analysisSource="SCREENSHOT ANALYSIS"
          onScanAnother={handleResetAll}
        />
      )}

      {/* Main Screenshot Scanner Intake Experience */}
      {!scanResult && (
        <div className="flex flex-col items-center space-y-10">
          {/* Eyebrow Header matching Stitch screen a60db7f7... */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest/80 border border-glass-border shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-color-crimson opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-color-crimson" />
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                SCREENSHOT SCANNER • OCR &amp; COMPUTER VISION
              </span>
            </div>

            <h1 className="font-headline text-4xl sm:text-6xl text-color-offwhite tracking-tight">
              Show us what you received.
            </h1>

            <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-xl font-normal leading-relaxed">
              Upload a screenshot of a suspicious message, email, notification, or conversation for neural visual forensics.
            </p>

            {/* Sub-navigation Switcher Pill */}
            <div className="flex items-center p-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-2xl border border-glass-border shadow-lg mt-2">
              <Link
                to="/scan"
                className="px-4 py-1.5 rounded-full font-mono text-xs text-on-surface-variant hover:text-color-offwhite transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Paste Message</span>
              </Link>

              <button
                type="button"
                className="px-4 py-1.5 rounded-full font-mono text-xs text-color-offwhite bg-surface-container-high border border-color-crimson/50 shadow-crimson-glow flex items-center gap-1.5 cursor-default"
              >
                <ImageIcon className="w-3.5 h-3.5 text-color-crimson" />
                <span>Upload Screenshot</span>
              </button>

              <Link
                to="/scanner/link"
                className="px-4 py-1.5 rounded-full font-mono text-xs text-on-surface-variant hover:text-color-offwhite transition-colors flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Analyze Link</span>
              </Link>
            </div>
          </div>

          {/* Diagnostic Status Indicator Bar */}
          <div className="w-full max-w-3xl flex items-center justify-between text-xs font-mono text-on-surface-variant px-2">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider">DIAGNOSTIC INTAKE:</span>
              <span className="text-color-offwhite font-medium">
                {selectedFile ? 'PREVIEW READY' : 'WAITING FOR FILE'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-risk-low" />
              <span>AI MULTIMODAL FORENSICS</span>
            </div>
          </div>

          {/* Main Upload Zone or Preview Card */}
          <div className="w-full max-w-3xl">
            {loading ? (
              <div className="rounded-3xl bg-surface-container-lowest/80 backdrop-blur-2xl border border-glass-border p-12 text-center shadow-glass">
                <LoadingState
                  message="Evaluating Screenshot Forensics..."
                  subMessage="Optical character recognition, layout geometry, fake banking emblem detection, and urgency analysis"
                />
              </div>
            ) : !selectedFile || !previewUrl ? (
              <ScreenshotDropzone onFileSelected={handleFileSelected} />
            ) : (
              <ImagePreviewCard
                file={selectedFile}
                previewUrl={previewUrl}
                onRemove={handleRemoveFile}
                onScan={handleScanImage}
                scanning={loading}
              />
            )}
          </div>

          {/* Error Banner if any */}
          {error && (
            <div className="w-full max-w-3xl p-4 rounded-2xl bg-color-crimson/20 border border-color-crimson text-xs font-mono text-color-offwhite flex items-center gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-color-crimson shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Supported Types & Trust Telemetry */}
          <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-lowest/60 border border-glass-border font-mono text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium">FORMATS:</span>
              <span>PNG, JPEG, WEBP (Max 5MB)</span>
            </div>
            <div className="flex items-center gap-4">
              <span>ZERO LOGS</span>
              <span>EPHEMERAL RAM OCR</span>
            </div>
          </div>

          {/* Back to main scanner link */}
          <Link
            to="/scan"
            className="flex items-center gap-2 text-xs font-mono text-on-surface-variant hover:text-color-offwhite transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Message Scanner</span>
          </Link>
        </div>
      )}
    </PageContainer>
  );
};
