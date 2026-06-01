import type {
  ProductProfileFormValues,
  ProductProfileRecord,
} from '@/modules/productProfile/types';
import {
  createEmptyProductProfileFormValues,
  mapFormValuesToRecord,
} from '@/modules/productProfile/utils';

const STORAGE_KEY = 'maraekat-product-profiles';

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `product-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const now = (): string => new Date().toISOString();

const createSeedProducts = (): ProductProfileRecord[] => {
  const first = mapFormValuesToRecord(
    {
      ...createEmptyProductProfileFormValues(),
      productCode: 'FX-001',
      productDescription: 'Foreign Exchange Retail Product',
      acOfIssuer: 'Issuer A/C 001',
      commissionAc: 'Commission A/C 001',
      fakeAccount: 'Fake A/C 001',
      bulkPurAc: 'Bulk Purchase A/C 001',
      openAc: 'Open A/C 001',
      closingAc: 'Closing A/C 001',
      expenseAc: 'Expense A/C 001',
      bulkSaleAc: 'Bulk Sale A/C 001',
      purchaseAc: 'Purchase A/C 001',
      saleAc: 'Sale A/C 001',
      profitAc: 'Profit A/C 001',
      bulkProficAc: 'Bulk Profit A/C 001',
      purchaseRetCancAc: 'Purchase Return Cancel A/C 001',
      purchaseBlkCancAc: 'Purchase Block Cancel A/C 001',
      saleRetCancAc: 'Sale Return Cancel A/C 001',
      saleBlkCancAc: 'Sale Block Cancel A/C 001',
      branchPurAc: 'Branch Purchase A/C 001',
      branchSaleAc: 'Branch Sale A/C 001',
      profitAcBrnSale: 'Branch Sale Profit A/C 001',
      retail: '0.25',
      bulkFee: '12.50',
      commLimit: '1000',
      maxAmtComm: '5000',
      allowFractionInFEAmount: true,
      separateSettlementForEachInstrument: true,
      pickSaleRateAvgAsSettlementRate: false,
      reload: true,
      automateSettlementRate: true,
      isActiveProduct: true,
      splitAndStoreBlankStockReceived: false,
      productRequiresSettlement: true,
      levelPriority: '1',
      passAutoReceiptOfStockWhenSold: true,
      reversalEffectOfProfits: false,
      allowChangingDenominationInSales: true,
      allowMulticard: false,
      askReference: true,
    },
    createId(),
    now(),
    now()
  );

  const second = mapFormValuesToRecord(
    {
      ...createEmptyProductProfileFormValues(),
      productCode: 'FX-002',
      productDescription: 'Bulk Exchange Product',
      acOfIssuer: 'Issuer A/C 002',
      commissionAc: 'Commission A/C 002',
      fakeAccount: 'Fake A/C 002',
      bulkPurAc: 'Bulk Purchase A/C 002',
      openAc: 'Open A/C 002',
      closingAc: 'Closing A/C 002',
      expenseAc: 'Expense A/C 002',
      bulkSaleAc: 'Bulk Sale A/C 002',
      purchaseAc: 'Purchase A/C 002',
      saleAc: 'Sale A/C 002',
      profitAc: 'Profit A/C 002',
      bulkProficAc: 'Bulk Profit A/C 002',
      purchaseRetCancAc: 'Purchase Return Cancel A/C 002',
      purchaseBlkCancAc: 'Purchase Block Cancel A/C 002',
      saleRetCancAc: 'Sale Return Cancel A/C 002',
      saleBlkCancAc: 'Sale Block Cancel A/C 002',
      branchPurAc: 'Branch Purchase A/C 002',
      branchSaleAc: 'Branch Sale A/C 002',
      profitAcBrnSale: 'Branch Sale Profit A/C 002',
      retail: '0.15',
      bulkFee: '8.00',
      commLimit: '750',
      maxAmtComm: '2500',
      allowFractionInFEAmount: false,
      separateSettlementForEachInstrument: false,
      pickSaleRateAvgAsSettlementRate: true,
      reload: false,
      automateSettlementRate: false,
      isActiveProduct: false,
      splitAndStoreBlankStockReceived: true,
      productRequiresSettlement: false,
      levelPriority: '2',
      passAutoReceiptOfStockWhenSold: false,
      reversalEffectOfProfits: true,
      allowChangingDenominationInSales: false,
      allowMulticard: true,
      askReference: false,
    },
    createId(),
    now(),
    now()
  );

  return [first, second];
};

const writeStoredProducts = (products: ProductProfileRecord[]): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

const readStoredProducts = (): ProductProfileRecord[] => {
  if (typeof window === 'undefined') {
    return createSeedProducts();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = createSeedProducts();
    writeStoredProducts(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(stored) as ProductProfileRecord[];

    if (!Array.isArray(parsed)) {
      const seed = createSeedProducts();
      writeStoredProducts(seed);
      return seed;
    }

    return parsed;
  } catch {
    const seed = createSeedProducts();
    writeStoredProducts(seed);
    return seed;
  }
};

export const productProfileApi = {
  getProductProfiles: async (): Promise<ProductProfileRecord[]> => {
    return readStoredProducts();
  },

  getProductProfileById: async (
    id: string
  ): Promise<ProductProfileRecord | undefined> => {
    const products = readStoredProducts();
    return products.find(product => product.id === id);
  },

  createProductProfile: async (
    data: ProductProfileFormValues
  ): Promise<ProductProfileRecord> => {
    const products = readStoredProducts();
    const timestamp = now();
    const record = mapFormValuesToRecord(data, createId(), timestamp, timestamp);

    writeStoredProducts([...products, record]);

    return record;
  },

  updateProductProfile: async (
    id: string,
    data: ProductProfileFormValues
  ): Promise<ProductProfileRecord | undefined> => {
    const products = readStoredProducts();
    const existing = products.find(product => product.id === id);

    if (!existing) {
      return undefined;
    }

    const updated = mapFormValuesToRecord(
      data,
      existing.id,
      existing.createdAt,
      now()
    );

    writeStoredProducts(
      products.map(product => (product.id === id ? updated : product))
    );

    return updated;
  },

  updateProductProfileStatus: async (
    id: string,
    isActiveProduct: boolean
  ): Promise<ProductProfileRecord | undefined> => {
    const products = readStoredProducts();
    const existing = products.find(product => product.id === id);

    if (!existing) {
      return undefined;
    }

    const updated: ProductProfileRecord = {
      ...existing,
      isActiveProduct,
      updatedAt: now(),
    };

    writeStoredProducts(
      products.map(product => (product.id === id ? updated : product))
    );

    return updated;
  },
};
