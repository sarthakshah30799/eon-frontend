import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { branchProfileApi } from '@/api';
import { useListProductProfiles } from '@/modules/productProfile/hooks';
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
} from '../utils/reportSearchParams';
import {
  DEFAULT_FLM_REPORT_LAYOUT,
  parseFlmReportLayout,
  type FlmReportLayout,
} from '../constants/flmReportLayoutConstants';
import {
  FLM5_DEFAULT_PRODUCT_CODE,
  Flm5ReportViewEnum,
  type Flm5ReportView,
} from '../constants/flm5SalesToPublicConstants';
import {
  ReportDatePresetEnum,
  type IReportDateRange,
  type IReportSelectOption,
} from '../types';

export interface Flm5SalesToPublicFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  productId: string;
  view: Flm5ReportView;
  layout: FlmReportLayout;
  branchOptions: IReportSelectOption[];
  productOptions: IReportSelectOption[];
  branchAllSelected: boolean;
  setDateRange: (value: IReportDateRange) => void;
  setProductId: (value: string) => void;
  setView: (value: Flm5ReportView) => void;
  setLayout: (value: FlmReportLayout) => void;
  toggleBranch: (id: string, checked: boolean) => void;
  toggleAllBranches: (checked: boolean) => void;
  resetFilters: () => void;
  handleView: () => void;
  appliedFilters: {
    dateRange: IReportDateRange;
    branchIds: string[];
    productId: string;
    view: Flm5ReportView;
  layout: FlmReportLayout;
  } | null;
  appliedDateRangeLabel: string;
  canView: boolean;
}

const toOption = (id: string, label: string): IReportSelectOption => ({ id, label });

const parseView = (value: string): Flm5ReportView =>
  value === Flm5ReportViewEnum.EXTENDED
    ? Flm5ReportViewEnum.EXTENDED
    : Flm5ReportViewEnum.NORMAL;

