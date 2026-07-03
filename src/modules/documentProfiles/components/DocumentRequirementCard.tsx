import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button1';
import { Modal } from '@/components/ui/modal';
import type { ICategoryOption } from '@/types/categoryOptionTypes';
import {
  documentTypeToAccept,
  getDocumentTypeLabel,
  isFileTypeAllowed,
} from '../utils';

export interface IDocumentRequirementFile {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDocumentRequirementProfile {
  id: string;
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  specificationType: string;
  type: ICategoryOption | null;
  groupSelection?: ICategoryOption | null;
  entitySelection?: ICategoryOption | null;
  active: boolean;
  sortOrder: number;
  documentFile?: IDocumentRequirementFile | null;
}

interface DocumentRequirementCardProps {
  profile: IDocumentRequirementProfile;
  disabled?: boolean;
  selectedFile?: File | null;
  onSelectFile: (documentProfileId: string, file: File) => void | Promise<void>;
  onClearFile?: (documentProfileId: string) => void | Promise<void>;
  downloadUrl?: string;
}

const isPreviewableMimeType = (mimeType: string) =>
  mimeType.startsWith('image/') || mimeType === 'application/pdf';

export const DocumentRequirementCard = ({
  profile,
  disabled = false,
  selectedFile = null,
  onSelectFile,
  onClearFile,
  downloadUrl,
}: DocumentRequirementCardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef('');
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState('');
  const [localError, setLocalError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const accept = useMemo(
    () => documentTypeToAccept(profile.documentType),
    [profile.documentType]
  );
  const existingFile = profile.documentFile ?? null;
  const activePreviewUrl =
    selectedPreviewUrl || (downloadUrl && existingFile ? downloadUrl : '');
  const activePreviewMimeType =
    selectedFile?.type || existingFile?.mimeType || '';
  const canPreview = Boolean(
    activePreviewUrl && isPreviewableMimeType(activePreviewMimeType)
  );
  const hasFile = Boolean(selectedFile || existingFile);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

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

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;

    setLocalError('');
    setSelectedPreviewUrl(nextPreviewUrl);
    void onSelectFile(profile.id, file);
  };

  const handleOpenFilePicker = () => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const handleClearSelection = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    setSelectedPreviewUrl('');
    setLocalError('');
    void onClearFile?.(profile.id);
  };

  return (
    <article className="rounded-xl border border-border-primary bg-surface-primary px-3 py-3 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            title={hasFile ? 'Preview file' : 'Upload file'}
            aria-label={hasFile ? 'Preview file' : 'Upload file'}
            className={`group relative flex h-10 items-center justify-center ${
              hasFile
                ? 'w-14 overflow-hidden rounded-md border border-border-primary bg-surface-primary shadow-sm'
                : 'min-w-28 rounded-md border border-dashed border-border-primary bg-surface-secondary px-3'
            } ${hasFile ? (canPreview ? 'cursor-pointer' : 'cursor-default') : 'cursor-pointer'}`}
            onClick={() => {
              if (hasFile) {
                if (canPreview) setPreviewOpen(true);
              } else {
                handleOpenFilePicker();
              }
            }}
            disabled={hasFile && !canPreview}
          >
            {hasFile ? (
              canPreview ? (
                activePreviewMimeType.startsWith('image/') ? (
                  <img
                    src={activePreviewUrl}
                    alt={profile.documentDescription}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-secondary text-text-primary">
                    <EyeIcon className="h-4 w-4" />
                  </div>
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-secondary text-text-primary">
                  <EyeIcon className="h-4 w-4" />
                </div>
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center gap-2 text-text-secondary">
                <CloudArrowUpIcon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                  Upload
                </span>
              </div>
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-semibold text-text-primary">
                {profile.documentDescription}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  profile.isRequired
                    ? 'bg-error-50 text-error-700'
                    : 'bg-surface-secondary text-text-tertiary'
                }`}
              >
                {profile.isRequired ? 'Required' : 'Optional'}
              </span>
            </div>
            <div className="truncate text-xs text-text-secondary">
              {getDocumentTypeLabel(profile.documentType)} · Max{' '}
              {profile.maxSizeMb} MB
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 lg:justify-self-end">
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
            size="icon"
            className="h-8 w-8 rounded-md border-border-primary bg-surface-primary shadow-sm text-text-primary hover:bg-surface-secondary"
            title={
              selectedFile
                ? 'Change file'
                : existingFile
                  ? 'Replace file'
                  : 'Choose file'
            }
            aria-label={
              selectedFile
                ? 'Change file'
                : existingFile
                  ? 'Replace file'
                  : 'Choose file'
            }
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Button>
          {selectedFile && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-border-primary bg-surface-primary shadow-sm text-text-primary hover:bg-surface-secondary"
              title="Clear selected file"
              aria-label="Clear selected file"
              disabled={disabled}
              onClick={handleClearSelection}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
          {downloadUrl && existingFile && (
            <a
              href={downloadUrl}
              title="Download file"
              aria-label="Download file"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-primary bg-surface-primary text-text-primary shadow-sm transition-colors hover:bg-surface-secondary"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {localError ? (
        <div className="mt-2 text-[11px] font-medium text-error-600">
          {localError}
        </div>
      ) : null}

      <Modal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={profile.documentDescription}
        description={getDocumentTypeLabel(profile.documentType)}
        size="xl"
      >
        {canPreview ? (
          activePreviewMimeType.startsWith('image/') ? (
            <img
              src={activePreviewUrl}
              alt={profile.documentDescription}
              className="max-h-[70vh] w-full object-contain"
            />
          ) : (
            <iframe
              title={profile.documentDescription}
              src={activePreviewUrl}
              className="h-[70vh] w-full border-0"
            />
          )
        ) : (
          <div className="p-6 text-sm text-text-secondary">
            Preview is not available for this file type.
          </div>
        )}
      </Modal>
    </article>
  );
};

export default DocumentRequirementCard;
