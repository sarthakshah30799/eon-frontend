import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, Modal, type AsyncSelectOption } from '@/components/ui';
import { CountryProfileForm } from '@/modules/countryProfile/forms';
import { createEmptyCountryProfileFormValues } from '@/modules/countryProfile/utils';
import { useCreateCountryProfile } from '@/modules/countryProfile/hooks';
import { useCountryDropdown } from './hooks';
import type { CountryDropdownOption, CountryDropdownProps } from './types';
import type { CountryProfileFormValues } from '@/modules/countryProfile/types';

export const CountryDropdown = ({
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select country',
  disabled = false,
  className = '',
  error,
  createLabel = 'Create',
}: CountryDropdownProps) => {
  const [defaultOptions, setDefaultOptions] = useState<CountryDropdownOption[]>(
    []
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingCountryName, setPendingCountryName] = useState('');
  const { loadOptions } = useCountryDropdown();
  const { submitCountryProfile, isPending: isCreatingCountry } =
    useCreateCountryProfile();

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

  const createCountryDefaultValues = useMemo<CountryProfileFormValues>(
    () => ({
      ...createEmptyCountryProfileFormValues(),
      countryName: pendingCountryName,
    }),
    [pendingCountryName]
  );

  const handleCreateCountry = async (values: CountryProfileFormValues) => {
    const createdCountry = await submitCountryProfile(values);

    const nextOption: CountryDropdownOption = {
      value: createdCountry.countryName,
      label: createdCountry.countryName,
      countryId: createdCountry.id,
    };

    setDefaultOptions(prevOptions => {
      const nextOptions = prevOptions.filter(
        option => option.countryId !== nextOption.countryId
      );

      return [...nextOptions, nextOption];
    });

    onChange?.(nextOption.value);
    setIsCreateModalOpen(false);
    setPendingCountryName('');
  };

  return (
    <>
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
          const nextOption = (option as CountryDropdownOption | null) ?? null;
          onChange?.(nextOption?.value ?? '');
        }}
        formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
        onCreateOption={inputValue => {
          setPendingCountryName(inputValue);
          setIsCreateModalOpen(true);
        }}
        error={error}
      />

      <Modal
        open={isCreateModalOpen}
        onOpenChange={nextOpen => {
          setIsCreateModalOpen(nextOpen);

          if (!nextOpen) {
            setPendingCountryName('');
          }
        }}
        title="Create Country"
        description="Add a new country and use it immediately in the dropdown."
        size="lg"
      >
        <CountryProfileForm
          defaultValues={createCountryDefaultValues}
          onSubmit={handleCreateCountry}
          submitLabel="Create Country"
          isSubmitting={isCreatingCountry}
        />
      </Modal>
    </>
  );
};
