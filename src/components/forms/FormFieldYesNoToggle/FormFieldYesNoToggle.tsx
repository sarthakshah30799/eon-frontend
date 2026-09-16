import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Button, Label } from '../../ui';

interface FormFieldYesNoToggleProps {
  name: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  yesLabel?: string;
  noLabel?: string;
  compact?: boolean;
  onChange?: (checked: boolean) => void;
}

export const FormFieldYesNoToggle = ({
  name,
  label,
  disabled = false,
  className = '',
  yesLabel = 'Yes',
  noLabel = 'No',
  compact = false,
  onChange,
}: FormFieldYesNoToggleProps) => {
  const form = useFormContext();

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control: form.control,
  });

  const value = Boolean(field.value);

  const setChecked = (checked: boolean) => {
    if (value === checked) {
      return;
    }
    field.onChange(checked);
    onChange?.(checked);
  };

  return (
    <div
      className={`${compact ? 'w-max max-w-none' : 'max-w-[350px]'} space-y-2 ${className}`}
    >
      {label && <Label>{label}</Label>}

      <div className="inline-flex rounded-sm border border-border-secondary bg-surface-primary p-1">
        <Button
          type="button"
          variant={value ? 'default' : 'ghost'}
          disabled={disabled}
          onClick={() => setChecked(true)}
          className={
            compact
              ? 'h-8 rounded-sm px-2 py-0 text-xs font-medium transition'
              : 'rounded-sm px-3 py-2 text-sm font-medium transition'
          }
        >
          {yesLabel}
        </Button>
        <Button
          type="button"
          variant={!value ? 'default' : 'ghost'}
          disabled={disabled}
          onClick={() => setChecked(false)}
          className={
            compact
              ? 'h-8 rounded-sm px-2 py-0 text-xs font-medium transition'
              : 'rounded-sm px-3 py-2 text-sm font-medium transition'
          }
        >
          {noLabel}
        </Button>
      </div>

      {error && <p className="mt-1 text-sm text-error-600">{error.message}</p>}
    </div>
  );
};

export default FormFieldYesNoToggle;
