import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '../../ui';

interface FormFieldCheckboxProps {
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const FormFieldCheckbox = ({
  name,
  label,
  disabled = false,
  className = '',
}: FormFieldCheckboxProps) => {
  const form = useFormContext();
  
  const {
    field,
  } = useController({
    name,
    control: form.control,
  });

  return (
    <Checkbox
      id={name}
      checked={field.value}
      disabled={disabled}
      className={className}
      onChange={field.onChange}
    >
      {label}
    </Checkbox>
  );
};
