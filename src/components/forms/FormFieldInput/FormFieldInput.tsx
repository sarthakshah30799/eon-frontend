import type { ChangeEvent, InputHTMLAttributes } from 'react';
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

  const shouldUppercaseValue = type !== 'email' && type !== 'password';

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue = shouldUppercaseValue
      ? event.target.value.toUpperCase()
      : event.target.value;

    field.onChange(nextValue);
    rest.onChange?.(event);
  };

  return (
    <Input
      label={label}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      {...field}
      {...rest}
      onChange={handleChange}
      error={error?.message}
    />
  );
};
