import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, type AsyncSelectOption } from '@/components/ui';
import { useCountryDropdown } from './hooks';
import type { CountryDropdownOption, CountryDropdownProps } from './types';

export const CountryDropdown = ({
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select country',
  disabled = false,
  className = '',
  error,
  createLabel = 'Create',
  onCreateCountry,
}: CountryDropdownProps) => {
  const [defaultOptions, setDefaultOptions] = useState<CountryDropdownOption[]>(
    []
  );
  const { loadOptions } = useCountryDropdown();

  useEffect(() => {
    let isActive = true;

    const loadInitialOptions = async () => {
      try {
        const response = await loadOptions('');

        if (isActive) {
          setDefaultOptions(response.options as CountryDropdownOption[]);
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
        const nextOption = (option as CountryDropdownOption | null) ?? null;
        onChange?.(nextOption?.value ?? '');
      }}
      formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
      onCreateOption={async inputValue => {
        if (onCreateCountry) {
          await onCreateCountry(inputValue);
        }
      }}
      error={error}
    />
  );
};
