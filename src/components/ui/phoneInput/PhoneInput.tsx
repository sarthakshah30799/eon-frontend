import { Label } from '../label';
import { Input } from '../input';

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
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="grid grid-cols-[140px_1fr] gap-3">
        <div className="space-y-2">
          <Label>{countryCodeLabel}</Label>
          <select
            value={countryCodeValue}
            disabled={disabled}
            onChange={event => onCountryCodeChange(event.target.value)}
            className="block w-full rounded-sm border border-border-secondary bg-surface-primary px-3 py-2 text-text-primary shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {countryCodeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
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

