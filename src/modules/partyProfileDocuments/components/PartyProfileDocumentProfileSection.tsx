import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button1';
import { partyProfileDocumentsApi } from '@/api/partyProfileDocuments';
import type { IPartyProfileDocumentProfile } from '../types/partyProfileDocumentTypes';
import {
  documentTypeToAccept,
  getDocumentTypeLabel,
  isFileTypeAllowed,
} from '@/modules/documentProfiles/utils';

interface PartyProfileDocumentProfileSectionProps {
  partyProfileId: string;
  profile: IPartyProfileDocumentProfile;
  disabled?: boolean;
  onUpload: (documentProfileId: string, file: File) => void | Promise<void>;
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

export const PartyProfileDocumentProfileSection = ({
  partyProfileId,
  profile,
  disabled = false,
  onUpload,
}: PartyProfileDocumentProfileSectionProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState('');
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');

  const accept = useMemo(() => documentTypeToAccept(profile.documentType), [profile.documentType]);
  const hasExistingFile = Boolean(profile.documentFile);
  const uploadedMimeType = profile.documentFile?.mimeType ?? '';
  const canPreviewUploadedFile =
    uploadedMimeType.startsWith('image/') || uploadedMimeType === 'application/pdf';
  const groupLabel = profile.groupSelection?.label ?? '-';
  const entityTypeLabel = profile.entitySelection?.label ?? '-';

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    let isMounted = true;
    let currentObjectUrl = '';

    const loadUploadedPreview = async () => {
      if (!profile.documentFile || !canPreviewUploadedFile) {
        setUploadedPreviewUrl('');
        return;
      }

      try {
        const response = await fetch(
          partyProfileDocumentsApi.getDownloadUrl(partyProfileId, profile.id),
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load uploaded preview');
        }

        const blob = await response.blob();
        currentObjectUrl = URL.createObjectURL(blob);

        if (isMounted) {
          setUploadedPreviewUrl(currentObjectUrl);
        }
      } catch {
        if (isMounted) {
          setUploadedPreviewUrl('');
        }
      }
    };

    void loadUploadedPreview();

    return () => {
      isMounted = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
      setUploadedPreviewUrl('');
    };
  }, [canPreviewUploadedFile, partyProfileId, profile.documentFile, profile.id]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const maxBytes = profile.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`File exceeds max size of ${profile.maxSizeMb} MB.`);
      return;
    }

    if (!isFileTypeAllowed(file, profile.documentType)) {
      setLocalError(
        `Unsupported file type for ${getDocumentTypeLabel(profile.documentType)}.`
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

    await onUpload(profile.id, selectedFile);
    setSelectedFile(null);
    setLocalError('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-text-secondary">{profile.documentDescription}</p>
        <p className="text-xs text-text-tertiary">
          Code: {profile.documentCode} · Type: {getDocumentTypeLabel(profile.documentType)} ·
          Max: {profile.maxSizeMb} MB · {profile.isRequired ? 'Required' : 'Optional'}
        </p>
        <p className="text-sm text-text-secondary">
          Document Group: {groupLabel} · Entity Type: {entityTypeLabel}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <div className="flex flex-wrap gap-2">
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

        {profile.documentFile && (
          <div className="flex flex-wrap gap-2">
            <a
              href={partyProfileDocumentsApi.getDownloadUrl(
                partyProfileId,
                profile.id
              )}
              className="rounded-sm border border-border-primary px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-secondary"
            >
              Download
            </a>
          </div>
        )}
      </div>

      <div className="rounded-sm border border-dashed border-border-primary bg-surface-secondary p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              {selectedFile
                ? selectedFile.name
                : hasExistingFile
                  ? profile.documentFile?.fileName
                  : 'No file selected'}
            </p>
            <p className="text-xs text-text-tertiary">
              {selectedFile
                ? `${formatSizeBytes(selectedFile.size)} · ${selectedFile.type || 'unknown type'}`
                : hasExistingFile
                  ? `${formatSizeBytes(profile.documentFile?.sizeBytes ?? 0)} · ${profile.documentFile?.mimeType ?? ''}`
                  : 'Choose a file that matches the document requirements.'}
            </p>
          </div>
        </div>

        {(previewUrl || profile.documentFile) && (
          <div className="mt-3 space-y-3">
            <div className="overflow-hidden rounded-sm border border-border-primary bg-surface-primary">
              {previewUrl && selectedFile?.type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt={profile.documentCode}
                  className="max-h-48 w-full object-contain"
                />
              ) : previewUrl && selectedFile?.type === 'application/pdf' ? (
                <iframe
                  title={selectedFile.name}
                  src={previewUrl}
                  className="h-64 w-full"
                />
              ) : uploadedPreviewUrl && uploadedMimeType.startsWith('image/') ? (
                <img
                  src={uploadedPreviewUrl}
                  alt={profile.documentCode}
                  className="max-h-48 w-full object-contain"
                />
              ) : uploadedPreviewUrl && uploadedMimeType === 'application/pdf' ? (
                <iframe
                  title={profile.documentFile?.fileName ?? profile.documentCode}
                  src={uploadedPreviewUrl}
                  className="h-64 w-full"
                />
              ) : (
                <div className="flex min-h-20 items-center justify-center px-4 py-4 text-center text-sm text-text-secondary">
                  {hasExistingFile && !selectedFile
                    ? 'This document is already uploaded. Download it if your browser cannot preview this file type.'
                    : 'This file will be stored in the document tables.'}
                </div>
              )}
            </div>
            <div className="text-sm text-text-secondary">
              {hasExistingFile && !selectedFile
                ? 'This document is already uploaded and can be replaced later.'
                : 'This file will be stored in the document tables.'}
            </div>
          </div>
        )}
      </div>

      {localError && <p className="text-sm text-error-600">{localError}</p>}
    </div>
  );
};
