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
}

export const FormFieldYesNoToggle = ({
  name,
  label,
  disabled = false,
  className = '',
  yesLabel = 'Yes',
  noLabel = 'No',
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

  return (
    <div className={`max-w-[350px] space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="inline-flex rounded-sm border border-border-secondary bg-surface-primary p-1">
        <Button
          type="button"
          variant={value ? 'default' : 'ghost'}
          disabled={disabled}
          onClick={() => field.onChange(true)}
          className="rounded-sm px-3 py-2 text-sm font-medium transition"
        >
          {yesLabel}
        </Button>
        <Button
          type="button"
          variant={!value ? 'default' : 'ghost'}
          disabled={disabled}
          onClick={() => field.onChange(false)}
          className="rounded-sm px-3 py-2 text-sm font-medium transition"
        >
          {noLabel}
        </Button>
      </div>

      {error && <p className="mt-1 text-sm text-error-600">{error.message}</p>}
    </div>
  );
};

export default FormFieldYesNoToggle;
