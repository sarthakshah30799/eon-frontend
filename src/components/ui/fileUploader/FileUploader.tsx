import { useId, useRef, type ChangeEvent } from 'react';
import { Button } from '../button1';

interface FileUploaderProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  accept?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  id?: string;
  onFileSelect?: (file: File) => void;
  fileName?: string;
  previewType?: 'image' | 'file';
}

export const FileUploader = ({
  label,
  value = '',
  onChange,
  onClear,
  accept = 'image/*',
  placeholder = 'Choose file',
  helperText,
  disabled = false,
  className = '',
  error,
  id,
  onFileSelect,
  fileName,
  previewType = 'image',
}: FileUploaderProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasPreview = value.trim().length > 0 || Boolean(fileName);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onFileSelect?.(file);

    if (previewType === 'file') {
      onChange(file.name);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;

      if (typeof result === 'string') {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className={`${previewType === 'file' ? 'w-full space-y-2' : 'max-w-[350px] space-y-2'} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className={`flex gap-4 rounded-sm border border-dashed border-border-primary bg-surface-primary p-4 ${previewType === 'file' ? 'items-center' : 'flex-col sm:flex-row sm:items-center sm:justify-between'}`}>
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center overflow-hidden rounded-sm border border-border-primary bg-surface-secondary ${previewType === 'file' ? 'h-12 w-12 shrink-0' : 'h-20 w-20'}`}>
            {hasPreview && previewType === 'image' ? (
              <img
                src={value}
                alt={label ?? 'Uploaded file preview'}
                className="h-full w-full object-cover"
              />
            ) : hasPreview ? (
              <span className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{previewType === 'file' ? 'FILE' : fileName ?? value}</span>
            ) : (
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                Preview
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              {hasPreview ? (previewType === 'file' ? 'File selected' : 'Logo selected') : 'No file selected'}
            </p>
            {helperText && (
              <p className="text-sm text-text-secondary">{helperText}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {hasPreview ? 'Change File' : placeholder}
          </Button>

          {hasPreview && onClear && (
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

      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
};

export default FileUploader;
