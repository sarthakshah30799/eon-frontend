import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  accountProfileApi,
  branchProfileApi,
  categoryOptionsApi,
  partyProfileApi,
} from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import {
  AGEING_BUCKET_OPTIONS,
  AGEING_REPORT_TEXT,
  AgeingEefcFilterEnum,
  AgeingPartySelectionEnum,
  AgeingReportLayoutEnum,
  AgeingScopeEnum,
  AgeingTransactionSideEnum,
  type AgeingEefcFilter,
  type AgeingPartySelection,
  type AgeingReportLayout,
  type AgeingScope,
  type AgeingTransactionSide,
} from '../constants/ageingReportConstants';
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

export interface AgeingReportFiltersState {
  dateRange: IReportDateRange;
  partySelection: AgeingPartySelection;
  entityTypeId: string;
  branchIds: string[];
  partyProfileIds: string[];
  accountIds: string[];
  ageingBuckets: string[];
  transactionSide: AgeingTransactionSide;
  layout: AgeingReportLayout;
  eefcFilter: AgeingEefcFilter;
  scope: AgeingScope;
  branchOptions: IReportSelectOption[];
  partyOptions: IReportSelectOption[];
  accountOptions: IReportSelectOption[];
  entityTypeOptions: IReportSelectOption[];
  ageingOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  partyAllSelected: boolean;
  accountAllSelected: boolean;
  ageingAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setPartySelection: (value: AgeingPartySelection) => void;
  setEntityTypeId: (value: string) => void;
  setTransactionSide: (value: AgeingTransactionSide) => void;
  setLayout: (value: AgeingReportLayout) => void;
  setEefcFilter: (value: AgeingEefcFilter) => void;
  setScope: (value: AgeingScope) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleParty: (id: string, checked: boolean) => void;
  toggleAllParties: (checked: boolean) => void;
  toggleAccount: (id: string, checked: boolean) => void;
  toggleAllAccounts: (checked: boolean) => void;
  toggleAgeingBucket: (id: string, checked: boolean) => void;
  toggleAllAgeingBuckets: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    partySelection: AgeingPartySelection;
    entityTypeId: string;
    branchIds: string[];
    partyProfileIds: string[];
    accountIds: string[];
    ageingBuckets: string[];
    transactionSide: AgeingTransactionSide;
    layout: AgeingReportLayout;
    eefcFilter: AgeingEefcFilter;
    scope: AgeingScope;
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

const isMsmeText = (value: string) => /msme/i.test(value);

const parseSelection = (value: string): AgeingPartySelection => {
  if (value === AgeingPartySelectionEnum.MSME) {
    return AgeingPartySelectionEnum.MSME;
  }
  if (value === AgeingPartySelectionEnum.OTHERS) {
    return AgeingPartySelectionEnum.OTHERS;
  }
  return AgeingPartySelectionEnum.ALL;
};

const parseSide = (value: string): AgeingTransactionSide => {
  if (value === AgeingTransactionSideEnum.PURCHASE) {
    return AgeingTransactionSideEnum.PURCHASE;
  }
  if (value === AgeingTransactionSideEnum.SALE) {
    return AgeingTransactionSideEnum.SALE;
  }
  return AgeingTransactionSideEnum.BOTH;
};

const parseLayout = (value: string): AgeingReportLayout =>
  value === AgeingReportLayoutEnum.SUMMARY
    ? AgeingReportLayoutEnum.SUMMARY
    : AgeingReportLayoutEnum.DETAIL;

const parseEefc = (value: string): AgeingEefcFilter => {
  if (value === AgeingEefcFilterEnum.EEFC) {
    return AgeingEefcFilterEnum.EEFC;
  }
  if (value === AgeingEefcFilterEnum.NON_EEFC) {
    return AgeingEefcFilterEnum.NON_EEFC;
  }
  return AgeingEefcFilterEnum.ALL;
};

const parseScope = (value: string): AgeingScope =>
  value === AgeingScopeEnum.CONSOLIDATED
    ? AgeingScopeEnum.CONSOLIDATED
    : AgeingScopeEnum.BRANCH;

const layoutLabel = (value: AgeingReportLayout) =>
  value === AgeingReportLayoutEnum.SUMMARY
    ? AGEING_REPORT_TEXT.summary
    : AGEING_REPORT_TEXT.detail;

const scopeLabel = (value: AgeingScope) =>
  value === AgeingScopeEnum.CONSOLIDATED
    ? AGEING_REPORT_TEXT.consolidated
    : AGEING_REPORT_TEXT.branchScope;

const AGEING_BUCKET_IDS = AGEING_BUCKET_OPTIONS.map(option => option.id);

export const useAgeingReportFilters = (): AgeingReportFiltersState => {
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
      partySelection: parseSelection(
        readSearchParamValue(parsedSearchParams, 'partySelection')
      ),
      entityTypeId: readSearchParamValue(parsedSearchParams, 'entityTypeId'),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      partyProfileIds: readSearchParamList(
        parsedSearchParams,
        'partyProfileIds'
      ),
      accountIds: readSearchParamList(parsedSearchParams, 'accountIds'),
      ageingBuckets: readSearchParamList(
        parsedSearchParams,
        'ageingBuckets'
      ).filter(id =>
        AGEING_BUCKET_IDS.includes(id as (typeof AGEING_BUCKET_IDS)[number])
      ),
      transactionSide: parseSide(
        readSearchParamValue(parsedSearchParams, 'transactionSide')
      ),
      layout: parseLayout(readSearchParamValue(parsedSearchParams, 'layout')),
      eefcFilter: parseEefc(
        readSearchParamValue(parsedSearchParams, 'eefcFilter')
      ),
      scope: parseScope(readSearchParamValue(parsedSearchParams, 'scope')),
    };
  }, [parsedSearchParams]);

  const [dateRange, setDateRange] = useState(hydrated.dateRange);
  const [partySelection, setPartySelection] = useState(hydrated.partySelection);
  const [entityTypeId, setEntityTypeIdState] = useState(hydrated.entityTypeId);
  const [branchIds, setBranchIds] = useState(hydrated.branchIds);
  const [partyProfileIds, setPartyProfileIds] = useState(
    hydrated.partyProfileIds
  );
  const [accountIds, setAccountIds] = useState(hydrated.accountIds);
  const [ageingBuckets, setAgeingBuckets] = useState(hydrated.ageingBuckets);
  const [transactionSide, setTransactionSide] = useState(
    hydrated.transactionSide
  );
  const [layout, setLayout] = useState(hydrated.layout);
  const [eefcFilter, setEefcFilter] = useState(hydrated.eefcFilter);
  const [scope, setScope] = useState(hydrated.scope);
  const [appliedFilters, setAppliedFilters] = useState<
    AgeingReportFiltersState['appliedFilters']
  >(searchParamsKey ? hydrated : null);

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-ageing-branches'],
    queryFn: async () =>
      branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const { data: entityTypes = [] } = useQuery({
    queryKey: ['reports-ageing-entity-types'],
    queryFn: async () =>
      categoryOptionsApi.getCategoryOptionsByCode(
        CategoryOptionCodeEnum.EntityType
      ),
  });
  const { data: partyProfiles = [] } = useQuery({
    queryKey: ['reports-ageing-parties'],
    queryFn: async () =>
      partyProfileApi.getAllPartyProfiles({ activeOnly: true }),
  });
  const { data: accountProfiles = [] } = useQuery({
    queryKey: ['reports-ageing-accounts'],
    queryFn: async () =>
      accountProfileApi.getAllAccountProfiles({ active: true }),
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

  const accountOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        accountProfiles.map(account =>
          toOption(
            account.id,
            buildReportOptionLabel(account.accountCode, account.accountName)
          )
        )
      ),
    [accountProfiles]
  );

  const selectedBranchIds = useMemo(
    () => branchIds.filter(id => branchOptions.some(option => option.id === id)),
    [branchIds, branchOptions]
  );
  const selectedAccountIds = useMemo(
    () =>
      accountIds.filter(id => accountOptions.some(option => option.id === id)),
    [accountIds, accountOptions]
  );

  const entityTypeOptions = useMemo<IReportSelectOption[]>(() => {
    const matching = entityTypes.filter(option => {
      const text = `${option.code} ${option.label} ${option.value}`;
      if (partySelection === AgeingPartySelectionEnum.MSME) {
        return isMsmeText(text);
      }
      if (partySelection === AgeingPartySelectionEnum.OTHERS) {
        return !isMsmeText(text);
      }
      return true;
    });
    return uniqueOptions(
      matching.map(option =>
        toOption(option.id, option.label || option.value || option.code)
      )
    );
  }, [entityTypes, partySelection]);

  const selectedEntityTypeId = entityTypeOptions.some(
    option => option.id === entityTypeId
  )
    ? entityTypeId
    : '';

  const partyOptions = useMemo<IReportSelectOption[]>(() => {
    const branchSet = new Set(selectedBranchIds);
    return uniqueOptions(
      partyProfiles
        .filter(party => {
          const entityText = `${party.entityType?.code ?? ''} ${party.entityType?.label ?? ''} ${party.entityType?.value ?? ''}`;
          if (
            partySelection === AgeingPartySelectionEnum.MSME &&
            !isMsmeText(entityText)
          ) {
            return false;
          }
          if (
            partySelection === AgeingPartySelectionEnum.OTHERS &&
            isMsmeText(entityText)
          ) {
            return false;
          }
          if (
            selectedEntityTypeId &&
            party.entityType?.id !== selectedEntityTypeId
          ) {
            return false;
          }
          if (!selectedBranchIds.length) {
            return true;
          }
          const links =
            (
              party as {
                branchLinks?: Array<{
                  branchId?: string;
                  branch?: { id?: string };
                }>;
              }
            ).branchLinks ?? [];
          if (!links.length) {
            return true;
          }
          return links.some(
            link =>
              branchSet.has(link.branchId ?? '') ||
              branchSet.has(link.branch?.id ?? '')
          );
        })
        .map(party =>
          toOption(party.id, buildReportOptionLabel(party.code, party.name))
        )
    );
  }, [partyProfiles, partySelection, selectedBranchIds, selectedEntityTypeId]);

  const selectedPartyIds = useMemo(
    () =>
      partyProfileIds.filter(id =>
        partyOptions.some(option => option.id === id)
      ),
    [partyOptions, partyProfileIds]
  );
  const selectedBuckets = useMemo(
    () =>
      ageingBuckets.filter(id =>
        AGEING_BUCKET_IDS.includes(id as (typeof AGEING_BUCKET_IDS)[number])
      ),
    [ageingBuckets]
  );
  const ageingOptions = AGEING_BUCKET_OPTIONS.map(option =>
    toOption(option.id, option.label)
  );

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH));
    setPartySelection(AgeingPartySelectionEnum.ALL);
    setEntityTypeIdState('');
    setBranchIds([]);
    setPartyProfileIds([]);
    setAccountIds([]);
    setAgeingBuckets([]);
    setTransactionSide(AgeingTransactionSideEnum.BOTH);
    setLayout(AgeingReportLayoutEnum.DETAIL);
    setEefcFilter(AgeingEefcFilterEnum.ALL);
    setScope(AgeingScopeEnum.BRANCH);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleView = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
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
      partySelection,
      entityTypeId: selectedEntityTypeId,
      branchIds: effectiveBranchIds,
      partyProfileIds: selectedPartyIds,
      accountIds: selectedAccountIds,
      ageingBuckets: selectedBuckets,
      transactionSide,
      layout,
      eefcFilter,
      scope,
    };
    setAppliedFilters(nextApplied);
    setSearchParams(
      buildSearchParams(undefined, next => {
        setSearchParamValue(next, 'datePreset', dateRange.preset);
        setSearchParamValue(next, 'startDate', dateRange.startDate);
        setSearchParamValue(next, 'endDate', dateRange.endDate);
        setSearchParamValue(next, 'partySelection', partySelection);
        setSearchParamValue(next, 'entityTypeId', selectedEntityTypeId);
        setSearchParamList(next, 'branchIds', effectiveBranchIds);
        setSearchParamList(next, 'partyProfileIds', selectedPartyIds);
        setSearchParamList(next, 'accountIds', selectedAccountIds);
        setSearchParamList(next, 'ageingBuckets', selectedBuckets);
        setSearchParamValue(next, 'transactionSide', transactionSide);
        setSearchParamValue(next, 'layout', layout);
        setSearchParamValue(next, 'eefcFilter', eefcFilter);
        setSearchParamValue(next, 'scope', scope);
      }),
      { replace: true }
    );
  };

  return {
    dateRange,
    partySelection,
    entityTypeId: selectedEntityTypeId,
    branchIds: selectedBranchIds,
    partyProfileIds: selectedPartyIds,
    accountIds: selectedAccountIds,
    ageingBuckets: selectedBuckets,
    transactionSide,
    layout,
    eefcFilter,
    scope,
    branchOptions,
    partyOptions,
    accountOptions,
    entityTypeOptions,
    ageingOptions,
    branchAllSelected:
      branchOptions.length > 0 &&
      selectedBranchIds.length === branchOptions.length,
    partyAllSelected:
      partyOptions.length > 0 && selectedPartyIds.length === partyOptions.length,
    accountAllSelected:
      accountOptions.length > 0 &&
      selectedAccountIds.length === accountOptions.length,
    ageingAllSelected:
      ageingOptions.length > 0 &&
      selectedBuckets.length === ageingOptions.length,
    setDateRange,
    setPartySelection,
    setEntityTypeId: setEntityTypeIdState,
    setTransactionSide,
    setLayout,
    setEefcFilter,
    setScope,
    toggleBranch: (id, checked) => {
      setBranchIds(current => toggleId(current, id, checked));
    },
    toggleAllBranches: checked => {
      setBranchIds(checked ? branchOptions.map(option => option.id) : []);
    },
    toggleParty: (id, checked) => {
      setPartyProfileIds(current => toggleId(current, id, checked));
    },
    toggleAllParties: checked => {
      setPartyProfileIds(checked ? partyOptions.map(option => option.id) : []);
    },
    toggleAccount: (id, checked) => {
      setAccountIds(current => toggleId(current, id, checked));
    },
    toggleAllAccounts: checked => {
      setAccountIds(checked ? accountOptions.map(option => option.id) : []);
    },
    toggleAgeingBucket: (id, checked) => {
      setAgeingBuckets(current => toggleId(current, id, checked));
    },
    toggleAllAgeingBuckets: checked => {
      setAgeingBuckets(checked ? ageingOptions.map(option => option.id) : []);
    },
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel: appliedFilters
      ? formatReportDateRangeLabel(appliedFilters.dateRange)
      : '',
    canView: Boolean(dateRange.startDate && dateRange.endDate),
    layoutLabel: layoutLabel(appliedFilters?.layout ?? layout),
    scopeLabel: scopeLabel(appliedFilters?.scope ?? scope),
  };
};
