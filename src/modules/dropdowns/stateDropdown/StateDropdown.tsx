import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, type AsyncSelectOption } from '@/components/ui';
import { useStateDropdown } from './hooks';
import type { StateDropdownOption, StateDropdownProps } from './types/stateDropdown.types';

export const StateDropdown = ({
  value,
  onChange,
  label = 'State',
  placeholder = 'Select state',
  disabled = false,
  className = '',
  error,
  createLabel = 'Create',
  onCreateState,
}: StateDropdownProps) => {
  const [defaultOptions, setDefaultOptions] = useState<StateDropdownOption[]>(
    []
  );
  const { loadOptions } = useStateDropdown();

  useEffect(() => {
    let isActive = true;

    const loadInitialOptions = async () => {
      try {
        const response = await loadOptions('');

        if (isActive) {
          setDefaultOptions(response.options as StateDropdownOption[]);
        }
      } catch {
        if (isActive) {
          setDefaultOptions([]);
        }
      }
    };

    loadInitialOptions();

    return () => {
      isActive = false;
    };
  }, [loadOptions]);

  const selectedOption = useMemo(() => {
    if (!value) {
      return null;
    }

    return defaultOptions.find(option => option.value === value) ?? null;
  }, [defaultOptions, value]);

  return (
    <AsyncSelect
      label={label}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      isClearable
      value={selectedOption as AsyncSelectOption | null}
      onChange={option => {
        const nextOption = (option as StateDropdownOption | null) ?? null;
        onChange?.(nextOption?.value ?? '');
      }}
      formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
      onCreateOption={async inputValue => {
        if (onCreateState) {
          await onCreateState(inputValue);
        }
      }}
      error={error}
    />
  );
};
