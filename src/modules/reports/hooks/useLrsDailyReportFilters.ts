import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  branchProfileApi,
  partyProfileApi,
  productProfileApi,
  purposeApi,
} from '@/api';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types';
import {
  buildReportDateRange,
  formatReportDateRangeLabel,
  buildReportOptionLabel,
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
  setSearchParamBoolean,
  readSearchParamBoolean,
} from '../utils/reportSearchParams';
import { LRS_DAILY_REPORT_TEXT } from '../constants/lrsDailyReportConstants';
import {
  LrsDailyReportFormatEnum,
  ReportDatePresetEnum,
  type IReportDateRange,
  type IReportSelectOption,
  type LrsDailyReportFormat,
} from '../types';

export interface LrsDailyReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  productId: string;
  issuerPartyProfileId: string;
  purposeId: string;
  usdRate: string;
  reportFormat: LrsDailyReportFormat;
  bankName: string;
  bankCode: string;
  showTourPaxBreakup: boolean;
  includeCorporateTransactions: boolean;
  branchOptions: IReportSelectOption[];
  productOptions: IReportSelectOption[];
  issuerOptions: IReportSelectOption[];
  purposeOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  isLoadingProducts: boolean;
  isLoadingIssuers: boolean;
  isLoadingPurposes: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setProductId: (value: string) => void;
  setIssuerPartyProfileId: (value: string) => void;
  setPurposeId: (value: string) => void;
  setUsdRate: (value: string) => void;
  setReportFormat: (value: LrsDailyReportFormat) => void;
  setBankName: (value: string) => void;
  setBankCode: (value: string) => void;
  setShowTourPaxBreakup: (value: boolean) => void;
  setIncludeCorporateTransactions: (value: boolean) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    productId: string;
    issuerPartyProfileId: string;
    purposeId: string;
    usdRate: string;
    reportFormat: LrsDailyReportFormat;
    bankName: string;
    bankCode: string;
    showTourPaxBreakup: boolean;
    includeCorporateTransactions: boolean;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({
  id,
  label,
});

const parseReportFormat = (value: string): LrsDailyReportFormat =>
  value === LrsDailyReportFormatEnum.CIMS_UPLOAD
    ? LrsDailyReportFormatEnum.CIMS_UPLOAD
    : LrsDailyReportFormatEnum.CIMS;

const isPositiveRate = (value: string) => {
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0;
};