export const useFlm5SalesToPublicFilters =
  (): Flm5SalesToPublicFiltersState => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
    const userAssignments = useMemo(
      () => user?.assignments ?? [],
      [user?.assignments],
    );
    const searchParamsKey = searchParams.toString();
    const parsedSearchParams = useMemo(
      () => new URLSearchParams(searchParamsKey),
      [searchParamsKey],
    );

    const hydratedRouteState = useMemo(() => {
      return {
        dateRange: readDateRangeSearchParams(
          parsedSearchParams,
          ReportDatePresetEnum.TODAY,
        ),
        branchIds: readSearchParamList(parsedSearchParams, 'branchIds'),
        productId: readSearchParamValue(parsedSearchParams, 'productId'),
        view: parseView(readSearchParamValue(parsedSearchParams, 'view')),
        layout: parseFlmReportLayout(
          readSearchParamValue(parsedSearchParams, 'layout') ||
            DEFAULT_FLM_REPORT_LAYOUT,
        ),
      };
    }, [parsedSearchParams]);

    const [dateRange, setDateRange] = useState<IReportDateRange>(
      hydratedRouteState.dateRange,
    );
    const [branchIds, setBranchIds] = useState<string[]>(
      hydratedRouteState.branchIds,
    );
    const [productId, setProductId] = useState(hydratedRouteState.productId);
    const [view, setViewState] = useState<Flm5ReportView>(hydratedRouteState.view);
    const [layout, setLayoutState] = useState<FlmReportLayout>(
      hydratedRouteState.layout,
    );
    const [appliedFilters, setAppliedFilters] = useState<
      Flm5SalesToPublicFiltersState['appliedFilters']
    >(
      searchParamsKey
        ? {
            dateRange: hydratedRouteState.dateRange,
            branchIds: hydratedRouteState.branchIds,
            productId: hydratedRouteState.productId,
            view: hydratedRouteState.view,
            layout: hydratedRouteState.layout,
          }
        : null,
    );

    const { data: branchProfiles = [] } = useQuery({
      queryKey: ['reports-flm3-branch-profiles'],
      enabled: true,
      queryFn: async () =>
        branchProfileApi.getBranchProfiles({
          activeOnly: true,
        }),
    });

    const { data: productProfiles = [] } = useListProductProfiles(true);

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
          accessibleBranchProfiles.map(branch =>
            toOption(branch.id, buildReportOptionLabel(branch.code, branch.name)),
          ),
        ),
      [accessibleBranchProfiles],
    );

    const productOptions = useMemo<IReportSelectOption[]>(
      () =>
        uniqueOptions(
          productProfiles.map(product =>
            toOption(
              product.id,
              buildReportOptionLabel(product.productCode, product.productDescription),
            ),
          ),
        ),
      [productProfiles],
    );

    const defaultProductId = useMemo(() => {
      const cnProduct = productProfiles.find(
        product =>
          String(product.productCode ?? '').toUpperCase() ===
          FLM5_DEFAULT_PRODUCT_CODE,
      );
      return cnProduct?.id ?? productOptions[0]?.id ?? '';
    }, [productOptions, productProfiles]);

    const selectedBranchIds = useMemo(
      () =>
        branchIds.filter(branchId =>
          branchOptions.some(option => option.id === branchId),
        ),
      [branchIds, branchOptions],
    );
    const selectedProductId = productOptions.some(option => option.id === productId)
      ? productId
      : defaultProductId;

    const branchAllSelected =
      branchOptions.length > 0 &&
      selectedBranchIds.length === branchOptions.length;

    const toggleBranch = (id: string, checked: boolean) => {
      setBranchIds(current => toggleId(current, id, checked));
    };

    const toggleAllBranches = (checked: boolean) => {
      setBranchIds(checked ? branchOptions.map(option => option.id) : []);
    };

    const writeSearchParams = (
      nextDateRange: IReportDateRange,
      nextBranchIds: string[],
      nextProductId: string,
      nextView: Flm5ReportView,
      nextLayout: FlmReportLayout,
    ) => {
      return buildSearchParams(undefined, next => {
        setSearchParamValue(next, 'datePreset', nextDateRange.preset);
        setSearchParamValue(next, 'startDate', nextDateRange.startDate);
        setSearchParamValue(next, 'endDate', nextDateRange.endDate);
        setSearchParamList(next, 'branchIds', nextBranchIds);
        setSearchParamValue(next, 'productId', nextProductId);
        setSearchParamValue(next, 'view', nextView);
        setSearchParamValue(next, 'layout', nextLayout);
      });
    };

    const setView = (nextView: Flm5ReportView) => {
      setViewState(nextView);
      if (!appliedFilters) {
        return;
      }
      setAppliedFilters({
        ...appliedFilters,
        view: nextView,
      });
      setSearchParams(
        writeSearchParams(
          appliedFilters.dateRange,
          appliedFilters.branchIds,
          appliedFilters.productId,
          nextView,
          appliedFilters.layout,
        ),
        { replace: true },
      );
    };

    const setLayout = (nextLayout: FlmReportLayout) => {
      setLayoutState(nextLayout);
      if (!appliedFilters) {
        return;
      }
      setAppliedFilters({
        ...appliedFilters,
        layout: nextLayout,
      });
      setSearchParams(
        writeSearchParams(
          appliedFilters.dateRange,
          appliedFilters.branchIds,
          appliedFilters.productId,
          appliedFilters.view,
          nextLayout,
        ),
        { replace: true },
      );
    };

    const resetFilters = () => {
      setDateRange(buildReportDateRange(ReportDatePresetEnum.TODAY));
      setBranchIds([]);
      setProductId(defaultProductId);
      setViewState(Flm5ReportViewEnum.NORMAL);
      setLayoutState(DEFAULT_FLM_REPORT_LAYOUT);
      setAppliedFilters(null);
      setSearchParams(new URLSearchParams(), { replace: true });
    };

    const handleView = () => {
      if (!selectedProductId || !dateRange.startDate || !dateRange.endDate) {
        return;
      }

      const accessibleBranchIds = branchOptions.map(option => option.id);
      const effectiveBranchIds = isRestrictedUser
        ? selectedBranchIds.length > 0
          ? selectedBranchIds
          : accessibleBranchIds
        : selectedBranchIds;

      if (
        isRestrictedUser &&
        selectedBranchIds.length === 0 &&
        effectiveBranchIds.length > 0
      ) {
        setBranchIds(effectiveBranchIds);
      }

      const nextAppliedFilters = {
        dateRange,
        branchIds: effectiveBranchIds,
        productId: selectedProductId,
        view,
        layout,
      };

      setAppliedFilters(nextAppliedFilters);
      setSearchParams(
        writeSearchParams(
          dateRange,
          effectiveBranchIds,
          selectedProductId,
          view,
          layout,
        ),
        { replace: true },
      );
    };

    const appliedDateRangeLabel = appliedFilters
      ? formatReportDateRangeLabel(appliedFilters.dateRange)
      : formatReportDateRangeLabel(dateRange);

    return {
      dateRange,
      branchIds: selectedBranchIds,
      productId: selectedProductId,
      view,
      layout,
      branchOptions,
      productOptions,
      branchAllSelected,
      setDateRange,
      setProductId,
      setView,
      setLayout,
      toggleBranch,
      toggleAllBranches,
      resetFilters,
      handleView,
      appliedFilters,
      appliedDateRangeLabel,
      canView: Boolean(
        selectedProductId && dateRange.startDate && dateRange.endDate,
      ),
    };
  };

export default useFlm5SalesToPublicFilters;
