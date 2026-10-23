import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { branchProfileApi, partyProfileApi, productProfileApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types/partyProfileTypes';
import { TT_PRODUCT_CODE } from '../constants/ttReportConstants';
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
  readSearchParamBoolean,
  readSearchParamList,
  readSearchParamValue,
  setSearchParamList,
  setSearchParamValue,
} from '../utils/reportSearchParams';

export interface TtReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  branchOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  productId: string;
  productOptions: IReportSelectOption[];
  issuerPartyProfileIds: string[];
  issuerOptions: IReportSelectOption[];
  issuerAllSelected: boolean;
  blockAfterGenerate: boolean;
  showBlocked: boolean;
  showBeforeHoAcceptance: boolean;
  setDateRange: (value: IReportDateRange) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  setProductId: (value: string) => void;
  toggleIssuer: (id: string, checked: boolean) => void;
  toggleAllIssuers: (checked: boolean) => void;
  setBlockAfterGenerate: (checked: boolean) => void;
  setShowBlocked: (checked: boolean) => void;
  setShowBeforeHoAcceptance: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    productId: string;
    issuerPartyProfileIds: string[];
    blockAfterGenerate: boolean;
    showBlocked: boolean;
    showBeforeHoAcceptance: boolean;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const uniqueIssuerIds = (ids: string[], legacyId: string) =>
  [...new Set([...ids, legacyId].map(id => id.trim()).filter(Boolean))];

const TT_ISSUER_PATTERNS = [/INDUSTT/i, /ICICI\s*TT/i, /IDFC\s*TT/i, /YES\s*TT/i];

