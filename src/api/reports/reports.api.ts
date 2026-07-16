import { apiClient } from '../api';
import { buildQueryString } from '@/utils';
import type {
  ISalePurchaseReportRequest,
  ISalePurchaseReportResponse,
  ReportExportFormat,
  ReportLayout,
} from '@/modules/reports/types';
import { API_BASE_URL } from '@/config/api';

const buildExportFilename = (layout: ReportLayout, format: ReportExportFormat) =>
  `sale-purchase-report-${layout}.${format}`;

export const reportsApi = {
  getSalePurchaseReport: async (
    params: ISalePurchaseReportRequest,
  ): Promise<ISalePurchaseReportResponse> => {
    const res = await apiClient.get<ISalePurchaseReportResponse>(
      `/reports/sale-purchase${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        columns: [],
        rows: [],
        layout: params.layout ?? 'grouped',
      };
    }

    return res.data;
  },

  downloadSalePurchaseReport: async (
    params: ISalePurchaseReportRequest,
    format: ReportExportFormat,
    layout: ReportLayout,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
      layout,
    });

    const res = await apiClient.getDownload(
      `/reports/sale-purchase/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download sale and purchase report');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename(layout, format),
    };
  },

  getReportFileUrl: (
    params: ISalePurchaseReportRequest,
    format: ReportExportFormat,
    layout: ReportLayout,
  ) => {
    const query = buildQueryString({
      ...params,
      format,
      layout,
    });

    return `${API_BASE_URL}/reports/sale-purchase/export${query}`;
  },
};

export default reportsApi;
