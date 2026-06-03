import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { StateDropdown } from '@/modules/dropdowns/stateDropdown';

interface FormFieldStateDropdownProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  countryId?: string;
  createLabel?: string;
  onCreateState?: (inputValue: string) => void | Promise<void>;
}

export const FormFieldStateDropdown = ({
  name,
  label,
  placeholder,
  disabled = false,
  className = '',
  countryId,
  createLabel,
  onCreateState,
}: FormFieldStateDropdownProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <StateDropdown
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      value={String(field.value ?? '')}
      countryId={countryId}
      createLabel={createLabel}
      onCreateState={onCreateState}
      onChange={nextValue => {
        field.onChange(nextValue);
      }}
      error={error?.message}
    />
  );
};