export const useTtReportFilters = (
  issuerPattern?: RegExp
): TtReportFiltersState => {
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
  const hydratedRouteState = useMemo(
    () => ({
      dateRange: readDateRangeSearchParams(
        parsedSearchParams,
        ReportDatePresetEnum.TODAY
      ),
      branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
      productId: readSearchParamValue(parsedSearchParams, 'productId'),
      issuerPartyProfileIds: uniqueIssuerIds(
        readSearchParamList(parsedSearchParams, 'issuerPartyProfileIds'),
        readSearchParamValue(parsedSearchParams, 'issuerPartyProfileId')
      ),
      blockAfterGenerate: readSearchParamBoolean(
        parsedSearchParams,
        'blockAfterGenerate'
      ),
      showBlocked: readSearchParamBoolean(parsedSearchParams, 'showBlocked'),
      showBeforeHoAcceptance: readSearchParamBoolean(
        parsedSearchParams,
        'showBeforeHoAcceptance'
      ),
    }),
    [parsedSearchParams]
  );

  const [dateRange, setDateRange] = useState<IReportDateRange>(
    hydratedRouteState.dateRange
  );
  const [branchIds, setBranchIds] = useState<string[]>(
    hydratedRouteState.branchIds
  );
  const [productId, setProductId] = useState(hydratedRouteState.productId);
  const [issuerPartyProfileIds, setIssuerPartyProfileIds] = useState<string[]>(
    hydratedRouteState.issuerPartyProfileIds
  );
  const [blockAfterGenerate, setBlockAfterGenerate] = useState(
    hydratedRouteState.blockAfterGenerate
  );
  const [showBlocked, setShowBlocked] = useState(hydratedRouteState.showBlocked);
  const [showBeforeHoAcceptance, setShowBeforeHoAcceptance] = useState(
    hydratedRouteState.showBeforeHoAcceptance
  );
  const [appliedFilters, setAppliedFilters] = useState<
    TtReportFiltersState['appliedFilters']
  >(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
          productId: hydratedRouteState.productId,
          issuerPartyProfileIds: hydratedRouteState.issuerPartyProfileIds,
          blockAfterGenerate: hydratedRouteState.blockAfterGenerate,
          showBlocked: hydratedRouteState.showBlocked,
          showBeforeHoAcceptance: hydratedRouteState.showBeforeHoAcceptance,
        }
      : null
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-tt-branch-profiles'],
    queryFn: async () =>
      branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });
  const { data: productProfiles = [] } = useQuery({
    queryKey: ['reports-tt-products'],
    queryFn: async () =>
      productProfileApi.getAllProductProfiles({ activeOnly: true }),
  });
  const { data: issuers = [] } = useQuery({
    queryKey: ['reports-tt-issuers'],
    queryFn: () =>
      partyProfileApi.getAllPartyProfiles(
        { activeOnly: true },
        PartyProfileTypeEnum.CARD_ISSUER_PROFILE
      ),
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

  const ttProducts = useMemo(
    () =>
      productProfiles.filter(
        product =>
          String(product.productCode ?? '')
            .trim()
            .toUpperCase() === TT_PRODUCT_CODE
      ),
    [productProfiles]
  );
  const productOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        ttProducts.map(product =>
          toOption(
            product.id,
            buildReportOptionLabel(product.productCode, product.productDescription)
          )
        )
      ),
    [ttProducts]
  );
  const selectedProductId = productOptions.some(option => option.id === productId)
    ? productId
    : (productOptions[0]?.id ?? '');

  const issuerOptions = useMemo<IReportSelectOption[]>(() => {
    const linkedIds = new Set(
      ttProducts.flatMap(product => product.issuerProfileIds ?? [])
    );
    const linked = linkedIds.size
      ? issuers.filter(issuer => linkedIds.has(issuer.id))
      : issuers.filter(issuer => {
          const label = `${issuer.code ?? ''} ${issuer.name ?? ''}`;
          return TT_ISSUER_PATTERNS.some(pattern => pattern.test(label));
        });
    const options = uniqueOptions(
      linked.map(issuer =>
        toOption(issuer.id, buildReportOptionLabel(issuer.code, issuer.name))
      )
    );
    if (!issuerPattern) {
      return options;
    }
    const matched = options.filter(option => issuerPattern.test(option.label));
    return matched.length ? matched : options;
  }, [issuerPattern, issuers, ttProducts]);
  const selectedIssuerIds = useMemo(
    () =>
      issuerPartyProfileIds.filter(issuerId =>
        issuerOptions.some(option => option.id === issuerId)
      ),
    [issuerOptions, issuerPartyProfileIds]
  );
  const issuerAllSelected =
    issuerOptions.length > 0 &&
    selectedIssuerIds.length === issuerOptions.length;

  const selectedBranchIds = useMemo(
    () =>
      branchIds.filter(branchId =>
        branchOptions.some(option => option.id === branchId)
      ),
    [branchIds, branchOptions]
  );
  const branchAllSelected =
    branchOptions.length > 0 &&
    selectedBranchIds.length === branchOptions.length;

  const resetFilters = () => {
    setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
    setBranchIds([]);
    setProductId(productOptions[0]?.id ?? '');
    setIssuerPartyProfileIds([]);
    setBlockAfterGenerate(false);
    setShowBlocked(false);
    setShowBeforeHoAcceptance(false);
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
    setAppliedFilters({
      dateRange,
      branchIds: effectiveBranchIds,
      productId: selectedProductId,
      issuerPartyProfileIds: selectedIssuerIds,
      blockAfterGenerate,
      showBlocked,
      showBeforeHoAcceptance,
    });
    setSearchParams(
      buildSearchParams(undefined, next => {
        setSearchParamValue(next, 'datePreset', dateRange.preset);
        setSearchParamValue(next, 'startDate', dateRange.startDate);
        setSearchParamValue(next, 'endDate', dateRange.endDate);
        setSearchParamList(next, 'branchIds', effectiveBranchIds);
        setSearchParamValue(next, 'productId', selectedProductId);
        setSearchParamList(next, 'issuerPartyProfileIds', selectedIssuerIds);
        setSearchParamValue(
          next,
          'blockAfterGenerate',
          blockAfterGenerate ? 'true' : ''
        );
        setSearchParamValue(next, 'showBlocked', showBlocked ? 'true' : '');
        setSearchParamValue(
          next,
          'showBeforeHoAcceptance',
          showBeforeHoAcceptance ? 'true' : ''
        );
      }),
      { replace: true }
    );
  };

  return {
    dateRange,
    branchIds: selectedBranchIds,
    branchOptions,
    branchAllSelected,
    productId: selectedProductId,
    productOptions,
    issuerPartyProfileIds: selectedIssuerIds,
    issuerOptions,
    issuerAllSelected,
    blockAfterGenerate,
    showBlocked,
    showBeforeHoAcceptance,
    setDateRange,
    toggleBranch: (id, checked) => {
      setBranchIds(current => toggleId(current, id, checked));
    },
    toggleAllBranches: checked => {
      setBranchIds(checked ? branchOptions.map(option => option.id) : []);
    },
    setProductId,
    toggleIssuer: (id, checked) => {
      setIssuerPartyProfileIds(current => toggleId(current, id, checked));
    },
    toggleAllIssuers: checked => {
      setIssuerPartyProfileIds(
        checked ? issuerOptions.map(option => option.id) : []
      );
    },
    setBlockAfterGenerate,
    setShowBlocked,
    setShowBeforeHoAcceptance,
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel: appliedFilters
      ? formatReportDateRangeLabel(appliedFilters.dateRange)
      : '',
    canView: Boolean(dateRange.startDate && dateRange.endDate),
  };
};
