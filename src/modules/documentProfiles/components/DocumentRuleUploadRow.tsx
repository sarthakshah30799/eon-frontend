import { useId, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button1';
import {
  documentTypeToAccept,
  isFileTypeAllowed,
} from '../utils';
import { getDocumentTypeLabel } from '../utils';

interface DocumentRuleUploadRowProps {
  label: string;
  description?: string;
  documentType: string;
  maxSizeMb: number;
  required?: boolean;
  value?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

export const DocumentRuleUploadRow = ({
  label,
  description,
  documentType,
  maxSizeMb,
  required = false,
  value = '',
  onChange,
  onClear,
  disabled = false,
  error,
  className = '',
}: DocumentRuleUploadRowProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string>('');

  const hasValue = value.trim().length > 0;
  const previewIsImage = hasValue && value.startsWith('data:image/');
  const accept = documentTypeToAccept(documentType);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`File exceeds max size of ${maxSizeMb} MB.`);
      return;
    }

    if (!isFileTypeAllowed(file, documentType)) {
      setLocalError(`Unsupported file type for ${getDocumentTypeLabel(documentType)}.`);
      return;
    }

    const nextValue = await fileToDataUrl(file);
    setLocalError('');
    onChange(nextValue);
  };

  return (
    <div className={`space-y-2 rounded-sm border border-border-primary bg-surface-secondary p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
          </label>
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
          <p className="mt-1 text-xs text-text-tertiary">
            {required ? 'Required' : 'Optional'} · Type: {getDocumentTypeLabel(documentType)} · Max: {maxSizeMb} MB
          </p>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {hasValue ? 'Change File' : 'Choose File'}
          </Button>
          {hasValue && onClear && (
            <Button
              type="button"
              variant="ghost"
              className="rounded-sm"
              disabled={disabled}
              onClick={onClear}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-sm border border-border-primary bg-surface-primary">
          {previewIsImage ? (
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
              {hasValue ? 'Attached' : 'Preview'}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-text-primary">
            {hasValue ? 'File selected' : 'No file selected'}
          </p>
          <p className="text-sm text-text-secondary">
            {required
              ? 'The user must upload this document before saving.'
              : 'This document is optional for the selected profile.'}
          </p>
        </div>
      </div>

      {(localError || error) && (
        <p className="text-sm text-error-600">{localError || error}</p>
      )}
    </div>
  );
};
