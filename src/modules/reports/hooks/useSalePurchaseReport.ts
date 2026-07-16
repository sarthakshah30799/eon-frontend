import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { partyProfileApi, reportsApi } from '@/api';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import {
  ReportExportFormatEnum,
  ReportLayoutEnum,
  type ISalePurchaseReportResponse,
} from '../types';
import { useSalePurchaseReportFilters } from './useSalePurchaseReportFilters';

const PAGE_SIZE = 200;

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const useResolvedPartyProfileIds = (filters: ReturnType<typeof useSalePurchaseReportFilters>) => {
  return useCallback(async () => {
    const selection = filters.appliedFilters?.partyProfileSelection;
    if (!selection) {
      return undefined;
    }

    if (!selection.allSelected) {
      return selection.selectedIds.length > 0 ? selection.selectedIds : undefined;
    }

    const resolvedIds = new Set<string>();
    let page = 1;

    while (true) {
      const response = await partyProfileApi.getPartyProfiles(
        {
          search: filters.appliedFilters?.partyProfileSearch?.trim() || undefined,
          activeOnly: true,
          page,
          limit: PAGE_SIZE,
        },
        filters.appliedFilters?.partyTypeCodes?.length
          ? (filters.appliedFilters.partyTypeCodes as PartyProfileType[])
          : undefined,
      );

      response.data.forEach(profile => {
        if (!selection.excludedIds.includes(profile.id)) {
          resolvedIds.add(profile.id);
        }
      });

      if (!response.totalPages || page >= response.totalPages) {
        break;
      }

      page += 1;
    }

    return [...resolvedIds];
  }, [filters.appliedFilters]);
};

export const useSalePurchaseReport = () => {
  const filters = useSalePurchaseReportFilters();
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
      transactionTypes: filters.appliedFilters?.transactionTypes ?? [],
    }),
    [filters.appliedFilters, hasExplicitPartyProfileSelection],
  );

  const reportQueryKey = useMemo(
    () => ['sale-purchase-report', filters.appliedFilters],
    [filters.appliedFilters],
  );

  const reportQuery = useQuery<ISalePurchaseReportResponse>({
    queryKey: reportQueryKey,
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => {
      const partyProfileIds = await resolvePartyProfileIds();
      if (hasExplicitPartyProfileSelection && (!partyProfileIds || partyProfileIds.length === 0)) {
        return {
          columns: [],
          rows: [],
          layout: ReportLayoutEnum.GROUPED,
        };
      }

      return reportsApi.getSalePurchaseReport({
        ...requestParams,
        ...(partyProfileIds ? { partyProfileIds } : {}),
        layout: ReportLayoutEnum.GROUPED,
      });
    },
  });

  const reportColumns = reportQuery.data?.columns ?? [];
  const reportRows = reportQuery.data?.rows ?? [];

  const downloadReport = useCallback(
    async (layout: typeof ReportLayoutEnum.GROUPED | typeof ReportLayoutEnum.FLAT) => {
      if (!filters.appliedFilters) {
        return;
      }

      const partyProfileIds = await resolvePartyProfileIds();
      if (hasExplicitPartyProfileSelection && (!partyProfileIds || partyProfileIds.length === 0)) {
        return;
      }

      const payload = await reportsApi.downloadSalePurchaseReport(
        {
          ...requestParams,
          ...(partyProfileIds ? { partyProfileIds } : {}),
        },
        exportFormat,
        layout,
      );

      downloadBlob(payload.blob, payload.filename || 'sale-purchase-report.xlsx');
    },
    [
      exportFormat,
      filters.appliedFilters,
      hasExplicitPartyProfileSelection,
      requestParams,
      resolvePartyProfileIds,
    ],
  );

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
    downloadGroupedReport: () => downloadReport(ReportLayoutEnum.GROUPED),
    downloadFlatReport: () => downloadReport(ReportLayoutEnum.FLAT),
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};

export default useSalePurchaseReport;
