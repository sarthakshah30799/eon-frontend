import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import {
  useGetCounterProfile,
  useListCounterProfiles,
} from '@/modules/counterProfile/hooks';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import { PURCHASE_WORKPLACE_TEXT } from '../constants/purchaseConstants';

interface WorkplaceFormValues {
  branchId: string;
  counterId: string;
}

interface PurchaseWorkplaceFieldsProps {
  readOnly?: boolean;
}

const toCounterOption = (
  id: string,
  counterNo?: string | number | null,
  name?: string | null
): AsyncSelectOption => ({
  value: id,
  label:
    counterNo != null && String(counterNo).trim()
      ? `${counterNo} - ${name ?? ''}`.trim()
      : name?.trim() || id,
});

export const PurchaseWorkplaceFields = ({
  readOnly = false,
}: PurchaseWorkplaceFieldsProps) => {
  const form = useFormContext<WorkplaceFormValues>();
  const { user, activeCounterId } = useAuth();
  const branchId = useWatch({ name: 'branchId', control: form.control });
  const counterId = useWatch({ name: 'counterId', control: form.control });
  const canEditWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );

  const { data: branches = [], isLoading: isBranchesLoading } =
    useListBranchProfiles({ activeOnly: true });
  const { data: counters = [], isLoading: isCountersLoading } =
    useListCounterProfiles({ activeOnly: true }, canEditWorkplace);
  const { data: activeCounter, isLoading: isActiveCounterLoading } =
    useGetCounterProfile(activeCounterId ?? '');

  const previousBranchIdRef = useRef<string>('');

  const sessionCounterOption = useMemo<AsyncSelectOption | null>(() => {
    if (!activeCounterId) {
      return null;
    }

    if (activeCounter) {
      return toCounterOption(
        activeCounter.id,
        activeCounter.counterNo,
        activeCounter.name
      );
    }

    const assignment = user?.assignments?.find(
      item => item.counterId === activeCounterId
    );
    if (assignment) {
      return toCounterOption(
        assignment.counterId,
        user?.counterNo,
        assignment.counterName || user?.counterName
      );
    }

    if (user?.counterId === activeCounterId) {
      return toCounterOption(activeCounterId, user.counterNo, user.counterName);
    }

    return toCounterOption(activeCounterId);
  }, [activeCounter, activeCounterId, user]);

  const branchCounters = useMemo(() => {
    if (!branchId) {
      return [];
    }

    const selectedBranch = branches.find(branch => branch.id === branchId);
    const connectedCounterIds = new Set(
      selectedBranch?.connectCounterIds ?? []
    );

    return counters.filter(counter => connectedCounterIds.has(counter.id));
  }, [branchId, branches, counters]);

  useEffect(() => {
    if (
      previousBranchIdRef.current &&
      previousBranchIdRef.current !== branchId
    ) {
      form.setValue('counterId', '');
    }

    previousBranchIdRef.current = branchId || '';
  }, [branchId, form]);

  useEffect(() => {
    if (!canEditWorkplace) {
      return;
    }

    if (!counterId || !branchId || counters.length === 0) {
      return;
    }

    const belongsToBranch = branchCounters.some(
      counter => counter.id === counterId
    );
    if (!belongsToBranch) {
      form.setValue('counterId', '');
    }
  }, [
    branchCounters,
    branchId,
    canEditWorkplace,
    counterId,
    counters.length,
    form,
  ]);

  useEffect(() => {
    if (canEditWorkplace) {
      return;
    }

    if (!branchId || counterId || !activeCounterId) {
      return;
    }

    form.setValue('counterId', activeCounterId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [activeCounterId, branchId, canEditWorkplace, counterId, form]);

  const branchOptions = useMemo<AsyncSelectOption[]>(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [branches]
  );

  const counterOptions = useMemo<AsyncSelectOption[]>(() => {
    if (!canEditWorkplace) {
      return sessionCounterOption ? [sessionCounterOption] : [];
    }

    return branchCounters.map(counter =>
      toCounterOption(counter.id, counter.counterNo, counter.name)
    );
  }, [branchCounters, canEditWorkplace, sessionCounterOption]);

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
  const hasCounterOptions = counterOptions.length > 0;
  const counterPlaceholder = !branchId
    ? PURCHASE_WORKPLACE_TEXT.selectBranchFirst
    : hasCounterOptions
      ? PURCHASE_WORKPLACE_TEXT.selectCounter
      : PURCHASE_WORKPLACE_TEXT.noCountersForBranch;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormFieldSelect
        name="branchId"
        label={PURCHASE_WORKPLACE_TEXT.branchLabel}
        placeholder={PURCHASE_WORKPLACE_TEXT.selectBranch}
        loadOptions={loadBranchOptions}
        defaultOptions={branchOptions}
        isLoading={isBranchesLoading}
        disabled={disableSelection}
      />
      <FormFieldSelect
        key={branchId || 'counter-empty'}
        name="counterId"
        label={PURCHASE_WORKPLACE_TEXT.counterLabel}
        placeholder={counterPlaceholder}
        loadOptions={loadCounterOptions}
        defaultOptions={counterOptions}
        isLoading={
          canEditWorkplace ? isCountersLoading : isActiveCounterLoading
        }
        disabled={disableSelection || (canEditWorkplace && !hasCounterOptions)}
      />
    </div>
  );
};

export default PurchaseWorkplaceFields;
