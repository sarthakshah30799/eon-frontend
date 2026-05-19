import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { AsyncSelect, type AsyncSelectProps } from '../../ui';

interface FormFieldSelectProps extends Omit<AsyncSelectProps, 'value' | 'onChange' | 'error'> {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FormFieldSelect = ({
  name,
  label,
  placeholder,
  disabled = false,
  className = '',
  loadOptions,
  pagination = false,
  pageSize = 20,
  debounceDelay = 300,
  size,
  variant,
  ...props
}: FormFieldSelectProps) => {
  const form = useFormContext();
  
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  return (
    <AsyncSelect
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      loadOptions={loadOptions}
      pagination={pagination}
      pageSize={pageSize}
      debounceDelay={debounceDelay}
      size={size}
      variant={variant}
      {...props}
      {...field}
      value={field.value || null}
      onChange={(option) => {
        field.onChange(option?.value || null);
      }}
      error={error?.message}
    />
  );
};
