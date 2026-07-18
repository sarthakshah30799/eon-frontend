import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useListCounterProfiles } from '@/modules/counterProfile/hooks';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';

interface WorkplaceFormValues {
  branchId: string;
  counterId: string;
}

interface PurchaseWorkplaceFieldsProps {
  readOnly?: boolean;
}

export const PurchaseWorkplaceFields = ({
  readOnly = false,
}: PurchaseWorkplaceFieldsProps) => {
  const form = useFormContext<WorkplaceFormValues>();
  const { user } = useAuth();
  const branchId = useWatch({ name: 'branchId', control: form.control });
  const canEditWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );

  const { data: branches = [] } = useListBranchProfiles({ activeOnly: true });
  const { data: counters = [] } = useListCounterProfiles(
    { activeOnly: true, branchId: branchId || undefined },
    Boolean(branchId)
  );

  const previousBranchIdRef = useRef<string>('');

  useEffect(() => {
    if (previousBranchIdRef.current && previousBranchIdRef.current !== branchId) {
      form.setValue('counterId', '');
    }

    previousBranchIdRef.current = branchId || '';
  }, [branchId, form]);

  const branchOptions = useMemo<AsyncSelectOption[]>(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [branches]
  );

  const counterOptions = useMemo<AsyncSelectOption[]>(
    () =>
      counters.map(counter => ({
        value: counter.id,
        label: `${counter.counterNo} - ${counter.name}`,
      })),
    [counters]
  );

  const loadBranchOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? branchOptions.filter(option =>
            option.label.toLowerCase().includes(normalizedInput)
          )
        : branchOptions;

      return {
        options: filteredOptions,
      };
    },
    [branchOptions]
  );

  const loadCounterOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      if (!branchId) {
        return { options: [] };
      }

      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? counterOptions.filter(option =>
            option.label.toLowerCase().includes(normalizedInput)
          )
        : counterOptions;

      return {
        options: filteredOptions,
      };
    },
    [branchId, counterOptions]
  );

  const disableSelection = readOnly || !canEditWorkplace;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormFieldSelect
        name="branchId"
        label="Branch"
        placeholder="Select branch"
        loadOptions={loadBranchOptions}
        defaultOptions={branchOptions}
        disabled={disableSelection}
      />
      <FormFieldSelect
        key={branchId || 'counter-empty'}
        name="counterId"
        label="Counter"
        placeholder={branchId ? 'Select counter' : 'Select branch first'}
        loadOptions={loadCounterOptions}
        defaultOptions={counterOptions}
        disabled={disableSelection || !branchId}
      />
    </div>
  );
};

export default PurchaseWorkplaceFields;
