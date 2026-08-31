import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reportsApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { FLM8_CN_STATEMENT_TEXT } from '../constants/flm8CnStatementConstants';
import type {
  IFlm8CnStatementLockDataResponse,
  IReportSelectOption,
} from '../types';
import type { Flm8CnStatementFiltersState } from './useFlm8CnStatementFilters';

interface UseFlm8CnStatementLockDataArgs {
  filters: Flm8CnStatementFiltersState;
}

const resolveInitialBranchIds = (
  appliedBranchIds: string[],
  branchOptions: IReportSelectOption[]
) => {
  if (appliedBranchIds.length > 0) {
    return appliedBranchIds.filter(id =>
      branchOptions.some(option => option.id === id)
    );
  }

  return branchOptions.map(option => option.id);
};

export const useFlm8CnStatementLockData = ({
  filters,
}: UseFlm8CnStatementLockDataArgs) => {
  const { checkAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

  const appliedFilters = filters.appliedFilters;
  const branchOptions = filters.branchOptions;
  const lockedThroughDate = appliedFilters?.dateRange.endDate ?? '';
  const reportStartDate = appliedFilters?.dateRange.startDate ?? '';

  const allSelected =
    branchOptions.length > 0 &&
    selectedBranchIds.length === branchOptions.length;

  const openLockModal = useCallback(() => {
    if (!appliedFilters?.dateRange.endDate) {
      toast.error(FLM8_CN_STATEMENT_TEXT.lockDataNoEndDate);
      return;
    }

    setSelectedBranchIds(
      resolveInitialBranchIds(appliedFilters.branchIds, branchOptions)
    );
    setIsOpen(true);
  }, [appliedFilters, branchOptions]);

  const closeLockModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleBranch = useCallback((id: string, checked: boolean) => {
    setSelectedBranchIds(current => {
      if (checked) {
        return current.includes(id) ? current : [...current, id];
      }
      return current.filter(branchId => branchId !== id);
    });
  }, []);

  const toggleAllBranches = useCallback(
    (checked: boolean) => {
      setSelectedBranchIds(
        checked ? branchOptions.map(option => option.id) : []
      );
    },
    [branchOptions]
  );

  const mutation = useMutation({
    mutationFn: async (): Promise<IFlm8CnStatementLockDataResponse> => {
      const branchIds =
        selectedBranchIds.length > 0
          ? selectedBranchIds
          : branchOptions.map(option => option.id);

      if (!lockedThroughDate) {
        throw new Error(FLM8_CN_STATEMENT_TEXT.lockDataNoEndDate);
      }

      if (!branchIds.length) {
        throw new Error(FLM8_CN_STATEMENT_TEXT.lockDataNoBranches);
      }

      return reportsApi.lockFlm8CnStatementData({
        lockedThroughDate,
        branchIds,
        reportStartDate: reportStartDate || undefined,
        reportEndDate: lockedThroughDate,
      });
    },
    onSuccess: async result => {
      const changed = result.results.filter(
        row => row.status === 'created' || row.status === 'advanced'
      ).length;
      const skipped = result.results.filter(
        row => row.status === 'skipped' || row.status === 'unchanged'
      ).length;

      if (changed > 0 && skipped === 0) {
        toast.success(FLM8_CN_STATEMENT_TEXT.lockDataSuccess);
      } else {
        toast.success(FLM8_CN_STATEMENT_TEXT.lockDataPartialSuccess);
      }

      setIsOpen(false);
      await checkAuth();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error && error.message
          ? error.message
          : FLM8_CN_STATEMENT_TEXT.lockDataError;
      toast.error(message);
    },
  });

  const canOpen = Boolean(appliedFilters?.dateRange.endDate);

  return useMemo(
    () => ({
      isOpen,
      openLockModal,
      closeLockModal,
      canOpen,
      lockedThroughDate,
      branchOptions,
      selectedBranchIds,
      allSelected,
      toggleBranch,
      toggleAllBranches,
      confirmLock: mutation.mutateAsync,
      isLocking: mutation.isPending,
    }),
    [
      allSelected,
      branchOptions,
      canOpen,
      closeLockModal,
      isOpen,
      lockedThroughDate,
      mutation.isPending,
      mutation.mutateAsync,
      openLockModal,
      selectedBranchIds,
      toggleAllBranches,
      toggleBranch,
    ]
  );
};

export default useFlm8CnStatementLockData;
