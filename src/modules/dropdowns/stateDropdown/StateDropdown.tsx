import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, Modal, type AsyncSelectOption } from '@/components/ui';
import {
  StateProfileForm,
  useCreateStateProfile,
  useGetStateProfile,
} from '@/modules/stateProfile';
import { createEmptyStateProfileFormValues } from '@/modules/stateProfile/utils';
import type { ICreateStateProfile } from '@/modules/stateProfile/types';
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
  countryId,
  createLabel = 'Create',
  onCreateState,
}: StateDropdownProps) => {
  const [createdOptions, setCreatedOptions] = useState<StateDropdownOption[]>(
    []
  );
  const [selectedOption, setSelectedOption] =
    useState<StateDropdownOption | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingStateName, setPendingStateName] = useState('');
  const {
    defaultOptions,
    loadOptions,
    isLoading: isLoadingOptions,
    isFetching: isFetchingOptions,
  } = useStateDropdown(countryId);
  const { data: selectedState, isFetching: isResolvingSelectedOption } =
    useGetStateProfile(value || '');
  const { submitStateProfile, isPending: isCreatingState } =
    useCreateStateProfile();

  const mergedDefaultOptions = useMemo<StateDropdownOption[]>(
    () => {
      const map = new Map<string, StateDropdownOption>();

      defaultOptions.forEach(option => {
        map.set(option.value, option);
      });

      createdOptions.forEach(option => {
        map.set(option.value, option);
      });

      return Array.from(map.values());
    },
    [createdOptions, defaultOptions]
  );

  useEffect(() => {
    let isActive = true;

    const resolveSelectedOption = async () => {
      if (!value) {
        if (isActive) {
          setSelectedOption(null);
        }
        return;
      }

      const cachedOption =
        mergedDefaultOptions.find(option => option.value === value) ?? null;

      if (cachedOption) {
        if (isActive) {
          setSelectedOption(cachedOption);
        }
        return;
      }

      const nextOption = selectedState
        ? {
            value: selectedState.id,
            label: `${selectedState.code} - ${selectedState.name}`,
            stateId: selectedState.id,
            countryId: selectedState.countryId,
            code: selectedState.code,
            name: selectedState.name,
          }
        : null;

      if (isActive) {
        setSelectedOption(nextOption);
      }
    };

    void resolveSelectedOption();

    return () => {
      isActive = false;
    };
  }, [mergedDefaultOptions, selectedState, value]);

  const createStateDefaultValues = useMemo<ICreateStateProfile>(
    () => ({
      ...createEmptyStateProfileFormValues(),
      countryId: countryId ?? '',
      name: pendingStateName,
    }),
    [countryId, pendingStateName]
  );

  const handleCreateState = async (values: ICreateStateProfile) => {
    const createdState = await submitStateProfile(values);

    const nextOption: StateDropdownOption = {
      value: createdState.id,
      label: `${createdState.code} - ${createdState.name}`,
      stateId: createdState.id,
      countryId: createdState.countryId,
      code: createdState.code,
      name: createdState.name,
    };

    setCreatedOptions(prevOptions => {
      const nextOptions = prevOptions.filter(
        option => option.stateId !== nextOption.stateId
      );

      return [...nextOptions, nextOption];
    });

    onChange?.(nextOption.value);
    setIsCreateModalOpen(false);
    setPendingStateName('');

    if (onCreateState) {
      await onCreateState(nextOption.value);
    }
  };

  return (
    <>
      <AsyncSelect
        label={label}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        loadOptions={loadOptions}
        defaultOptions={mergedDefaultOptions}
        isLoading={
          isLoadingOptions || isFetchingOptions || isResolvingSelectedOption
        }
        isCreatable={Boolean(countryId)}
        isClearable
        value={selectedOption as AsyncSelectOption | null}
        onChange={option => {
          const nextOption = (option as StateDropdownOption | null) ?? null;
          onChange?.(nextOption?.value ?? '');
        }}
        formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
        onCreateOption={inputValue => {
          if (!countryId) {
            return;
          }

          setPendingStateName(inputValue);
          setIsCreateModalOpen(true);
        }}
        error={error}
      />

      <Modal
        open={isCreateModalOpen}
        onOpenChange={nextOpen => {
          setIsCreateModalOpen(nextOpen);

          if (!nextOpen) {
            setPendingStateName('');
          }
        }}
        title="Create State"
        description="Add a new state and use it immediately in the dropdown."
        size="lg"
      >
        <StateProfileForm
          defaultValues={createStateDefaultValues}
          onSubmit={handleCreateState}
          submitLabel="Create State"
          isSubmitting={isCreatingState}
        />
      </Modal>
    </>
  );
};
