import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, Modal, type AsyncSelectOption } from '@/components/ui';
import { stateProfileApi } from '@/api/stateProfile';
import {
  StateProfileForm,
  useCreateStateProfile,
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
  const [defaultOptions, setDefaultOptions] = useState<StateDropdownOption[]>(
    []
  );
  const [selectedOption, setSelectedOption] =
    useState<StateDropdownOption | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingStateName, setPendingStateName] = useState('');
  const { loadOptions } = useStateDropdown(countryId);
  const { submitStateProfile, isPending: isCreatingState } =
    useCreateStateProfile();

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
        defaultOptions.find(option => option.value === value) ?? null;

      if (cachedOption) {
        if (isActive) {
          setSelectedOption(cachedOption);
        }
        return;
      }

      try {
        const state = await stateProfileApi.getStateProfileById(value);
        const nextOption = state
          ? {
              value: state.id,
              label: `${state.code} - ${state.name}`,
              stateId: state.id,
              countryId: state.countryId,
              code: state.code,
              name: state.name,
            }
          : null;

        if (isActive) {
          setSelectedOption(nextOption);
        }
      } catch {
        if (isActive) {
          setSelectedOption(null);
        }
      }
    };

    void resolveSelectedOption();

    return () => {
      isActive = false;
    };
  }, [defaultOptions, loadOptions, value]);

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

    setDefaultOptions(prevOptions => {
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
        placeholder={countryId ? placeholder : 'Select country first'}
        disabled={disabled || !countryId}
        className={className}
        loadOptions={loadOptions}
        defaultOptions={defaultOptions}
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
