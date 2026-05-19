import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { PasswordInput } from '../../ui';

interface FormFieldPasswordProps {
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  showPasswordToggle?: boolean;
  placeholder?: string;
}

export const FormFieldPassword = ({
  name,
  label,
  disabled = false,
  className = '',
  showPasswordToggle = true,
  placeholder,
}: FormFieldPasswordProps) => {
  const form = useFormContext();
  
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <PasswordInput
      id={name}
      label={label}
      disabled={disabled}
      className={className}
      showPasswordToggle={showPasswordToggle}
      placeholder={placeholder}
      error={error?.message}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  );
};
