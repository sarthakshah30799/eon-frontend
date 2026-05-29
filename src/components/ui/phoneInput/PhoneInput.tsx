import { Label } from '../label';
import { Input } from '../input';
import { AsyncSelect } from '../asyncSelect';

export interface PhoneCountryCodeOption {
  value: string;
  label: string;
}

export interface PhoneInputProps {
  label?: string;
  countryCodeLabel?: string;
  numberLabel?: string;
  countryCodeValue: string;
  numberValue: string;
  countryCodeOptions: PhoneCountryCodeOption[];
  onCountryCodeChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const PhoneInput = ({
  label,
  countryCodeLabel = 'Country Code',
  numberLabel = 'Phone Number',
  countryCodeValue,
  numberValue,
  countryCodeOptions,
  onCountryCodeChange,
  onNumberChange,
  disabled = false,
  error,
  className = '',
}: PhoneInputProps) => {
  const selectedCountryCodeOption =
    countryCodeOptions?.find(option => option.value === countryCodeValue) ??
    null;

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
          <Label>{countryCodeLabel}</Label>
          <AsyncSelect
            value={selectedCountryCodeOption}
            disabled={disabled}
            loadOptions={loadCountryCodeOptions}
            pagination={false}
            defaultOptions={countryCodeOptions}
            cacheOptions
            placeholder={countryCodeLabel}
            size="md"
            variant="default"
            onChange={option => {
              onCountryCodeChange(option?.value?.toString() ?? '');
            }}
          />
        </div>

        <Input
          inputMode="numeric"
          label={numberLabel}
          value={numberValue}
          onChange={event => onNumberChange(event.target.value)}
          disabled={disabled}
        />
      </div>

      {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
    </div>
  );
};

export default PhoneInput;
