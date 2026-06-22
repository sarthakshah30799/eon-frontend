import type { TextareaHTMLAttributes } from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui';

interface FormFieldTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
}

export const FormFieldTextarea = ({
  name,
  label,
  placeholder,
  disabled = false,
  className = '',
  rows = 5,
  ...rest
}: FormFieldTextareaProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <div className="space-y-2 max-w-[350px]">
      {label && <Label htmlFor={name}>{label}</Label>}
      <textarea
        id={name}
        className={`block w-full rounded-md border border-border-secondary bg-surface-primary px-3 py-2 text-text-primary shadow-none placeholder:text-text-tertiary focus:border-primary-500! focus:ring-primary-500 focus-visible:border-transparent! focus-visible:outline-primary-500 focus-visible:ring-1 ${error ? 'border-error-500' : ''} ${className}`}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...field}
        {...rest}
        onChange={event => {
          field.onChange(event.target.value);
          rest.onChange?.(event);
        }}
      />
      {error && <p className="mt-1 text-sm text-error-600">{error.message}</p>}
    </div>
  );
};
