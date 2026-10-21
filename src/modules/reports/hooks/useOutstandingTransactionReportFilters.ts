import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi, categoryOptionsApi, partyProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import {
  OUTSTANDING_TRANSACTION_REPORT_TEXT,
  OutstandingGroupingEnum,
  OutstandingPartySelectionEnum,
  OutstandingReportLayoutEnum,
  OutstandingTransactionSideEnum,
  type OutstandingGrouping,
  type OutstandingPartySelection,
  type OutstandingReportLayout,
  type OutstandingTransactionSide,
} from '../constants/outstandingTransactionReportConstants';
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

export interface OutstandingTransactionReportFiltersState {
  dateRange: IReportDateRange;
  accountingDate: string;
  partySelection: OutstandingPartySelection;
  entityTypeId: string;
  branchIds: string[];
  partyProfileIds: string[];
  transactionSide: OutstandingTransactionSide;
  includeInterest: boolean;
  includeInsurance: boolean;
  grouping: OutstandingGrouping;
  layout: OutstandingReportLayout;
  branchOptions: IReportSelectOption[];
  partyOptions: IReportSelectOption[];
  entityTypeOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  partyAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setAccountingDate: (value: string) => void;
  setPartySelection: (value: OutstandingPartySelection) => void;
  setEntityTypeId: (value: string) => void;
  setTransactionSide: (value: OutstandingTransactionSide) => void;
  setIncludeInterest: (value: boolean) => void;
  setIncludeInsurance: (value: boolean) => void;
  setGrouping: (value: OutstandingGrouping) => void;
  setLayout: (value: OutstandingReportLayout) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  toggleParty: (id: string, checked: boolean) => void;
  toggleAllParties: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    accountingDate: string;
    partySelection: OutstandingPartySelection;
    entityTypeId: string;
    branchIds: string[];
    partyProfileIds: string[];
    transactionSide: OutstandingTransactionSide;
    includeInterest: boolean;
    includeInsurance: boolean;
    grouping: OutstandingGrouping;
    layout: OutstandingReportLayout;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
  groupingLabel: string;
  layoutLabel: string;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const isMsmeText = (value: string) => /msme/i.test(value);

const parseSelection = (value: string): OutstandingPartySelection => {
  if (value === OutstandingPartySelectionEnum.MSME) {
    return OutstandingPartySelectionEnum.MSME;
  }
  if (value === OutstandingPartySelectionEnum.OTHERS) {
    return OutstandingPartySelectionEnum.OTHERS;
  }
  return OutstandingPartySelectionEnum.ALL;
};

const parseSide = (value: string): OutstandingTransactionSide => {
  if (value === OutstandingTransactionSideEnum.PURCHASE) {
    return OutstandingTransactionSideEnum.PURCHASE;
  }
  if (value === OutstandingTransactionSideEnum.SALE) {
    return OutstandingTransactionSideEnum.SALE;
  }
  return OutstandingTransactionSideEnum.BOTH;
};

const parseGrouping = (
  grouping: string,
  layout: string
): OutstandingGrouping => {
  if (
    grouping === OutstandingGroupingEnum.AGENT ||
    layout === OutstandingGroupingEnum.AGENT
  ) {
    return OutstandingGroupingEnum.AGENT;
  }
  return OutstandingGroupingEnum.CODE;
};

const parseLayout = (value: string): OutstandingReportLayout =>
  value === OutstandingReportLayoutEnum.SUMMARY
    ? OutstandingReportLayoutEnum.SUMMARY
    : OutstandingReportLayoutEnum.DETAIL;

const groupingLabel = (value: OutstandingGrouping) =>
  value === OutstandingGroupingEnum.AGENT
    ? OUTSTANDING_TRANSACTION_REPORT_TEXT.agentWise
    : OUTSTANDING_TRANSACTION_REPORT_TEXT.codeWise;

const layoutLabel = (value: OutstandingReportLayout) =>
  value === OutstandingReportLayoutEnum.SUMMARY
    ? OUTSTANDING_TRANSACTION_REPORT_TEXT.summary
    : OUTSTANDING_TRANSACTION_REPORT_TEXT.detail;

export const useOutstandingTransactionReportFilters =
  (): OutstandingTransactionReportFiltersState => {
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
        partySelection: parseSelection(
          readSearchParamValue(parsedSearchParams, 'partySelection')
        ),
        entityTypeId: readSearchParamValue(parsedSearchParams, 'entityTypeId'),
        branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
        partyProfileIds: readSearchParamList(
          parsedSearchParams,
          'partyProfileIds'
        ),
        transactionSide: parseSide(
          readSearchParamValue(parsedSearchParams, 'transactionSide')
        ),
        includeInterest:
          readSearchParamValue(parsedSearchParams, 'includeInterest') === 'true',
        includeInsurance:
          readSearchParamValue(parsedSearchParams, 'includeInsurance') ===
          'true',
        grouping: parseGrouping(
          readSearchParamValue(parsedSearchParams, 'grouping'),
          readSearchParamValue(parsedSearchParams, 'layout')
        ),
        layout: parseLayout(readSearchParamValue(parsedSearchParams, 'layout')),
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState(hydrated.dateRange);
    const [accountingDate, setAccountingDate] = useState(hydrated.accountingDate);
    const [partySelection, setPartySelectionState] = useState(
      hydrated.partySelection
    );
    const [entityTypeId, setEntityTypeIdState] = useState(hydrated.entityTypeId);
    const [branchIds, setBranchIds] = useState(hydrated.branchIds);
    const [partyProfileIds, setPartyProfileIds] = useState(
      hydrated.partyProfileIds
    );
    const [transactionSide, setTransactionSide] = useState(
      hydrated.transactionSide
    );
    const [includeInterest, setIncludeInterest] = useState(
      hydrated.includeInterest
    );
    const [includeInsurance, setIncludeInsurance] = useState(
      hydrated.includeInsurance
    );
    const [grouping, setGrouping] = useState(hydrated.grouping);
    const [layout, setLayout] = useState(hydrated.layout);
    const [appliedFilters, setAppliedFilters] = useState<
      OutstandingTransactionReportFiltersState['appliedFilters']
    >(searchParamsKey ? hydrated : null);

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-outstanding-branches'],
      queryFn: async () =>
        branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
    });
    const { data: entityTypes = [] } = useQuery({
      queryKey: ['reports-outstanding-entity-types'],
      queryFn: async () =>
        categoryOptionsApi.getCategoryOptionsByCode(
          CategoryOptionCodeEnum.EntityType
        ),
    });
    const { data: partyProfiles = [] } = useQuery({
      queryKey: ['reports-outstanding-parties'],
      queryFn: async () =>
        partyProfileApi.getAllPartyProfiles({ activeOnly: true }),
    });

    const branchOptions = useMemo<IReportSelectOption[]>(() => {
      const accessible = isRestrictedUser
        ? branchProfiles.filter(branch =>
            userAssignments.some(
              assignment => assignment.branchId === branch.id
            )
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

    const entityTypeOptions = useMemo<IReportSelectOption[]>(() => {
      const matching = entityTypes.filter(option => {
        const text = `${option.code} ${option.label} ${option.value}`;
        if (partySelection === OutstandingPartySelectionEnum.MSME) {
          return isMsmeText(text);
        }
        if (partySelection === OutstandingPartySelectionEnum.OTHERS) {
          return !isMsmeText(text);
        }
        return true;
      });
      return uniqueOptions(
        matching.map(option =>
          toOption(
            option.id,
            option.label || option.value || option.code
          )
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
              partySelection === OutstandingPartySelectionEnum.MSME &&
              !isMsmeText(entityText)
            ) {
              return false;
            }
            if (
              partySelection === OutstandingPartySelectionEnum.OTHERS &&
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
                  branchLinks?: Array<{ branchId?: string; branch?: { id?: string } }>;
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
    }, [
      partyProfiles,
      partySelection,
      selectedBranchIds,
      selectedEntityTypeId,
    ]);

    const selectedPartyIds = useMemo(
      () =>
        partyProfileIds.filter(id =>
          partyOptions.some(option => option.id === id)
        ),
      [partyOptions, partyProfileIds]
    );

    const resetFilters = () => {
      const nextRange = buildReportDateRange(ReportDatePresetEnum.CURRENT_MONTH);
      setDateRange(nextRange);
      setAccountingDate(nextRange.endDate);
      setPartySelectionState(OutstandingPartySelectionEnum.ALL);
      setEntityTypeIdState('');
      setBranchIds([]);
      setPartyProfileIds([]);
      setTransactionSide(OutstandingTransactionSideEnum.BOTH);
      setIncludeInterest(false);
      setIncludeInsurance(false);
      setGrouping(OutstandingGroupingEnum.CODE);
      setLayout(OutstandingReportLayoutEnum.DETAIL);
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
        partySelection,
        entityTypeId: selectedEntityTypeId,
        branchIds: effectiveBranchIds,
        partyProfileIds: selectedPartyIds,
        transactionSide,
        includeInterest,
        includeInsurance,
        grouping,
        layout,
      };
      setAppliedFilters(nextApplied);
      setSearchParams(
        buildSearchParams(undefined, next => {
          setSearchParamValue(next, 'datePreset', dateRange.preset);
          setSearchParamValue(next, 'startDate', dateRange.startDate);
          setSearchParamValue(next, 'endDate', dateRange.endDate);
          setSearchParamValue(next, 'accountingDate', accountingDate);
          setSearchParamValue(next, 'partySelection', partySelection);
          setSearchParamValue(next, 'entityTypeId', selectedEntityTypeId);
          setSearchParamList(next, 'branchIds', effectiveBranchIds);
          setSearchParamList(next, 'partyProfileIds', selectedPartyIds);
          setSearchParamValue(next, 'transactionSide', transactionSide);
          setSearchParamValue(
            next,
            'includeInterest',
            includeInterest ? 'true' : ''
          );
          setSearchParamValue(
            next,
            'includeInsurance',
            includeInsurance ? 'true' : ''
          );
          setSearchParamValue(next, 'grouping', grouping);
          setSearchParamValue(next, 'layout', layout);
        }),
        { replace: true }
      );
    };

    return {
      dateRange,
      accountingDate,
      partySelection,
      entityTypeId: selectedEntityTypeId,
      branchIds: selectedBranchIds,
      partyProfileIds: selectedPartyIds,
      transactionSide,
      includeInterest,
      includeInsurance,
      grouping,
      layout,
      branchOptions,
      partyOptions,
      entityTypeOptions,
      branchAllSelected:
        branchOptions.length > 0 &&
        selectedBranchIds.length === branchOptions.length,
      partyAllSelected:
        partyOptions.length > 0 &&
        selectedPartyIds.length === partyOptions.length,
      setDateRange,
      setAccountingDate,
      setPartySelection: setPartySelectionState,
      setEntityTypeId: setEntityTypeIdState,
      setTransactionSide,
      setIncludeInterest,
      setIncludeInsurance,
      setGrouping,
      setLayout,
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
        setPartyProfileIds(
          checked ? partyOptions.map(option => option.id) : []
        );
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
      groupingLabel: groupingLabel(appliedFilters?.grouping ?? grouping),
      layoutLabel: layoutLabel(appliedFilters?.layout ?? layout),
    };
  };
