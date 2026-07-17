import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api';
import { buildReportOptionLabel, toggleId, uniqueOptions } from '../utils';
import {
  SpecialReportTemplateEnum,
  ReportSortByEnum,
  type IReportSelectOption,
  type IReportTemplateOption,
  type ISpecialReportRequest,
  type ReportSortBy,
  type SpecialReportTemplate,
} from '../types';

const TEMPLATE_OPTIONS: IReportTemplateOption[] = [
  {
    id: SpecialReportTemplateEnum.ACCOUNT_POSTING,
    label: 'Account Posting',
  },
];

export const useSpecialReportFilters = () => {
  const { user } = useAuth();
  const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
  const userAssignments = useMemo(() => user?.assignments ?? [], [user?.assignments]);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [template, setTemplate] = useState<SpecialReportTemplate>(
    SpecialReportTemplateEnum.ACCOUNT_POSTING,
  );
  const [sortBy, setSortBy] = useState<ReportSortBy>(ReportSortByEnum.DATE_ASC);
  const [transactionNumbersText, setTransactionNumbersText] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<ISpecialReportRequest | null>(null);

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-special-branch-profiles'],
    enabled: true,
    queryFn: async () =>
      branchProfileApi.getBranchProfiles({
        activeOnly: true,
      }),
  });

  const accessibleBranchProfiles = useMemo(
    () =>
      isRestrictedUser
        ? branchProfiles.filter(branch =>
            userAssignments.some(assignment => assignment.branchId === branch.id),
          )
        : branchProfiles,
    [branchProfiles, isRestrictedUser, userAssignments],
  );

  const branchOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        accessibleBranchProfiles.map(branch => ({
          id: branch.id,
          label: buildReportOptionLabel(branch.code, branch.name),
        })),
      ),
    [accessibleBranchProfiles],
  );

  const selectedBranchIds = useMemo(
    () => branchIds.filter(branchId => branchOptions.some(option => option.id === branchId)),
    [branchIds, branchOptions],
  );

  const branchAllSelected =
    branchOptions.length > 0 && selectedBranchIds.length === branchOptions.length;

  const canView = selectedBranchIds.length > 0;

  const handleView = () => {
    if (!canView) {
      return;
    }

    const transactionNumbers = transactionNumbersText
      .split(/[\n,]/)
      .map(item => item.trim())
      .filter(Boolean);

    setAppliedFilters({
      branchIds: selectedBranchIds,
      template,
      transactionNumbers,
      sortBy,
    });
  };

  const resetFilters = () => {
    setBranchIds([]);
    setTemplate(SpecialReportTemplateEnum.ACCOUNT_POSTING);
    setSortBy(ReportSortByEnum.DATE_ASC);
    setTransactionNumbersText('');
    setAppliedFilters(null);
  };

  const toggleBranch = (id: string, checked: boolean) => {
    setBranchIds(current => toggleId(current, id, checked));
  };

  const toggleAllBranches = (checked: boolean) => {
    setBranchIds(checked ? branchOptions.map(option => option.id) : []);
  };

  return {
    branchOptions,
    branchIds: selectedBranchIds,
    branchAllSelected,
    toggleBranch,
    toggleAllBranches,
    template,
    setTemplate,
    sortBy,
    setSortBy,
    transactionNumbersText,
    setTransactionNumbersText,
    templateOptions: TEMPLATE_OPTIONS,
    appliedFilters,
    handleView,
    resetFilters,
    canView,
  };
};

export type SpecialReportFilters = ReturnType<typeof useSpecialReportFilters>;
