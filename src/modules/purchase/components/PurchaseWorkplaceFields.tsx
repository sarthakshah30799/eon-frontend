import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormFieldSelect } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { counterProfileApi } from '@/api/counterProfile';
import {
  useGetBranchProfile,
  useLoadBranchOptions,
} from '@/modules/branchProfile/hooks';
import { useGetCounterProfile } from '@/modules/counterProfile/hooks';
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

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const { data: selectedBranch } = useGetBranchProfile(branchId || '');
  const { data: counters = [], isLoading: isCountersLoading } = useQuery({
    queryKey: ['counter-profiles-all', { activeOnly: true }],
    queryFn: () => counterProfileApi.getAllCounterProfiles({ activeOnly: true }),
    enabled: canEditWorkplace,
  });
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

    const connectedCounterIds = new Set(
      selectedBranch?.connectCounterIds ?? []
    );

    return counters.filter(counter => connectedCounterIds.has(counter.id));
  }, [branchId, counters, selectedBranch]);

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

    if (!counterId || !branchId || counters.length === 0 || !selectedBranch) {
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
    selectedBranch,
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

  const counterOptions = useMemo<AsyncSelectOption[]>(() => {
    if (!canEditWorkplace) {
      return sessionCounterOption ? [sessionCounterOption] : [];
    }

    return branchCounters.map(counter =>
      toCounterOption(counter.id, counter.counterNo, counter.name)
    );
  }, [branchCounters, canEditWorkplace, sessionCounterOption]);

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
        defaultOptions={true}
        pagination
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
