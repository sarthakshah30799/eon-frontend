import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, Modal, type AsyncSelectOption } from '@/components/ui';
import {
  StateProfileForm,
  useCreateStateProfile,
} from '@/modules/stateProfile';
import { createEmptyStateProfileFormValues } from '@/modules/stateProfile/utils';
import type { StateProfileFormValues } from '@/modules/stateProfile/types';
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingStateName, setPendingStateName] = useState('');
  const { loadOptions } = useStateDropdown();
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

  const selectedOption = useMemo(() => {
    if (!value) {
      return null;
    }

    return defaultOptions.find(option => option.value === value) ?? null;
  }, [defaultOptions, value]);

  const createStateDefaultValues = useMemo<StateProfileFormValues>(
    () => ({
      ...createEmptyStateProfileFormValues(),
      stateName: pendingStateName,
    }),
    [pendingStateName]
  );

  const handleCreateState = async (values: StateProfileFormValues) => {
    const createdState = await submitStateProfile(values);

    const nextOption: StateDropdownOption = {
      value: createdState.stateName,
      label: createdState.stateName,
      stateId: createdState.id,
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
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        loadOptions={loadOptions}
        defaultOptions={defaultOptions}
        isCreatable
        isClearable
        value={selectedOption as AsyncSelectOption | null}
        onChange={option => {
          const nextOption = (option as StateDropdownOption | null) ?? null;
          onChange?.(nextOption?.value ?? '');
        }}
        formatCreateLabel={inputValue => `${createLabel} "${inputValue}"`}
        onCreateOption={inputValue => {
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

