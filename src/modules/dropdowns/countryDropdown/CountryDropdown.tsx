import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AsyncSelect,
  Modal,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import { CountryProfileForm } from '@/modules/countryProfile/forms';
import {
  useCreateCountryProfile,
  useGetCountryProfile,
  useListCountryProfiles,
} from '@/modules/countryProfile/hooks';
import { createEmptyCountryProfileFormValues } from '@/modules/countryProfile/utils';
import type { ICreateCountryProfile } from '@/modules/countryProfile/types';
import type {
  CountryDropdownOption,
  CountryDropdownProps,
} from './types/countryDropdown.types';

export const CountryDropdown = ({
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select country',
  disabled = false,
  className = '',
  error,
  createLabel = 'Create',
  size,
}: CountryDropdownProps) => {
  const [createdOptions, setCreatedOptions] = useState<CountryDropdownOption[]>(
    []
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingCountryName, setPendingCountryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const defaultOptionsRef = useRef<CountryDropdownOption[]>([]);
  const pendingLoadRef = useRef<{
    inputValue: string;
    resolve: (response: AsyncSelectResponse) => void;
  } | null>(null);

  const {
    data: countryResponse,
    isLoading: isLoadingOptions,
    isFetching: isFetchingOptions,
  } = useListCountryProfiles({
    page: 1,
    limit: 25,
    search: searchTerm.trim() || undefined,
  });

  const { data: selectedCountry, isFetching: isResolvingSelectedOption } =
    useGetCountryProfile(value || '');
  const { submitCountryProfile, isPending: isCreatingCountry } =
    useCreateCountryProfile();

  const defaultOptions = useMemo<CountryDropdownOption[]>(
    () =>
      (countryResponse?.data ?? []).map(country => ({
        value: country.id,
        label: `${country.code} - ${country.name}`,
        countryId: country.id,
        code: country.code,
        name: country.name,
      })),
    [countryResponse?.data]
  );

  const mergedDefaultOptions = useMemo<CountryDropdownOption[]>(() => {
    const map = new Map<string, CountryDropdownOption>();

    defaultOptions.forEach(option => {
      map.set(option.value, option);
    });

    createdOptions.forEach(option => {
      map.set(option.value, option);
    });

    return Array.from(map.values());
  }, [createdOptions, defaultOptions, searchTerm]);

  const loadOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      
      const normalizedInput = inputValue.trim();
      const pendingLoad = pendingLoadRef.current;
      setSearchTerm(inputValue);

      if (!normalizedInput) {
        const baseOptions =
          defaultOptionsRef.current.length > 0
            ? defaultOptionsRef.current
            : mergedDefaultOptions;

        if (pendingLoad) {
          pendingLoad.resolve({ options: baseOptions });
          pendingLoadRef.current = null;
        }

        return { options: baseOptions };
      }

      const currentSearch = searchTerm.trim();
      const isStable = normalizedInput === currentSearch && !isFetchingOptions;

      if (isStable) {
        return { options: mergedDefaultOptions };
      }

      if (pendingLoad && pendingLoad.inputValue !== normalizedInput) {
        pendingLoad.resolve({ options: mergedDefaultOptions });
      }

      return new Promise<AsyncSelectResponse>(resolve => {
        pendingLoadRef.current = {
          inputValue: normalizedInput,
          resolve,
        };
      });
    },
    [isFetchingOptions, mergedDefaultOptions, searchTerm]
  );

  useEffect(() => {
    const pendingLoad = pendingLoadRef.current;

    if (!pendingLoad) {
      return;
    }

    const normalizedSearch = searchTerm.trim();
    const isReady =
      pendingLoad.inputValue === normalizedSearch && !isFetchingOptions;

    if (!isReady) {
      return;
    }

    pendingLoad.resolve({ options: mergedDefaultOptions });
    pendingLoadRef.current = null;
  }, [isFetchingOptions, mergedDefaultOptions, searchTerm]);

  useEffect(() => {
    if (
      searchTerm.trim() !== '' ||
      isFetchingOptions ||
      mergedDefaultOptions.length === 0
    ) {
      return;
    }

    defaultOptionsRef.current = mergedDefaultOptions;
  }, [isFetchingOptions, mergedDefaultOptions, searchTerm]);

  const selectedOption = useMemo<CountryDropdownOption | null>(() => {
    if (!value) {
      return null;
    }

    const cachedOption =
      mergedDefaultOptions.find(option => option.value === value) ?? null;

    if (cachedOption) {
      return cachedOption;
    }

    if (!selectedCountry || selectedCountry.id !== value) {
      return null;
    }

    return {
      value: selectedCountry.id,
      label: `${selectedCountry.code} - ${selectedCountry.name}`,
      countryId: selectedCountry.id,
      code: selectedCountry.code,
      name: selectedCountry.name,
    };
  }, [mergedDefaultOptions, selectedCountry, value]);

  const createCountryDefaultValues = useMemo<ICreateCountryProfile>(
    () => ({
      ...createEmptyCountryProfileFormValues(),
      name: pendingCountryName,
    }),
    [pendingCountryName]
  );

  const handleCreateCountry = async (values: ICreateCountryProfile) => {
    const createdCountry = await submitCountryProfile(values);

    const nextOption: CountryDropdownOption = {
      value: createdCountry.id,
      label: `${createdCountry.code} - ${createdCountry.name}`,
      countryId: createdCountry.id,
      code: createdCountry.code,
      name: createdCountry.name,
    };

    setCreatedOptions(prevOptions => {
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
        size={size}
        isCreatable
        loadOptions={loadOptions}
        defaultOptions={mergedDefaultOptions}
        isClearable
        isLoading={
          isLoadingOptions || isFetchingOptions || isResolvingSelectedOption
        }
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
          insideModal
        />
      </Modal>
    </>
  );
};
