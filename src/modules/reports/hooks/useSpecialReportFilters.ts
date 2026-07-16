import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api';
import { buildReportOptionLabel, toggleId, uniqueOptions } from '../utils';
import {
  SpecialReportTemplateEnum,
  type IReportSelectOption,
  type IReportTemplateOption,
  type ISpecialReportRequest,
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

    setAppliedFilters({
      branchIds: selectedBranchIds,
      template,
    });
  };

  const resetFilters = () => {
    setBranchIds([]);
    setTemplate(SpecialReportTemplateEnum.ACCOUNT_POSTING);
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
    templateOptions: TEMPLATE_OPTIONS,
    appliedFilters,
    handleView,
    resetFilters,
    canView,
  };
};

export type SpecialReportFilters = ReturnType<typeof useSpecialReportFilters>;
