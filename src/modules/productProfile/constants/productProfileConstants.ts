import type {
  ProductProfileCheckboxFieldConfig,
  ProductProfileFieldConfig,
} from '../types';

export const PRODUCT_PROFILE_TEXTS = {
  LIST_TITLE: 'Product Profile',
  LIST_SUBTITLE:
    'Manage product definitions, update accounting configuration, and maintain product settings from one place.',
  CREATE_PRODUCT: 'Create Product',
  SAVE_CHANGES: 'Save Changes',
  EDIT_PRODUCT: 'Edit Product',
  FORM_SUBTITLE:
    'Fill in the product information, accounting configuration, and product details.',
  PRODUCT_INFO_TITLE: 'Product Info',
  ACCOUNTING_CONFIGURATION_TITLE: 'Accounting Configuration',
  PRODUCT_DETAILS_TITLE: 'Product Details',
  EMPTY_STATE: 'No products found. Create your first product.',
  LIST_ERROR: 'Error loading products',
  CREATE_SUCCESS: 'Product created successfully!',
  UPDATE_SUCCESS: 'Product updated successfully!',
  CREATE_ERROR: 'Failed to create product',
  UPDATE_ERROR: 'Failed to update product',
} as const;

export const PRODUCT_PROFILE_ACCOUNTING_FIELDS: ProductProfileFieldConfig[] = [
  { name: 'acOfIssuer', label: 'A/C of Issuer' },
  { name: 'commissionAc', label: 'Commission A/C' },
  { name: 'fakeAccount', label: 'Fake Account' },
  { name: 'bulkPurAc', label: 'Bulk Pur. A/C' },
  { name: 'openAc', label: 'Open A/C' },
  { name: 'closingAc', label: 'Closing A/C' },
  { name: 'expenseAc', label: 'Expence A/C' },
  { name: 'bulkSaleAc', label: 'Bulk Sale A/C' },
  { name: 'purchaseAc', label: 'Purchase A/C' },
  { name: 'saleAc', label: 'Sale A/C' },
  { name: 'profitAc', label: 'Profit A/C' },
  { name: 'bulkProficAc', label: 'Bulk Profic A/C' },
  { name: 'purchaseRetCancAc', label: 'Purchase Ret.Canc.A/C' },
  { name: 'purchaseBlkCancAc', label: 'Purchase Blk Canc.A/C' },
  { name: 'saleRetCancAc', label: 'Sale Ret.Canc.A/C' },
  { name: 'saleBlkCancAc', label: 'Sale Blk Canc.A/C' },
  { name: 'branchPurAc', label: 'Branch Pur. A/C' },
  { name: 'branchSaleAc', label: 'Branch Sale A/C' },
  { name: 'profitAcBrnSale', label: 'Profit A/C-Brn Sale' },
  { name: 'retail', label: 'Retail', inputType: 'number' },
  { name: 'bulkFee', label: 'Bulk Fee', inputType: 'number' },
  { name: 'commLimit', label: '% Comm Limit', inputType: 'number' },
  { name: 'maxAmtComm', label: 'Max.Amt Comm.', inputType: 'number' },
];

export const PRODUCT_PROFILE_DETAIL_CHECKBOXES: ProductProfileCheckboxFieldConfig[] =
  [
    { name: 'allowFractionInFEAmount', label: 'Allow fraction in FE Amout?' },
    {
      name: 'separateSettlementForEachInstrument',
      label: 'Separate Settlement for each Instrument?',
    },
    {
      name: 'pickSaleRateAvgAsSettlementRate',
      label: 'Pick Sale Rate Avg. as Settlement Rate?',
    },
    { name: 'reload', label: 'Reload' },
    { name: 'automateSettlementRate', label: 'Automate Settlement Rate?' },
    { name: 'isActiveProduct', label: 'Is Active Product?' },
    {
      name: 'splitAndStoreBlankStockReceived',
      label: 'Split & Store Blank Stock Received?',
    },
    {
      name: 'productRequiresSettlement',
      label: 'Product Requires Settlement?',
    },
    { name: 'passAutoReceiptOfStockWhenSold', label: 'Pass Auto Reciept of Stock when Sold?' },
    { name: 'reversalEffectOfProfits', label: 'Reversal effect of Profits?' },
    {
      name: 'allowChangingDenominationInSales',
      label: 'Allow Changing Denomination in Sales?',
    },
    { name: 'allowMulticard', label: 'Allow Multicard?' },
    { name: 'askReference', label: 'Ask Reference' },
  ];

export const PRODUCT_PROFILE_RETAIL_TRANSACTION_CHECKBOXES: ProductProfileCheckboxFieldConfig[] =
  [
    {
      name: 'availableInRetailBuying',
      label: 'Available in Retail Buying',
    },
    {
      name: 'retailBuyingSeriesApplicable',
      label: 'Series Applicable',
    },
    {
      name: 'availableInRetailSelling',
      label: 'Available in Retail Selling',
    },
    {
      name: 'retailSellingSeriesApplicable',
      label: 'Series Applicable',
    },
    {
      name: 'availableInBulkBuying',
      label: 'Available in Bulk Buying',
    },
    {
      name: 'bulkBuyingSeriesApplicable',
      label: 'Series Applicable',
    },
    {
      name: 'availableInBulkSelling',
      label: 'Available in Bulk Selling',
    },
    {
      name: 'bulkSellingSeriesApplicable',
      label: 'Series Applicable',
    },
    {
      name: 'allowProductCancellation',
      label: 'Allow Product Cancellation',
    },
    {
      name: 'maintainBlankStockOfProduct',
      label: 'Maintain Blank Stock of Product?',
    },
    {
      name: 'denominationApplicable',
      label: 'Denomination Applicable',
    },
    { name: 'allowAddOnLinking', label: 'Allow Add-On Linking' },
    {
      name: 'instrumentIssuingAuthorityRequired',
      label: 'Instrument Issuing Authority Required',
    },
  ];
