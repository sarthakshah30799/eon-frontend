import type { AsyncSelectOption } from '@/components/ui';

export interface CountryRecord {
  id: string;
  code: string;
  name: string;
}

export interface CountryDropdownOption extends AsyncSelectOption {
  value: string;
  label: string;
  countryId: string;
  code: string;
  name: string;
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
  size?: 'sm' | 'md' | 'lg';
  onCreateCountry?: (inputValue: string) => void | Promise<void>;
}
