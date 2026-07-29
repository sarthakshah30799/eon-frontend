import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
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
import {
  buildSearchParams,
  readSearchParamList,
  readSearchParamValue,
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';

const TEMPLATE_OPTIONS: IReportTemplateOption[] = [
  {
    id: SpecialReportTemplateEnum.ACCOUNT_POSTING,
    label: 'Account Posting',
  },
];

export const useSpecialReportFilters = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
  const userAssignments = useMemo(() => user?.assignments ?? [], [user?.assignments]);
  const searchParamsKey = searchParams.toString();
  const parsedSearchParams = useMemo(() => new URLSearchParams(searchParamsKey), [searchParamsKey]);

  const hydratedRouteState = useMemo(() => {
    return {
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      template:
        (readSearchParamValue(parsedSearchParams, 'template') as SpecialReportTemplate) ||
        SpecialReportTemplateEnum.ACCOUNT_POSTING,
      sortBy:
        (readSearchParamValue(parsedSearchParams, 'sortBy') as ReportSortBy) ||
        ReportSortByEnum.DATE_ASC,
      transactionNumbersText: readSearchParamList(parsedSearchParams, 'transactionNumbers').join(','),
    };
  }, [parsedSearchParams]);

  const [branchIds, setBranchIds] = useState<string[]>(hydratedRouteState.branchIds);
  const [template, setTemplate] = useState<SpecialReportTemplate>(hydratedRouteState.template);
  const [sortBy, setSortBy] = useState<ReportSortBy>(hydratedRouteState.sortBy);
  const [transactionNumbersText, setTransactionNumbersText] = useState(
    hydratedRouteState.transactionNumbersText,
  );
  const [appliedFilters, setAppliedFilters] = useState<ISpecialReportRequest | null>(
    searchParamsKey
      ? {
          branchIds: hydratedRouteState.branchIds,
          template: hydratedRouteState.template,
          transactionNumbers: hydratedRouteState.transactionNumbersText
            .split(/[\n,]/)
            .map(item => item.trim())
            .filter(Boolean),
          sortBy: hydratedRouteState.sortBy,
        }
      : null,
  );

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

    const nextAppliedFilters = {
      branchIds: selectedBranchIds,
      template,
      transactionNumbers,
      sortBy,
    };

    const nextSearchParams = buildSearchParams(undefined, next => {
      setSearchParamList(next, 'branchIds', selectedBranchIds);
      setSearchParamValue(next, 'template', template);
      setSearchParamValue(next, 'sortBy', sortBy);
      setSearchParamList(next, 'transactionNumbers', transactionNumbers);
    });

    setAppliedFilters(nextAppliedFilters);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const resetFilters = () => {
    setBranchIds([]);
    setTemplate(SpecialReportTemplateEnum.ACCOUNT_POSTING);
    setSortBy(ReportSortByEnum.DATE_ASC);
    setTransactionNumbersText('');
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
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