export const useLrsDailyReportFilters = (): LrsDailyReportFiltersState => {
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
      issuerPartyProfileId: readSearchParamValue(
        parsedSearchParams,
        'issuerPartyProfileId'
      ),
      purposeId: readSearchParamValue(parsedSearchParams, 'purposeId'),
      usdRate: readSearchParamValue(parsedSearchParams, 'usdRate'),
      reportFormat: parseReportFormat(
        readSearchParamValue(parsedSearchParams, 'reportFormat')
      ),
      bankName: readSearchParamValue(parsedSearchParams, 'bankName'),
      bankCode: readSearchParamValue(parsedSearchParams, 'bankCode'),
      showTourPaxBreakup: readSearchParamBoolean(
        parsedSearchParams,
        'showTourPaxBreakup'
      ),
      includeCorporateTransactions: readSearchParamBoolean(
        parsedSearchParams,
        'includeCorporateTransactions'
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
  const [productId, setProductIdState] = useState(hydratedRouteState.productId);
  const [issuerPartyProfileId, setIssuerPartyProfileId] = useState(
    hydratedRouteState.issuerPartyProfileId
  );
  const [purposeId, setPurposeId] = useState(hydratedRouteState.purposeId);
  const [usdRate, setUsdRate] = useState(hydratedRouteState.usdRate);
  const [reportFormat, setReportFormat] = useState<LrsDailyReportFormat>(
    hydratedRouteState.reportFormat
  );
  const [bankName, setBankName] = useState(hydratedRouteState.bankName);
  const [bankCode, setBankCode] = useState(hydratedRouteState.bankCode);
  const [showTourPaxBreakup, setShowTourPaxBreakup] = useState(
    hydratedRouteState.showTourPaxBreakup
  );
  const [includeCorporateTransactions, setIncludeCorporateTransactions] =
    useState(hydratedRouteState.includeCorporateTransactions);
  const [appliedFilters, setAppliedFilters] = useState<
    LrsDailyReportFiltersState['appliedFilters']
  >(
    searchParamsKey
      ? {
          dateRange: hydratedRouteState.dateRange,
          branchIds: hydratedRouteState.branchIds,
          productId: hydratedRouteState.productId,
          issuerPartyProfileId: hydratedRouteState.issuerPartyProfileId,
          purposeId: hydratedRouteState.purposeId,
          usdRate: hydratedRouteState.usdRate,
          reportFormat: hydratedRouteState.reportFormat,
          bankName: hydratedRouteState.bankName,
          bankCode: hydratedRouteState.bankCode,
          showTourPaxBreakup: hydratedRouteState.showTourPaxBreakup,
          includeCorporateTransactions:
            hydratedRouteState.includeCorporateTransactions,
        }
      : null
  );

  const { data: branchProfiles = [] } = useQuery({
    queryKey: ['reports-lrs-branch-profiles'],
    queryFn: async () =>
      branchProfileApi.getAllBranchProfiles({
        activeOnly: true,
      }),
  });

  const { data: productProfiles = [], isLoading: isLoadingProducts } = useQuery(
    {
      queryKey: ['reports-lrs-product-profiles'],
      queryFn: async () =>
        productProfileApi.getAllProductProfiles({ activeOnly: true }),
    }
  );

  const { data: issuerProfiles = [], isLoading: isLoadingIssuers } = useQuery({
    queryKey: ['reports-lrs-card-issuers'],
    queryFn: async () =>
      partyProfileApi.getAllPartyProfiles(
        { activeOnly: true },
        PartyProfileTypeEnum.CARD_ISSUER_PROFILE
      ),
  });

  const { data: purposes = [], isLoading: isLoadingPurposes } = useQuery({
    queryKey: ['reports-lrs-purposes', true],
    queryFn: async () => purposeApi.getAllPurposes({ hasRbiCode: true }),
  });

  const accessibleBranchProfiles = useMemo(
    () =>
      isRestrictedUser
        ? branchProfiles.filter(branch =>
            userAssignments.some(
              assignment => assignment.branchId === branch.id
            )
          )
        : branchProfiles,
    [branchProfiles, isRestrictedUser, userAssignments]
  );

  const branchOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        accessibleBranchProfiles.map(branch =>
          toOption(branch.id, buildReportOptionLabel(branch.code, branch.name))
        )
      ),
    [accessibleBranchProfiles]
  );

  const eligibleProducts = useMemo(
    () =>
      productProfiles.filter(
        product =>
          product.isActiveProduct &&
          product.availableInRetailSelling &&
          !product.allowProductCancellation
      ),
    [productProfiles]
  );

  const productOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        eligibleProducts.map(product =>
          toOption(
            product.id,
            buildReportOptionLabel(
              product.productCode,
              product.productDescription
            )
          )
        )
      ),
    [eligibleProducts]
  );

  const issuerOptions = useMemo<IReportSelectOption[]>(() => {
    const selectedProduct = eligibleProducts.find(
      product => product.id === productId
    );
    const linkedIds = selectedProduct?.issuerProfileIds ?? [];
    const visibleIssuers = selectedProduct
      ? issuerProfiles.filter(issuer => linkedIds.includes(issuer.id))
      : issuerProfiles;

    return uniqueOptions(
      visibleIssuers.map(issuer =>
        toOption(issuer.id, buildReportOptionLabel(issuer.code, issuer.name))
      )
    );
  }, [eligibleProducts, issuerProfiles, productId]);

  const purposeOptions = useMemo<IReportSelectOption[]>(
    () =>
      uniqueOptions(
        purposes
          .filter(purpose => String(purpose.rbiCode ?? '').trim())
          .map(purpose =>
            toOption(purpose.id, purpose.description.trim() || '-')
          )
      ),
    [purposes]
  );

  const selectedBranchIds = useMemo(
    () =>
      branchIds.filter(branchId =>
        branchOptions.some(option => option.id === branchId)
      ),
    [branchIds, branchOptions]
  );
  const selectedProductId = productOptions.some(
    option => option.id === productId
  )
    ? productId
    : '';
  const selectedIssuerId = issuerOptions.some(
    option => option.id === issuerPartyProfileId
  )
    ? issuerPartyProfileId
    : '';
  const selectedPurposeId = purposeOptions.some(
    option => option.id === purposeId
  )
    ? purposeId
    : '';

  const branchAllSelected =
    branchOptions.length > 0 &&
    selectedBranchIds.length === branchOptions.length;

  const canView =
    Boolean(dateRange.startDate && dateRange.endDate) &&
    isPositiveRate(usdRate);

  const toggleBranch = (id: string, checked: boolean) => {
    setBranchIds(current => toggleId(current, id, checked));
  };

  const toggleAllBranches = (checked: boolean) => {
    setBranchIds(checked ? branchOptions.map(option => option.id) : []);
  };

  const setProductId = (value: string) => {
    setProductIdState(value);
    const product = eligibleProducts.find(item => item.id === value);
    const linkedIds = product?.issuerProfileIds ?? [];
    if (value && !linkedIds.includes(issuerPartyProfileId)) {
      setIssuerPartyProfileId('');
    }
  };

  const resetFilters = () => {
    const nextDateRange = buildReportDateRange(ReportDatePresetEnum.TODAY);
    setDateRange(nextDateRange);
    setBranchIds([]);
    setProductIdState('');
    setIssuerPartyProfileId('');
    setPurposeId('');
    setUsdRate('');
    setReportFormat(LrsDailyReportFormatEnum.CIMS);
    setBankName('');
    setBankCode('');
    setShowTourPaxBreakup(false);
    setIncludeCorporateTransactions(false);
    setAppliedFilters(null);
    setSearchParams(new URLSearchParams());
  };

  const handleView = () => {
    if (!canView) {
      return;
    }

    const nextApplied = {
      dateRange,
      branchIds: selectedBranchIds,
      productId: selectedProductId,
      issuerPartyProfileId: selectedIssuerId,
      purposeId: selectedPurposeId,
      usdRate: usdRate.trim(),
      reportFormat,
      bankName: bankName.trim(),
      bankCode: bankCode.trim(),
      showTourPaxBreakup,
      includeCorporateTransactions,
    };
    setAppliedFilters(nextApplied);
    setSearchParams(
      buildSearchParams(undefined, params => {
        setSearchParamValue(params, 'datePreset', nextApplied.dateRange.preset);
        setSearchParamValue(
          params,
          'startDate',
          nextApplied.dateRange.startDate
        );
        setSearchParamValue(params, 'endDate', nextApplied.dateRange.endDate);
        setSearchParamList(params, 'branchIds', nextApplied.branchIds);
        setSearchParamValue(params, 'productId', nextApplied.productId);
        setSearchParamValue(
          params,
          'issuerPartyProfileId',
          nextApplied.issuerPartyProfileId
        );
        setSearchParamValue(params, 'purposeId', nextApplied.purposeId);
        setSearchParamValue(params, 'usdRate', nextApplied.usdRate);
        setSearchParamValue(params, 'reportFormat', nextApplied.reportFormat);
        setSearchParamValue(params, 'bankName', nextApplied.bankName);
        setSearchParamValue(params, 'bankCode', nextApplied.bankCode);
        setSearchParamBoolean(
          params,
          'showTourPaxBreakup',
          nextApplied.showTourPaxBreakup
        );
        setSearchParamBoolean(
          params,
          'includeCorporateTransactions',
          nextApplied.includeCorporateTransactions
        );
      })
    );
  };

  return {
    dateRange,
    branchIds: selectedBranchIds,
    productId: selectedProductId,
    issuerPartyProfileId: selectedIssuerId,
    purposeId: selectedPurposeId,
    usdRate,
    reportFormat,
    bankName,
    bankCode,
    showTourPaxBreakup,
    includeCorporateTransactions,
    branchOptions,
    productOptions,
    issuerOptions,
    purposeOptions,
    branchAllSelected,
    isLoadingProducts,
    isLoadingIssuers,
    isLoadingPurposes,
    setDateRange,
    setProductId,
    setIssuerPartyProfileId,
    setPurposeId,
    setUsdRate,
    setReportFormat,
    setBankName,
    setBankCode,
    setShowTourPaxBreakup,
    setIncludeCorporateTransactions,
    toggleBranch,
    toggleAllBranches,
    resetFilters,
    handleView,
    appliedFilters,
    appliedDateRangeLabel: appliedFilters
      ? formatReportDateRangeLabel(appliedFilters.dateRange)
      : LRS_DAILY_REPORT_TEXT.all,
    canView,
  };
};
