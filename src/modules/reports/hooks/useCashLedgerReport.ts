import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ICashLedgerReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useCashLedgerReportFilters } from './useCashLedgerReportFilters';

export const useCashLedgerReport = () => {
  const filters = useCashLedgerReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);

  const requestParams = useMemo(
    () => ({
      startDate: filters.appliedFilters?.dateRange.startDate,
      endDate: filters.appliedFilters?.dateRange.endDate,
      branchIds: filters.appliedFilters?.branchIds ?? [],
      accountIds: filters.appliedFilters?.accountIds ?? [],
      counterIds: filters.appliedFilters?.counterIds ?? [],
      scope: filters.appliedFilters?.scope,
      layout: filters.appliedFilters?.layout,
    }),
    [filters.appliedFilters]
  );

  const reportQuery = useQuery<ICashLedgerReportResponse>({
    queryKey: [
      'cash-ledger-report',
      requestParams.startDate,
      requestParams.endDate,
      requestParams.branchIds,
      requestParams.accountIds,
      requestParams.counterIds,
      requestParams.scope,
      requestParams.layout,
    ],
    enabled: Boolean(
      filters.appliedFilters &&
        requestParams.startDate &&
        requestParams.endDate
    ),
    queryFn: async () => reportsApi.getCashLedgerReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }
    const payload = await reportsApi.downloadCashLedgerReport(
      requestParams,
      exportFormat
    );
    downloadBlob(payload.blob, payload.filename || 'cash-ledger-report.xlsx');
  }, [exportFormat, filters.appliedFilters, requestParams]);

  return {
    filters,
    exportFormat,
    setExportFormat,
    report: reportQuery.data ?? null,
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady: Boolean(filters.appliedFilters),
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};

export default useCashLedgerReport;
