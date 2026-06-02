export interface ProductProfileCheckboxFieldConfig {
  name: keyof ProductProfileFormValues;
  label: string;
}

export interface ProductProfileFieldConfig {
  name: keyof ProductProfileFormValues;
  label: string;
  inputType?: 'text' | 'number';
}

export interface ProductProfileFormValues {
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
}

export interface ProductProfileRecord extends ProductProfileFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
