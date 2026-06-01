import type { AsyncSelectOption } from '@/components/ui';

export interface CountryRecord {
  id: string;
  name: string;
}

export interface CountryDropdownOption extends AsyncSelectOption {
  value: string;
  label: string;
  countryId: string;
}

export interface CountryDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  createLabel?: string;
  onCreateCountry?: (inputValue: string) => void | Promise<void>;
}
