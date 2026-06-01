import type { AsyncSelectOption } from '@/components/ui';

export interface CityRecord {
  id: string;
  name: string;
}

export interface CityDropdownOption extends AsyncSelectOption {
  value: string;
  label: string;
  cityId: string;
}

export interface CityDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  createLabel?: string;
  onCreateCity?: (inputValue: string) => void | Promise<void>;
}
