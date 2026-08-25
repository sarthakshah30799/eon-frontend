import { apiClient } from '../api';
import { buildQueryString } from '@/utils';
import type {
  ICardBlankStockReportRequest,
  ICardBlankStockReportResponse,
  ICardSettlementReportRequest,
  ICardSettlementReportResponse,
  ICurrencyBalanceReportRequest,
  ICurrencyBalanceReportResponse,
  IProductProfitReportRequest,
  IProductProfitReportResponse,
  ISpecialReportRequest,
  ISpecialReportResponse,
  ISalePurchaseReportRequest,
  ISalePurchaseReportResponse,
  IFlm1DailyCnSummaryRequest,
  IFlm1DailyCnSummaryResponse,
  IFlm3PurchaseFromPublicRequest,
  IFlm3PurchaseFromPublicResponse,
  IFlm4PurchaseFromFfmcRequest,
  IFlm4PurchaseFromFfmcResponse,
  IFlm5SalesToPublicRequest,
  IFlm5SalesToPublicResponse,
  IFlm6SalesToFfmcRequest,
  IFlm6SalesToFfmcResponse,
  IFlm8CnStatementRequest,
  IFlm8CnStatementResponse,
  IFlm8CnStatementLockDataRequest,
  IFlm8CnStatementLockDataResponse,
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

  getCurrencyBalanceReport: async (
    params: ICurrencyBalanceReportRequest,
  ): Promise<ICurrencyBalanceReportResponse> => {
    const res = await apiClient.get<ICurrencyBalanceReportResponse>(
      `/reports/currency-balance${buildQueryString(params)}`,
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
      throw new Error('Failed to download sell and purchase report');
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

  downloadCurrencyBalanceReport: async (
    params: ICurrencyBalanceReportRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/currency-balance/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download currency balance report');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename('currency-balance-report', 'single', format),
    };
  },

  getFlm1DailyCnSummary: async (
    params: IFlm1DailyCnSummaryRequest,
  ): Promise<IFlm1DailyCnSummaryResponse> => {
    const res = await apiClient.get<IFlm1DailyCnSummaryResponse>(
      `/reports/flm1-daily-cn-summary${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        date: '',
        productLabel: '',
        currenciesPerBlock: 5,
        groups: [],
      };
    }

    return res.data;
  },

  downloadFlm1DailyCnSummary: async (
    params: IFlm1DailyCnSummaryRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/flm1-daily-cn-summary/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download FLM1 daily CN summary');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename('flm1-daily-cn-summary', 'single', format),
    };
  },

  getFlm3PurchaseFromPublic: async (
    params: IFlm3PurchaseFromPublicRequest,
  ): Promise<IFlm3PurchaseFromPublicResponse> => {
    const res = await apiClient.get<IFlm3PurchaseFromPublicResponse>(
      `/reports/flm3-purchase-from-public${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        view: params.view ?? 'normal',
        columns: [],
        rows: [],
        totals: {
          feAmount: '0.00',
          rupeeEquivalent: '0.00',
          netAmount: '0.00',
          commissionAmount: '0.00',
          byCash: '0.00',
          byCheque: '0.00',
          byOther: '0.00',
        },
      };
    }

    return res.data;
  },

  downloadFlm3PurchaseFromPublic: async (
    params: IFlm3PurchaseFromPublicRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/flm3-purchase-from-public/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download FLM3 purchase from public');
    }

    return {
      blob: res.data.blob,
      filename:
        res.data.filename ||
        buildExportFilename('flm3-purchase-from-public', 'single', format),
    };
  },

  getFlm4PurchaseFromFfmc: async (
    params: IFlm4PurchaseFromFfmcRequest,
  ): Promise<IFlm4PurchaseFromFfmcResponse> => {
    const res = await apiClient.get<IFlm4PurchaseFromFfmcResponse>(
      `/reports/flm4-purchase-from-ffmc${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        view: params.view ?? 'normal',
        columns: [],
        rows: [],
        totals: {
          feAmount: '0.00',
          rupeeEquivalent: '0.00',
          netAmount: '0.00',
          commissionAmount: '0.00',
          byCash: '0.00',
          byCheque: '0.00',
          byOther: '0.00',
        },
      };
    }

    return res.data;
  },

  downloadFlm4PurchaseFromFfmc: async (
    params: IFlm4PurchaseFromFfmcRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/flm4-purchase-from-ffmc/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download FLM4 purchase from FFMC');
    }

    return {
      blob: res.data.blob,
      filename:
        res.data.filename ||
        buildExportFilename('flm4-purchase-from-ffmc', 'single', format),
    };
  },


  getFlm5SalesToPublic: async (
    params: IFlm5SalesToPublicRequest,
  ): Promise<IFlm5SalesToPublicResponse> => {
    const res = await apiClient.get<IFlm5SalesToPublicResponse>(
      `/reports/flm5-sales-to-public${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        view: params.view ?? 'normal',
        columns: [],
        rows: [],
        totals: {
          feAmount: '0.00',
          rupeeEquivalent: '0.00',
          netAmount: '0.00',
          commissionAmount: '0.00',
          byCash: '0.00',
          byCheque: '0.00',
          byOther: '0.00',
        },
      };
    }

    return res.data;
  },

  downloadFlm5SalesToPublic: async (
    params: IFlm5SalesToPublicRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/flm5-sales-to-public/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download FLM5 sales to public');
    }

    return {
      blob: res.data.blob,
      filename:
        res.data.filename ||
        buildExportFilename('flm5-sales-to-public', 'single', format),
    };
  },

  getFlm6SalesToFfmc: async (
    params: IFlm6SalesToFfmcRequest,
  ): Promise<IFlm6SalesToFfmcResponse> => {
    const res = await apiClient.get<IFlm6SalesToFfmcResponse>(
      `/reports/flm6-sales-to-ffmc${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        view: params.view ?? 'normal',
        columns: [],
        rows: [],
        totals: {
          feAmount: '0.00',
          rupeeEquivalent: '0.00',
          netAmount: '0.00',
          commissionAmount: '0.00',
          byCash: '0.00',
          byCheque: '0.00',
          byOther: '0.00',
        },
      };
    }

    return res.data;
  },

  downloadFlm6SalesToFfmc: async (
    params: IFlm6SalesToFfmcRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/flm6-sales-to-ffmc/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download FLM6 sales to FFMC');
    }

    return {
      blob: res.data.blob,
      filename:
        res.data.filename ||
        buildExportFilename('flm6-sales-to-ffmc', 'single', format),
    };
  },

  getFlm8CnStatement: async (
    params: IFlm8CnStatementRequest,
  ): Promise<IFlm8CnStatementResponse> => {
    const res = await apiClient.get<IFlm8CnStatementResponse>(
      `/reports/flm8-cn-statement${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        view: params.view ?? 'vertical',
        date: '',
        startDate: params.startDate ?? '',
        endDate: params.endDate ?? '',
        productLabel: '',
        currenciesPerBlock: 5,
        groups: [],
      };
    }

    return res.data;
  },

  downloadFlm8CnStatement: async (
    params: IFlm8CnStatementRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/flm8-cn-statement/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download FLM8 CN statement');
    }

    return {
      blob: res.data.blob,
      filename:
        res.data.filename ||
        buildExportFilename('flm8-cn-statement', 'single', format),
    };
  },

  lockFlm8CnStatementData: async (
    payload: IFlm8CnStatementLockDataRequest,
  ): Promise<IFlm8CnStatementLockDataResponse> => {
    const res = await apiClient.post<IFlm8CnStatementLockDataResponse>(
      '/reports/flm8-cn-statement/lock-data',
      payload,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to lock FLM 8 data');
    }

    return res.data;
  },

  getCardUnsettledReport: async (
    params: ICardSettlementReportRequest,
  ): Promise<ICardSettlementReportResponse> => {
    const res = await apiClient.get<ICardSettlementReportResponse>(
      `/reports/card-unsettled${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        columns: [],
        rows: [],
        layout: 'grouped',
      };
    }

    return res.data;
  },

  getCardSettledReport: async (
    params: ICardSettlementReportRequest,
  ): Promise<ICardSettlementReportResponse> => {
    const res = await apiClient.get<ICardSettlementReportResponse>(
      `/reports/card-settled${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        columns: [],
        rows: [],
        layout: 'grouped',
      };
    }

    return res.data;
  },

  downloadCardUnsettledReport: async (
    params: ICardSettlementReportRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/card-unsettled/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download unsettled CARD report');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename('card-unsettled-report', 'grouped', format),
    };
  },

  downloadCardSettledReport: async (
    params: ICardSettlementReportRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/card-settled/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download settled CARD report');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename('card-settled-report', 'grouped', format),
    };
  },

  getCardBlankStockReport: async (
    params: ICardBlankStockReportRequest,
  ): Promise<ICardBlankStockReportResponse> => {
    const res = await apiClient.get<ICardBlankStockReportResponse>(
      `/reports/card-blank-stock${buildQueryString(params)}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      return {
        columns: [],
        rows: [],
        layout: 'flat',
      };
    }

    return res.data;
  },

  downloadCardBlankStockReport: async (
    params: ICardBlankStockReportRequest,
    format: ReportExportFormat,
  ): Promise<{ blob: Blob; filename?: string }> => {
    const query = buildQueryString({
      ...params,
      format,
    });

    const res = await apiClient.getDownload(
      `/reports/card-blank-stock/export${query}`,
    );

    if (res.error) {
      throw new Error(res.error);
    }

    if (!res.data) {
      throw new Error('Failed to download blank CARD stock report');
    }

    return {
      blob: res.data.blob,
      filename: res.data.filename || buildExportFilename('card-blank-stock-report', 'flat', format),
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

  getCurrencyBalanceReportFileUrl: (
    params: ICurrencyBalanceReportRequest,
    format: ReportExportFormat,
  ) => {
    const query = buildQueryString({
      ...params,
      format,
    });

    return `${API_BASE_URL}/reports/currency-balance/export${query}`;
  },
};

export default reportsApi;
