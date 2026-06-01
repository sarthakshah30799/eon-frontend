import { Label } from '../label';
import { FormFieldAsyncSelect } from '../../forms/FormFieldAsyncSelect';
import { FormFieldInput } from '../../forms/FormFieldInput';

export interface PhoneCountryCodeOption {
  value: string;
  label: string;
}

export interface PhoneInputProps {
  label?: string;
  countryCodeLabel?: string;
  numberLabel?: string;
  countryCodeName: string;
  numberName: string;
  countryCodeOptions: PhoneCountryCodeOption[];
  disabled?: boolean;
  className?: string;
}

export const PhoneInput = ({
  label,
  countryCodeLabel = 'Country Code',
  numberLabel = 'Phone Number',
  countryCodeName,
  numberName,
  countryCodeOptions,
  disabled = false,
  className = '',
}: PhoneInputProps) => {
  const loadCountryCodeOptions = async (inputValue: string) => {
    const normalizedValue = inputValue.trim().toLowerCase();
    const filteredOptions = normalizedValue
      ? countryCodeOptions?.filter(option =>
          option.label.toLowerCase().includes(normalizedValue)
        )
      : countryCodeOptions;

    return {
      options: filteredOptions,
    };
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="grid grid-cols-[140px_1fr] gap-3">
        <div className="space-y-2">
          <FormFieldAsyncSelect
            name={countryCodeName}
            label={countryCodeLabel}
            disabled={disabled}
            loadOptions={loadCountryCodeOptions}
            pagination={false}
            defaultOptions={countryCodeOptions}
            placeholder={countryCodeLabel}
            size="md"
            variant="default"
          />
        </div>

        <FormFieldInput
          name={numberName}
          label={numberLabel}
          inputMode="numeric"
          disabled={disabled}
          maxLength={10}
          onInput={event => {
            event.currentTarget.value = event.currentTarget.value.replace(
              /[^0-9]/g,
              ''
            ).slice(0, 10);
          }}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
