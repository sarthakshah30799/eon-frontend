import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '../../ui';

interface FormFieldCheckboxProps {
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (checked: boolean) => void;
}

export const FormFieldCheckbox = ({
  name,
  label,
  disabled = false,
  className = '',
  onChange,
}: FormFieldCheckboxProps) => {
  const form = useFormContext();

  const { field } = useController({
    name,
    control: form.control,
  });

  return (
    <Checkbox
      id={name}
      checked={field.value}
      disabled={disabled}
      className={className}
      onChange={val => {
        field.onChange(val);
        onChange?.(val);
      }}
    >
      {label}
    </Checkbox>
  );
};
