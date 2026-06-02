import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, type AsyncSelectOption } from '@/components/ui';
import { useCityDropdown } from './hooks';
import type { CityDropdownOption, CityDropdownProps } from './types/cityDropdown.types';

export const CityDropdown = ({
  value,
  onChange,
  label = 'City',
  placeholder = 'Select city',
  disabled = false,
  className = '',
  error,
  createLabel = 'Create',
  onCreateCity,
}: CityDropdownProps) => {
  const [defaultOptions, setDefaultOptions] = useState<CityDropdownOption[]>(
    []
  );
  const { loadOptions } = useCityDropdown();

  useEffect(() => {
    let isActive = true;

    const loadInitialOptions = async () => {
      try {
        const response = await loadOptions('');

        if (isActive) {
          setDefaultOptions(response.options as CityDropdownOption[]);
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
      isCreatable
      loadOptions={loadOptions}
      defaultOptions={defaultOptions}
      isClearable
      value={selectedOption as AsyncSelectOption | null}
      onChange={option => {
        const nextOption = (option as CityDropdownOption | null) ?? null;
        onChange?.(nextOption?.value ?? '');
      }}
      formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
      onCreateOption={async inputValue => {
        if (onCreateCity) {
          await onCreateCity(inputValue);
        }
      }}
      error={error}
    />
  );
};
