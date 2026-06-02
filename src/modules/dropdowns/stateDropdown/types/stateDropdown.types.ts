import type { AsyncSelectOption } from '@/components/ui';

export interface StateDropdownOption extends AsyncSelectOption {
  value: string;
  label: string;
  stateId: string;
  countryId: string;
  code: string;
  name: string;
}

export interface StateDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  createLabel?: string;
  onCreateState?: (inputValue: string) => void | Promise<void>;
}
