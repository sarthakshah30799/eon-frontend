import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { PhoneInput, type PhoneCountryCodeOption } from '../../ui';

interface FormFieldPhoneInputProps {
  countryCodeName: string;
  numberName: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  countryCodeOptions: PhoneCountryCodeOption[];
  countryCodeLabel?: string;
  numberLabel?: string;
}

export const FormFieldPhoneInput = ({
  countryCodeName,
  numberName,
  label,
  disabled = false,
  className = '',
  countryCodeOptions,
  countryCodeLabel,
  numberLabel,
}: FormFieldPhoneInputProps) => {
  const form = useFormContext();

  const {
    field: countryCodeField,
    fieldState: { error: countryCodeError },
  } = useController({
    name: countryCodeName,
    control: form.control,
  });

  const {
    field: numberField,
    fieldState: { error: numberError },
  } = useController({
    name: numberName,
    control: form.control,
  });

  return (
    <PhoneInput
      label={label}
      countryCodeLabel={countryCodeLabel}
      numberLabel={numberLabel}
      countryCodeValue={String(countryCodeField.value ?? countryCodeOptions[0]?.value ?? '')}
      numberValue={String(numberField.value ?? '')}
      countryCodeOptions={countryCodeOptions}
      disabled={disabled}
      className={className}
      onCountryCodeChange={value => countryCodeField.onChange(value)}
      onNumberChange={value => numberField.onChange(value)}
      error={countryCodeError?.message || numberError?.message}
    />
  );
};

