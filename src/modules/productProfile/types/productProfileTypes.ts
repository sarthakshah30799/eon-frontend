export interface IProductProfileCheckboxFieldConfig {
  name: keyof IProductProfile;
  label: string;
}

export interface IProductProfileFieldConfig {
  name: keyof IProductProfile;
  label: string;
  inputType?: 'text' | 'number';
}

export interface IProductProfile {
  id: string;
  productCode: string;
  productDescription: string;
  acOfIssuer: string;
  commissionAc: string;
  fakeAccount: string;
  bulkPurAc: string;
  openAc: string;
  closingAc: string;
  expenseAc: string;
  bulkSaleAc: string;
  purchaseAc: string;
  saleAc: string;
  profitAc: string;
  bulkProficAc: string;
  purchaseRetCancAc: string;
  purchaseBlkCancAc: string;
  saleRetCancAc: string;
  saleBlkCancAc: string;
  branchPurAc: string;
  branchSaleAc: string;
  profitAcBrnSale: string;
  retail: string;
  bulkFee: string;
  commLimit: string;
  maxAmtComm: string;
  allowFractionInFEAmount: boolean;
  separateSettlementForEachInstrument: boolean;
  pickSaleRateAvgAsSettlementRate: boolean;
  reload: boolean;
  automateSettlementRate: boolean;
  isActiveProduct: boolean;
  splitAndStoreBlankStockReceived: boolean;
  productRequiresSettlement: boolean;
  levelPriority: string;
  passAutoReceiptOfStockWhenSold: boolean;
  reversalEffectOfProfits: boolean;
  allowChangingDenominationInSales: boolean;
  allowMulticard: boolean;
  askReference: boolean;
  availableInRetailBuying: boolean;
  retailBuyingSeriesApplicable: boolean;
  availableInRetailSelling: boolean;
  retailSellingSeriesApplicable: boolean;
  availableInBulkBuying: boolean;
  bulkBuyingSeriesApplicable: boolean;
  availableInBulkSelling: boolean;
  bulkSellingSeriesApplicable: boolean;
  allowProductCancellation: boolean;
  maintainBlankStockOfProduct: boolean;
  denominationApplicable: boolean;
  allowAddOnLinking: boolean;
  instrumentIssuingAuthorityRequired: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type ICreateProductProfile = Omit<
  IProductProfile,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export type IUpdateProductProfile = Partial<ICreateProductProfile>;
