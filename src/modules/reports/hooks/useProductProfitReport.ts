import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type IProductProfitReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useProductProfitReportFilters } from './useProductProfitReportFilters';
import { useResolvedPartyProfileIds } from './useResolvedPartyProfileIds';

export const useProductProfitReport = () => {
  const filters = useProductProfitReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);
  const resolvePartyProfileIds = useResolvedPartyProfileIds(filters);

  const hasExplicitPartyProfileSelection = Boolean(
    filters.appliedFilters?.partyProfileSelection.allSelected ||
      filters.appliedFilters?.partyProfileSelection.selectedIds.length,
  );

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: hasExplicitPartyProfileSelection ? [] : filters.appliedFilters?.branchIds ?? [],
      stateIds: hasExplicitPartyProfileSelection ? [] : filters.appliedFilters?.stateIds ?? [],
      counterIds: hasExplicitPartyProfileSelection ? [] : filters.appliedFilters?.counterIds ?? [],
      partyTypeCodes: filters.appliedFilters?.partyTypeCodes ?? [],
      currencyIds: filters.appliedFilters?.currencyIds ?? [],
      productIds: filters.appliedFilters?.productIds ?? [],
    }),
    [filters.appliedFilters, hasExplicitPartyProfileSelection],
  );

  const reportQueryKey = useMemo(
    () => ['product-profit-report', filters.appliedFilters],
    [filters.appliedFilters],
  );

  const reportQuery = useQuery<IProductProfitReportResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => {
      const partyProfileIds = await resolvePartyProfileIds();
      if (hasExplicitPartyProfileSelection && (!partyProfileIds || partyProfileIds.length === 0)) {
        return {
          columns: [],
          rows: [],
          layout: 'single',
        };
      }

      return reportsApi.getProductProfitReport({
        ...requestParams,
        ...(partyProfileIds ? { partyProfileIds } : {}),
      });
    },
  });

  const reportColumns = reportQuery.data?.columns ?? [];
  const reportRows = reportQuery.data?.rows ?? [];

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const partyProfileIds = await resolvePartyProfileIds();
    if (hasExplicitPartyProfileSelection && (!partyProfileIds || partyProfileIds.length === 0)) {
      return;
    }

    const payload = await reportsApi.downloadProductProfitReport(
      {
        ...requestParams,
        ...(partyProfileIds ? { partyProfileIds } : {}),
      },
      exportFormat,
    );

    downloadBlob(payload.blob, payload.filename || 'product-profit-report.xlsx');
  }, [
    exportFormat,
    filters.appliedFilters,
    hasExplicitPartyProfileSelection,
    requestParams,
    resolvePartyProfileIds,
  ]);

  const isReady = Boolean(filters.appliedFilters);

  return {
    filters,
    exportFormat,
    setExportFormat,
    reportColumns,
    reportRows,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady,
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};

export default useProductProfitReport;
