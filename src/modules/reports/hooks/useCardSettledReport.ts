import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import {
  ReportExportFormatEnum,
  type ICardSettlementReportResponse,
} from '../types';
import { downloadBlob } from '../utils';
import { useCardSettlementReportFilters } from './useCardSettlementReportFilters';

export const useCardSettledReport = () => {
  const filters = useCardSettlementReportFilters();
  const [exportFormat, setExportFormat] = useState<
    typeof ReportExportFormatEnum.CSV | typeof ReportExportFormatEnum.XLSX
  >(ReportExportFormatEnum.XLSX);
  const appliedFilters = filters.appliedFilters;
  const requestParams = useMemo(
    () => ({
      startDate: appliedFilters?.dateRange.startDate || undefined,
      endDate: appliedFilters?.dateRange.endDate || undefined,
      branchIds: appliedFilters?.branchIds ?? [],
      productIds: appliedFilters?.productIds ?? [],
      currencyIds: appliedFilters?.currencyIds ?? [],
      issuerPartyProfileIds: appliedFilters?.issuerPartyProfileIds ?? [],
      sortBy: appliedFilters?.sortBy,
    }),
    [appliedFilters],
  );

  const reportQuery = useQuery<ICardSettlementReportResponse>({
    queryKey: ['card-settled-report', filters.appliedFilters],
    enabled: Boolean(filters.appliedFilters),
    queryFn: () => reportsApi.getCardSettledReport(requestParams),
  });

  const downloadReport = useCallback(async () => {
    if (!filters.appliedFilters) {
      return;
    }

    const payload = await reportsApi.downloadCardSettledReport(
      requestParams,
      exportFormat,
    );
    downloadBlob(payload.blob, payload.filename || 'card-settled-report.xlsx');
  }, [exportFormat, filters.appliedFilters, requestParams]);

  return {
    filters,
    exportFormat,
    setExportFormat,
    reportColumns: reportQuery.data?.columns ?? [],
    reportRows: reportQuery.data?.rows ?? [],
    isLoadingReport: reportQuery.isLoading,
    isFetchingReport: reportQuery.isFetching,
    reportError: reportQuery.error,
    isReady: Boolean(filters.appliedFilters),
    downloadReport,
    appliedDateRangeLabel: filters.appliedDateRangeLabel,
  };
};

export default useCardSettledReport;
