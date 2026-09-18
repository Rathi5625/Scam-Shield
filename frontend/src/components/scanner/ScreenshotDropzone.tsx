import React, { useRef, useState } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';

interface ScreenshotDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ScreenshotDropzone: React.FC<ScreenshotDropzoneProps> = ({
  onFileSelected,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setValidationError(null);

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setValidationError('Unsupported file format. Please upload a PNG, JPEG, or WEBP image.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5.0 MB.`
      );
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
      e.target.value = ''; // reset so same file can be re-selected if removed
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload chat screenshot dropzone"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-full rounded-3xl bg-surface-container-lowest/80 backdrop-blur-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all duration-300 cursor-pointer min-h-[340px] shadow-2xl overflow-hidden relative border ${
          isDragOver
            ? 'border-color-crimson bg-color-crimson/10 shadow-crimson-glow scale-[1.01]'
            : 'border-glass-border hover:border-color-crimson/50 hover:bg-surface-container-low/70'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Ambient atmospheric glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-color-crimson/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-surface-container-highest/30 rounded-full blur-3xl" />

        {/* Icon Capsule */}
        <div className="relative w-18 h-18 rounded-full bg-surface-container-high/80 border border-glass-border flex items-center justify-center mb-5 shadow-glass group-hover:scale-105 transition-transform">
          <Upload className="w-8 h-8 text-primary" />
        </div>

        {/* Headline & details */}
        <h3 className="font-headline text-2xl text-color-offwhite tracking-tight mb-2">
          Drop your screenshot here
        </h3>
        <p className="font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-6">
          PNG, JPEG or WEBP • Up to 5 MB
        </p>

        {/* CTA Button lookalike */}
        <div className="px-6 py-2.5 rounded-full bg-color-crimson text-color-offwhite font-headline text-sm shadow-crimson-ambient hover:shadow-crimson-glow transition-all flex items-center gap-2">
          <FileImage className="w-4 h-4" />
          <span>Choose Screenshot</span>
        </div>

        <p className="font-body text-xs text-on-surface-variant/80 mt-5">
          Drag & drop anywhere, or click to browse files from your device.
        </p>

        {/* Hidden accessible file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />
      </div>

      {/* Validation error if any */}
      {validationError && (
        <div className="w-full mt-4 p-3.5 rounded-xl bg-color-crimson/20 border border-color-crimson text-xs font-mono text-color-offwhite flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-color-crimson shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
