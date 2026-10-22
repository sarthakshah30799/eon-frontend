import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ITtReportResponse,
  type TtReportLayout,
} from '../types';
import { downloadBlob } from '../utils';
import { useTtReportFilters } from './useTtReportFilters';

const ISSUER_PATTERN_BY_LAYOUT: Partial<Record<TtReportLayout, RegExp>> = {
  idfc: /IDFC/i,
  icici: /ICICI/i,
  yes: /YES/i,
};

export const useTtReport = (layout: TtReportLayout = 'indus') => {
  const filters = useTtReportFilters(ISSUER_PATTERN_BY_LAYOUT[layout]);
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      productId: filters.appliedFilters?.productId || undefined,
      issuerPartyProfileIds: filters.appliedFilters?.issuerPartyProfileIds ?? [],
      layout,
      blockAfterGenerate: filters.appliedFilters?.blockAfterGenerate,
      showBlocked: filters.appliedFilters?.showBlocked,
      showBeforeHoAcceptance: filters.appliedFilters?.showBeforeHoAcceptance,
    }),
    [filters.appliedFilters, layout]
  );

  const reportQuery = useQuery<ITtReportResponse>({
    queryKey: ['tt-report', layout, filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getTtReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadTtReport(
      {
        ...requestParams,
        blockedBatchAt: reportQuery.data?.blockedBatchAt || undefined,
        blockAfterGenerate: reportQuery.data?.blockedBatchAt
          ? false
          : requestParams.blockAfterGenerate,
      },
      exportFormat
    );
    downloadBlob(
      payload.blob,
      payload.filename || `${layout}-tt-report.xlsx`
    );
  }, [
    exportFormat,
    filters.appliedFilters,
    layout,
    reportQuery.data,
    requestParams,
  ]);

  return {
    filters,
    report: reportQuery.data ?? null,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady: Boolean(reportQuery.data),
    exportFormat,
    setExportFormat,
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};
