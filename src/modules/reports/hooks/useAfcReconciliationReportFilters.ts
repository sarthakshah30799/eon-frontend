import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi, counterProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import {
  AFC_RECONCILIATION_REPORT_TEXT,
  AfcReconciliationReportLayoutEnum,
  AfcReconciliationReportScopeEnum,
  type AfcReconciliationReportLayout,
  type AfcReconciliationReportScope,
} from '../constants/afcReconciliationReportConstants';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';
import {
  buildReportDateRange,
  buildReportOptionLabel,
  formatReportDateRangeLabel,
  toggleId,
  uniqueOptions,
} from '../utils';
import {
  buildSearchParams,
  readDateRangeSearchParams,
  readSearchParamList,
  readSearchParamValue,
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';

export interface AfcReconciliationReportFiltersState {
  dateRange: IReportDateRange;
  accountingDate: string;
  branchIds: string[];
  counterIds: string[];
  layout: AfcReconciliationReportLayout;
  scope: AfcReconciliationReportScope;
  branchOptions: IReportSelectOption[];
  counterOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  counterAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setAccountingDate: (value: string) => void;
  setLayout: (value: AfcReconciliationReportLayout) => void;
  setScope: (value: AfcReconciliationReportScope) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleCounter: (id: string, checked: boolean) => void;
  toggleAllCounters: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    accountingDate: string;
    branchIds: string[];
    counterIds: string[];
    layout: AfcReconciliationReportLayout;
    scope: AfcReconciliationReportScope;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  layoutLabel: string;
  scopeLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseLayout = (value: string): AfcReconciliationReportLayout =>
  value === AfcReconciliationReportLayoutEnum.SUMMARY
    ? AfcReconciliationReportLayoutEnum.SUMMARY
    : AfcReconciliationReportLayoutEnum.DETAIL;

const parseScope = (value: string): AfcReconciliationReportScope =>
  value === AfcReconciliationReportScopeEnum.CONSOLIDATED
    ? AfcReconciliationReportScopeEnum.CONSOLIDATED
    : AfcReconciliationReportScopeEnum.BRANCH;

const layoutLabel = (value: AfcReconciliationReportLayout) =>
  value === AfcReconciliationReportLayoutEnum.SUMMARY
    ? AFC_RECONCILIATION_REPORT_TEXT.summary
    : AFC_RECONCILIATION_REPORT_TEXT.detail;

const scopeLabel = (value: AfcReconciliationReportScope) =>
  value === AfcReconciliationReportScopeEnum.CONSOLIDATED
    ? AFC_RECONCILIATION_REPORT_TEXT.consolidated
    : AFC_RECONCILIATION_REPORT_TEXT.branchScope;

export const useAfcReconciliationReportFilters =
  (): AfcReconciliationReportFiltersState => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
    const userAssignments = useMemo(
      () => user?.assignments ?? [],
      [user?.assignments]
    );
    const searchParamsKey = searchParams.toString();
    const parsedSearchParams = useMemo(
      () => new URLSearchParams(searchParamsKey),
      [searchParamsKey]
    );
    const hydrated = useMemo(() => {
      const dateRange = readDateRangeSearchParams(
        parsedSearchParams,
        ReportDatePresetEnum.CURRENT_MONTH
      );
      return {
        dateRange,
        accountingDate:
          readSearchParamValue(parsedSearchParams, 'accountingDate') ||
          dateRange.endDate,
        branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
        counterIds: readSearchParamList(parsedSearchParams, 'counterIds'),
        layout: parseLayout(readSearchParamValue(parsedSearchParams, 'layout')),
        scope: parseScope(readSearchParamValue(parsedSearchParams, 'scope')),
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState(hydrated.dateRange);
    const [accountingDate, setAccountingDate] = useState(
      hydrated.accountingDate
    );
    const [branchIds, setBranchIds] = useState(hydrated.branchIds);
    const [counterIds, setCounterIds] = useState(hydrated.counterIds);
    const [layout, setLayout] = useState(hydrated.layout);
    const [scope, setScope] = useState(hydrated.scope);
    const [appliedFilters, setAppliedFilters] = useState<
      AfcReconciliationReportFiltersState['appliedFilters']
    >(searchParamsKey ? hydrated : null);

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-afc-branches'],
      queryFn: async () =>
        branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
    });
    const { data: counterProfiles = [] } = useQuery({
      queryKey: ['reports-afc-counters'],
      queryFn: async () =>
        counterProfileApi.getAllCounterProfiles({ activeOnly: true }),
    });

    const branchOptions = useMemo<IReportSelectOption[]>(() => {
      const accessible = isRestrictedUser
        ? branchProfiles.filter(branch =>
            userAssignments.some(assignment => assignment.branchId === branch.id)
          )
        : branchProfiles;
      return uniqueOptions(
        accessible.map(branch =>
          toOption(branch.id, buildReportOptionLabel(branch.code, branch.name))
        )
      );
    }, [branchProfiles, isRestrictedUser, userAssignments]);

    const selectedBranchIds = useMemo(
      () =>
        branchIds.filter(id => branchOptions.some(option => option.id === id)),
      [branchIds, branchOptions]
    );

    const activeBranchIds = useMemo(
      () =>
        selectedBranchIds.length > 0
          ? selectedBranchIds
          : branchOptions.map(option => option.id),
      [branchOptions, selectedBranchIds]
    );

    const counterOptions = useMemo<IReportSelectOption[]>(() => {
      if (!activeBranchIds.length) {
        return [];
      }
      if (isRestrictedUser) {
        return uniqueOptions(
          userAssignments
            .filter(assignment => activeBranchIds.includes(assignment.branchId))
            .map(assignment =>
              toOption(
                assignment.counterId,
                assignment.counterName || assignment.counterId
              )
            )
            .filter(option => Boolean(option.id))
        );
      }
      const allowed = new Set(
        branchProfiles
          .filter(branch => activeBranchIds.includes(branch.id))
          .flatMap(branch => branch.connectCounterIds ?? [])
      );
      return uniqueOptions(
        counterProfiles
          .filter(counter => allowed.has(counter.id))
          .map(counter =>
            toOption(counter.id, `${counter.counterNo} - ${counter.name}`)
          )
      );
    }, [
      activeBranchIds,
      branchProfiles,
      counterProfiles,
      isRestrictedUser,
      userAssignments,
    ]);

    const selectedCounterIds = useMemo(
      () =>
        counterIds.filter(id =>
          counterOptions.some(option => option.id === id)
        ),
      [counterIds, counterOptions]
    );

    const resetFilters = () => {
      setDateRange(buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH));
      setAccountingDate(
        buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH).endDate
      );
      setBranchIds([]);
      setCounterIds([]);
      setLayout(AfcReconciliationReportLayoutEnum.DETAIL);
      setScope(AfcReconciliationReportScopeEnum.BRANCH);
      setAppliedFilters(null);
      setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleView = () => {
      if (!dateRange.startDate || !dateRange.endDate || !accountingDate) {
        return;
      }
      const accessibleBranchIds = branchOptions.map(option => option.id);
      const effectiveBranchIds = isRestrictedUser
        ? selectedBranchIds.length
          ? selectedBranchIds
          : accessibleBranchIds
        : selectedBranchIds;
      const nextApplied = {
        dateRange,
        accountingDate,
        branchIds: effectiveBranchIds,
        counterIds: selectedCounterIds,
        layout,
        scope,
      };
      setAppliedFilters(nextApplied);
      setSearchParams(
        buildSearchParams(undefined, next => {
          setSearchParamValue(next, 'datePreset', dateRange.preset);
          setSearchParamValue(next, 'startDate', dateRange.startDate);
          setSearchParamValue(next, 'endDate', dateRange.endDate);
          setSearchParamValue(next, 'accountingDate', accountingDate);
          setSearchParamList(next, 'branchIds', effectiveBranchIds);
          setSearchParamList(next, 'counterIds', selectedCounterIds);
          setSearchParamValue(next, 'layout', layout);
          setSearchParamValue(next, 'scope', scope);
        }),
        { replace: true }
      );
    };

    return {
      dateRange,
      accountingDate,
      branchIds: selectedBranchIds,
      counterIds: selectedCounterIds,
      layout,
      scope,
      branchOptions,
      counterOptions,
      branchAllSelected:
        branchOptions.length > 0 &&
        selectedBranchIds.length === branchOptions.length,
      counterAllSelected:
        counterOptions.length > 0 &&
        selectedCounterIds.length === counterOptions.length,
      setDateRange,
      setAccountingDate,
      setLayout,
      setScope,
      toggleBranch: (id, checked) => {
        setBranchIds(current => toggleId(current, id, checked));
      },
      toggleAllBranches: checked => {
        setBranchIds(checked ? branchOptions.map(option => option.id) : []);
      },
      toggleCounter: (id, checked) => {
        setCounterIds(current => toggleId(current, id, checked));
      },
      toggleAllCounters: checked => {
        setCounterIds(checked ? counterOptions.map(option => option.id) : []);
      },
      resetFilters,
      handleView,
      appliedFilters,
      appliedDateRangeLabel: appliedFilters
        ? formatReportDateRangeLabel(appliedFilters.dateRange)
        : '',
      canView: Boolean(
        dateRange.startDate && dateRange.endDate && accountingDate
      ),
      layoutLabel: layoutLabel(appliedFilters?.layout ?? layout),
      scopeLabel: scopeLabel(appliedFilters?.scope ?? scope),
    };
  };
