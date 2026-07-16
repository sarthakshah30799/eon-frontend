import { apiClient } from '../api';
import { buildQueryString } from '@/utils';
import type {
  IProductProfitReportRequest,
  IProductProfitReportResponse,
  ISpecialReportRequest,
  ISpecialReportResponse,
  ISalePurchaseReportRequest,
  ISalePurchaseReportResponse,
  ReportExportFormat,
} from '@/modules/reports/types';
import { API_BASE_URL } from '@/config/api';
import type { ReportLayout } from '@/modules/reports/types';

const buildExportFilename = (prefix: string, layout: ReportLayout, format: ReportExportFormat) =>
  `${prefix}-${layout}.${format}`;

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

  getProductProfitReport: async (
    params: IProductProfitReportRequest,
  ): Promise<IProductProfitReportResponse> => {
    const res = await apiClient.get<IProductProfitReportResponse>(
      `/reports/product-profit${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        columns: [],
        rows: [],
        layout: 'single',
      };
    }

    return res.data;
  },

  getSpecialReport: async (
    params: ISpecialReportRequest,
  ): Promise<ISpecialReportResponse> => {
    const res = await apiClient.get<ISpecialReportResponse>(
      `/reports/special-report${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        columns: [],
        rows: [],
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
      filename: res.data.filename || buildExportFilename('sale-purchase-report', layout, format),
    };
  },

  downloadProductProfitReport: async (
    params: IProductProfitReportRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/product-profit/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download product profit report');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename('product-profit-report', 'single', format),
    };
  },

  downloadSpecialReport: async (
    params: ISpecialReportRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/special-report/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download special report');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename('special-reports-account-posting', 'single', format),
    };
  },

  getProductProfitReportFileUrl: (
    params: IProductProfitReportRequest,
    format: ReportExportFormat,
  ) => {
    const query = buildQueryString({
      ...params,
      format,
    });

    return `${API_BASE_URL}/reports/product-profit/export${query}`;
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

  getSpecialReportFileUrl: (
    params: ISpecialReportRequest,
    format: ReportExportFormat,
  ) => {
    const query = buildQueryString({
      ...params,
      format,
    });

    return `${API_BASE_URL}/reports/special-report/export${query}`;
  },
};

export default reportsApi;
