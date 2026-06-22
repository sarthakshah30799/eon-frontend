import { useCallback } from 'react';
import { AsyncSelect, type AsyncSelectOption } from '@/components/ui';

interface PartyProfileTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  disabled?: boolean;
}

export const PartyProfileTypeSelect = ({
  value,
  onChange,
  options,
  label = 'Profile Type',
  disabled = false,
}: PartyProfileTypeSelectProps) => {
  const toDisplayOption = (option: { value: string; label: string }) => ({
    ...option,
    label: option.label.toUpperCase(),
  });

  const loadOptions = useCallback(async (inputValue: string) => {
    const normalizedInput = inputValue.trim().toLowerCase();

    const filteredOptions = options.filter(option => {
      if (!normalizedInput) {
        return true;
      }

      return (
        option.label.toLowerCase().includes(normalizedInput) ||
        String(option.value).toLowerCase().includes(normalizedInput)
      );
    });

    return { options: filteredOptions.map(toDisplayOption) as AsyncSelectOption[] };
  }, [options]);

  return (
    <div className="space-y-1">
      <AsyncSelect
        id="party-profile-type"
        label={label}
        value={toDisplayOption(
          options.find(option => option.value === value) ?? {
            value,
            label: value,
          }
        )}
        disabled={disabled}
        loadOptions={loadOptions}
        defaultOptions={options.map(toDisplayOption)}
        isSearchable={false}
        onChange={selectedOption => {
          if (Array.isArray(selectedOption) || !selectedOption) {
            return;
          }

          onChange(String((selectedOption as AsyncSelectOption).value));
        }}
        className="space-y-0!"
      />
    </div>
  );
};

export default PartyProfileTypeSelect;
