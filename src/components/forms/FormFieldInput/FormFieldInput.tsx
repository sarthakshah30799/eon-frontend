import type { InputHTMLAttributes } from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui';

interface FormFieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const FormFieldInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  ...rest
}: FormFieldInputProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <Input
      label={label}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      {...field}
      {...rest}
      error={error?.message}
    />
  );
};
