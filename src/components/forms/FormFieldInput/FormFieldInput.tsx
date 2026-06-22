import type { ChangeEvent } from 'react';
import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Input, type InputProps } from '../../ui';

export interface FormFieldInputProps extends InputProps {
  name: string;
  label?: string;
  valueTransform?: 'uppercase' | 'none';
}

export const FormFieldInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
  valueTransform = 'uppercase',
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

  const isPasswordField = /password/i.test(name);
  const shouldUppercaseValue =
    type !== 'email' && type !== 'password' && !isPasswordField;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const nextValue =
      valueTransform === 'uppercase' && shouldUppercaseValue
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
      valueTransform={valueTransform}
    />
  );
};
