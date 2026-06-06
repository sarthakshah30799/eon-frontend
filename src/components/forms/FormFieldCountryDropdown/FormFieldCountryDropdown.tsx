import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { CountryDropdown } from '@/modules/dropdowns/countryDropdown';

interface FormFieldCountryDropdownProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  createLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FormFieldCountryDropdown = ({
  name,
  label,
  placeholder,
  disabled = false,
  className = '',
  createLabel,
  size,
}: FormFieldCountryDropdownProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <CountryDropdown
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      size={size}
      value={String(field.value ?? '')}
      createLabel={createLabel}
      onChange={nextValue => {
        field.onChange(nextValue);
      }}
      error={error?.message}
    />
  );
};
