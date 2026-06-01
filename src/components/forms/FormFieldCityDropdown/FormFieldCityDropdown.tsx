import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { CityDropdown } from '@/modules/dropdowns/cityDropdown';

interface FormFieldCityDropdownProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  createLabel?: string;
  onCreateCity?: (inputValue: string) => void | Promise<void>;
}

export const FormFieldCityDropdown = ({
  name,
  label,
  placeholder,
  disabled = false,
  className = '',
  createLabel,
  onCreateCity,
}: FormFieldCityDropdownProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <CityDropdown
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      value={String(field.value ?? '')}
      createLabel={createLabel}
      onCreateCity={onCreateCity}
      onChange={nextValue => {
        field.onChange(nextValue);
      }}
      error={error?.message}
    />
  );
};
