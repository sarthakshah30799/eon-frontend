import { useController } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { PhoneInput, type PhoneCountryCodeOption } from '../../ui';

interface FormFieldPhoneInputProps {
  countryCodeName: string;
  numberName: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  countryCodeLabel?: string;
  numberLabel?: string;
}

const DEFAULT_PHONE_COUNTRY_CODE_OPTIONS: PhoneCountryCodeOption[] = [
  { value: '+91', label: '+91 IN' },
  { value: '+1', label: '+1 USA' },
  { value: '+971', label: '+971 UAE' },
];

export const FormFieldPhoneInput = ({
  countryCodeName,
  numberName,
  label,
  disabled = false,
  className = '',
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
      countryCodeValue={String(countryCodeField.value ?? DEFAULT_PHONE_COUNTRY_CODE_OPTIONS[0]?.value ?? '')}
      numberValue={String(numberField.value ?? '')}
      disabled={disabled}
      className={className}
      countryCodeOptions={DEFAULT_PHONE_COUNTRY_CODE_OPTIONS}
      onCountryCodeChange={value => countryCodeField.onChange(value)}
      onNumberChange={value => numberField.onChange(value)}
      error={countryCodeError?.message || numberError?.message}
    />
  );
};
