import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button1';
import {
  documentTypeToAccept,
  getDocumentTypeLabel,
  isFileTypeAllowed,
} from '@/modules/documentProfiles/utils';
import type { IPartyProfileDocumentRule } from '../types/partyProfileDocumentTypes';
import { partyProfileDocumentsApi } from '@/api/partyProfileDocuments';

interface PartyProfileDocumentRuleRowProps {
  partyProfileId: string;
  rule: IPartyProfileDocumentRule;
  disabled?: boolean;
  onUpload: (ruleId: string, file: File) => void | Promise<void>;
}

const formatSizeBytes = (sizeBytes: number) => {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  const sizeKb = sizeBytes / 1024;
  if (sizeKb < 1024) {
    return `${sizeKb.toFixed(1)} KB`;
  }

  return `${(sizeKb / 1024).toFixed(1)} MB`;
};

export const PartyProfileDocumentRuleRow = ({
  partyProfileId,
  rule,
  disabled = false,
  onUpload,
}: PartyProfileDocumentRuleRowProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState('');
  const accept = useMemo(() => documentTypeToAccept(rule.documentType), [rule.documentType]);
  const hasExistingFile = Boolean(rule.documentFile);

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const maxBytes = rule.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`File exceeds max size of ${rule.maxSizeMb} MB.`);
      return;
    }

    if (!isFileTypeAllowed(file, rule.documentType)) {
      setLocalError(
        `Unsupported file type for ${getDocumentTypeLabel(rule.documentType)}.`,
      );
      return;
    }

    setLocalError('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setLocalError('Please choose a file first.');
      return;
    }

    await onUpload(rule.id, selectedFile);
    setSelectedFile(null);
    setLocalError('');
  };

  return (
    <div className="space-y-3 rounded-sm border border-border-primary bg-surface-primary p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary">{rule.documentCode}</h4>
            <span className="rounded-full bg-surface-secondary px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-text-secondary">
              {rule.isRequired ? 'Required' : 'Optional'}
            </span>
          </div>
          <p className="text-sm text-text-secondary">{rule.documentDescription}</p>
          <p className="text-xs text-text-tertiary">
            Type: {getDocumentTypeLabel(rule.documentType)} · Max: {rule.maxSizeMb} MB
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {selectedFile ? 'Change File' : hasExistingFile ? 'Replace File' : 'Choose File'}
          </Button>
          <Button
            type="button"
            className="rounded-sm"
            disabled={disabled || !selectedFile}
            onClick={() => void handleUpload()}
          >
            Upload
          </Button>
        </div>
      </div>

      <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              {selectedFile ? selectedFile.name : hasExistingFile ? rule.documentFile?.fileName : 'No file selected'}
            </p>
            <p className="text-xs text-text-tertiary">
              {selectedFile
                ? `${formatSizeBytes(selectedFile.size)} · ${selectedFile.type || 'unknown type'}`
                : hasExistingFile
                  ? `${formatSizeBytes(rule.documentFile?.sizeBytes ?? 0)} · ${rule.documentFile?.mimeType ?? ''}`
                  : 'Choose a file that matches the rule requirements.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rule.documentFile && (
              <a
                href={partyProfileDocumentsApi.getDownloadUrl(partyProfileId, rule.id)}
                className="rounded-sm border border-border-primary px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-primary"
              >
                Download
              </a>
            )}
          </div>
        </div>

        {(previewUrl || rule.documentFile) && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-sm border border-border-primary bg-surface-primary">
              {previewUrl && selectedFile?.type.startsWith('image/') ? (
                <img src={previewUrl} alt={rule.documentCode} className="h-full w-full object-cover" />
              ) : (
                <span className="px-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                  {previewUrl ? 'File' : 'Uploaded'}
                </span>
              )}
            </div>
            <div className="text-sm text-text-secondary">
              {hasExistingFile && !selectedFile
                ? 'This document is already uploaded and can be replaced later.'
                : 'This file will be sent to the server and stored in the document tables.'}
            </div>
          </div>
        )}
      </div>

      {localError && <p className="text-sm text-error-600">{localError}</p>}
    </div>
  );
};
