import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { FileUploader } from '../../ui';

interface FormFieldFileUploaderProps {
  name: string;
  label?: string;
  helperText?: string;
  accept?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FormFieldFileUploader = ({
  name,
  label,
  helperText,
  accept,
  placeholder,
  disabled = false,
  className = '',
}: FormFieldFileUploaderProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <FileUploader
      label={label}
      value={String(field.value ?? '')}
      onChange={field.onChange}
      onClear={() => field.onChange('')}
      accept={accept}
      placeholder={placeholder}
      helperText={helperText}
      disabled={disabled}
      className={className}
      error={error?.message}
      id={name}
    />
  );
};
