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
  return (
    <PhoneInput
      label={label}
      countryCodeLabel={countryCodeLabel}
      numberLabel={numberLabel}
      countryCodeName={countryCodeName}
      numberName={numberName}
      disabled={disabled}
      className={className}
      countryCodeOptions={DEFAULT_PHONE_COUNTRY_CODE_OPTIONS}
    />
  );
};
