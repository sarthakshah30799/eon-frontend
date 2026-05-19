import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui';

interface FormFieldInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export const FormFieldInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
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
      error={error?.message}
    />
  );
};
