import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import { LRS_DAILY_REPORT_TEXT } from '../constants/lrsDailyReportConstants';
import {
  LrsDailyReportExportFormatEnum,
  type ILrsDailyReportResponse,
  type LrsDailyReportExportFormat,
} from '../types';
import { downloadBlob } from '../utils';
import { useLrsDailyReportFilters } from './useLrsDailyReportFilters';

export const useLrsDailyReport = () => {
  const filters = useLrsDailyReportFilters();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      productId: filters.appliedFilters?.productId || undefined,
      issuerPartyProfileId:
        filters.appliedFilters?.issuerPartyProfileId || undefined,
      purposeId: filters.appliedFilters?.purposeId || undefined,
      usdRate: Number(filters.appliedFilters?.usdRate),
      reportFormat: filters.appliedFilters?.reportFormat,
      bankName: filters.appliedFilters?.bankName,
      bankCode: filters.appliedFilters?.bankCode,
      includeCorporateTransactions:
        filters.appliedFilters?.includeCorporateTransactions,
      showTourPaxBreakup: filters.appliedFilters?.showTourPaxBreakup,
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<ILrsDailyReportResponse>({
    queryKey: ['lrs-daily-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: async () => reportsApi.getLrsDailyReport(requestParams),
  });

  const downloadReport = useCallback(
    async (format: LrsDailyReportExportFormat) => {
      if (!filters.appliedFilters) {
        return;
      }

      try {
        setDownloadError(null);
        const payload = await reportsApi.downloadLrsDailyReport(
          requestParams,
          format
        );
        downloadBlob(
          payload.blob,
          payload.filename ||
            `lrs-daily-report.${format === LrsDailyReportExportFormatEnum.XLSX ? 'xlsx' : format}`
        );
      } catch {
        setDownloadError(LRS_DAILY_REPORT_TEXT.downloadFailed);
      }
    },
    [filters.appliedFilters, requestParams]
  );

  return {
    filters,
    report: reportQuery.data ?? null,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    downloadError,
    isReady: Boolean(filters.appliedFilters),
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};
