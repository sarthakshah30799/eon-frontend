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
}: FileUploaderProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasPreview = value.trim().length > 0;

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];

    if (!file) {
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
    <div className={`max-w-[350px] space-y-2 ${className}`}>
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

      <div className="flex flex-col gap-4 rounded-sm border border-dashed border-border-primary bg-surface-primary p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-sm border border-border-primary bg-surface-secondary">
            {hasPreview ? (
              <img
                src={value}
                alt={label ?? 'Uploaded file preview'}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
                Preview
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">
              {hasPreview ? 'Logo selected' : 'No logo selected'}
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
            {hasPreview ? 'Change Logo' : placeholder}
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
