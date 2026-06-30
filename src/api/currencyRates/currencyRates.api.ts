import { apiClient } from '../api';
import type {
  ICurrencyRateGroup,
  ICurrencyRateQuote,
  ICurrencyRate,
  IProductCurrencyRate,
  ICurrencyRateRule,
  CurrencyRateProvider,
} from '@/modules/currencyRates/types/currencyRatesTypes';

export const currencyRatesApi = {
  getGroups: async (): Promise<ICurrencyRateGroup[]> => {
    const res = await apiClient.get<ICurrencyRateGroup[]>('/currency-rates/groups');
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createGroup: async (data: Partial<ICurrencyRateGroup> & { code: string; name: string }): Promise<ICurrencyRateGroup> => {
    const res = await apiClient.post<ICurrencyRateGroup>('/currency-rates/groups', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create currency rate group');
    return res.data;
  },

  updateGroup: async (id: string, data: Partial<ICurrencyRateGroup>): Promise<ICurrencyRateGroup> => {
    const res = await apiClient.put<ICurrencyRateGroup>(`/currency-rates/groups/${id}`, data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update currency rate group');
    return res.data;
  },

  createRateEntry: async (data: {
    currencyId: string;
    provider: CurrencyRateProvider | '';
    baseRate?: string;
    baseBuyRate?: string;
    baseSaleRate?: string;
    isActive?: boolean;
    notes?: string;
  }): Promise<ICurrencyRate> => {
    const res = await apiClient.post<ICurrencyRate>('/currency-rates/rates', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create rate entry');
    return res.data;
  },

  getLatestRates: async (currencyId?: string): Promise<ICurrencyRate[]> => {
    const url = currencyId
      ? `/currency-rates/rates/latest?currencyId=${encodeURIComponent(currencyId)}`
      : '/currency-rates/rates/latest';
    const res = await apiClient.get<ICurrencyRate[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  preview: async (data: {
    productId: string;
    currencyId: string;
    provider: CurrencyRateProvider | '';
    baseBuyRate: string;
    baseSaleRate: string;
    baseRate?: string;
    notes?: string;
  }): Promise<ICurrencyRateQuote> => {
    const res = await apiClient.post<ICurrencyRateQuote>('/currency-rates/preview', data);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to preview rate');
    return res.data;
  },

  getContext: async (productId: string, currencyId: string): Promise<{
    productId: string;
    productCode: string;
    currencyId: string;
    currencyCode: string;
    effectiveSource: string;
    effectiveGroupCode: string | null;
    hasOverride: boolean;
  }> => {
    const res = await apiClient.get<{
      productId: string;
      productCode: string;
      currencyId: string;
      currencyCode: string;
      effectiveSource: string;
      effectiveGroupCode: string | null;
      hasOverride: boolean;
    }>(`/currency-rates/context/${productId}/${currencyId}`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to load rate context');
    return res.data;
  },

  getProductCurrencyRates: async (params?: { productId?: string; currencyId?: string }): Promise<IProductCurrencyRate[]> => {
    const query = new URLSearchParams();
    if (params?.productId) query.set('productId', params.productId);
    if (params?.currencyId) query.set('currencyId', params.currencyId);
    const url = query.toString() ? `/currency-rates/product-rules?${query.toString()}` : '/currency-rates/product-rules';
    const res = await apiClient.get<IProductCurrencyRate[]>(url);
    if (res.error) throw new Error(res.error);
    return res.data || [];
  },

  createProductCurrencyRate: async (data: {
    productId: string;
    currencyId: string;
    buy: ICurrencyRateRule['buy'];
    sale: ICurrencyRateRule['sale'];
    isActive?: boolean;
  }): Promise<IProductCurrencyRate> => {
    const res = await apiClient.post<IProductCurrencyRate>('/currency-rates/product-rules', {
      productId: data.productId,
      currencyId: data.currencyId,
      buyMarginType: data.buy.marginType,
      buyMarginValue: data.buy.marginValue,
      buyMinRate: data.buy.minRate,
      buyMaxRate: data.buy.maxRate,
      saleMarginType: data.sale.marginType,
      saleMarginValue: data.sale.marginValue,
      saleMinRate: data.sale.minRate,
      saleMaxRate: data.sale.maxRate,
      isActive: data.isActive ?? true,
    });
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to create product currency pricing');
    return res.data;
  },

  updateProductCurrencyRate: async (
    id: string,
    data: Partial<{
      productId: string;
      currencyId: string;
      buy: ICurrencyRateRule['buy'];
      sale: ICurrencyRateRule['sale'];
      isActive: boolean;
    }>,
  ): Promise<IProductCurrencyRate> => {
    const payload: Record<string, unknown> = {};
    if (data.productId !== undefined) payload.productId = data.productId;
    if (data.currencyId !== undefined) payload.currencyId = data.currencyId;
    if (data.buy) {
      payload.buyMarginType = data.buy.marginType;
      payload.buyMarginValue = data.buy.marginValue;
      payload.buyMinRate = data.buy.minRate;
      payload.buyMaxRate = data.buy.maxRate;
    }
    if (data.sale) {
      payload.saleMarginType = data.sale.marginType;
      payload.saleMarginValue = data.sale.marginValue;
      payload.saleMinRate = data.sale.minRate;
      payload.saleMaxRate = data.sale.maxRate;
    }
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    const res = await apiClient.put<IProductCurrencyRate>(`/currency-rates/product-rules/${id}`, payload);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error('Failed to update product currency pricing');
    return res.data;
  },
};
