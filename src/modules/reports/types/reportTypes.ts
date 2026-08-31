export const ReportDatePresetEnum = {
  ALL: 'ALL',
  TODAY: 'TODAY',
  YESTERDAY: 'YESTERDAY',
  CURRENT_WEEK: 'CURRENT_WEEK',
  LAST_WEEK: 'LAST_WEEK',
  CURRENT_MONTH: 'CURRENT_MONTH',
  LAST_MONTH: 'LAST_MONTH',
  CUSTOM: 'CUSTOM',
} as const;

export type ReportDatePreset =
  (typeof ReportDatePresetEnum)[keyof typeof ReportDatePresetEnum];

export const ReportTransactionTypeEnum = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
} as const;

export type ReportTransactionType =
  (typeof ReportTransactionTypeEnum)[keyof typeof ReportTransactionTypeEnum];

export const ReportSortByEnum = {
  DATE_ASC: 'DATE_ASC',
  DATE_DESC: 'DATE_DESC',
} as const;

export type ReportSortBy =
  (typeof ReportSortByEnum)[keyof typeof ReportSortByEnum];

export const ReportPageTypeEnum = {
  SALE_PURCHASE: 'sale-purchase-report',
  PRODUCT_PROFIT: 'product-profit-report',
  SPECIAL: 'special-reports',
  CURRENCY_BALANCE: 'currency-balance-report',
  CARD_UNSETTLED: 'card-unsettled-report',
  CARD_SETTLED: 'card-settled-report',
  CARD_BLANK_STOCK: 'card-blank-stock-report',
  FLM1_DAILY_CN_SUMMARY: 'flm1-daily-cn-summary',
  FLM2_DAILY_ET_SUMMARY: 'flm2-daily-et-summary',
  FLM3_PURCHASE_FROM_PUBLIC: 'flm3-purchase-from-public',
  FLM4_PURCHASE_FROM_FFMC: 'flm4-purchase-from-ffmc',
  FLM5_SALES_TO_PUBLIC: 'flm5-sales-to-public',
  FLM6_SALES_TO_FFMC: 'flm6-sales-to-ffmc',
  FLM7_SURRENDER_STATEMENT: 'flm7-surrender-statement',
  FLM8_CN_STATEMENT: 'flm8-cn-statement',
} as const;

export type ReportPageType =
  (typeof ReportPageTypeEnum)[keyof typeof ReportPageTypeEnum];

export const REPORT_PAGE_DEFAULT_TYPE = ReportPageTypeEnum.SALE_PURCHASE;

const REPORT_PAGE_SLUG_ALIASES: Partial<Record<string, ReportPageType>> = {
  'special-report': ReportPageTypeEnum.SPECIAL,
  'currency-balance': ReportPageTypeEnum.CURRENCY_BALANCE,
};

export const getReportPageCanonicalSlug = (
  slug?: string
): ReportPageType | null => {
  if (!slug) {
    return null;
  }

  const normalizedSlug = slug.trim().toLowerCase();
  return getReportPageTypeFromSlug(normalizedSlug);
};

const REPORT_PAGE_TITLE_BY_TYPE: Record<ReportPageType, string> = {
  [ReportPageTypeEnum.SALE_PURCHASE]: 'Sell & Purchase Reports',
  [ReportPageTypeEnum.PRODUCT_PROFIT]: 'Product Profit Reports',
  [ReportPageTypeEnum.SPECIAL]: 'Special Reports',
  [ReportPageTypeEnum.CURRENCY_BALANCE]: 'Currency Balance',
  [ReportPageTypeEnum.CARD_UNSETTLED]: 'Unsettled CARD Report',
  [ReportPageTypeEnum.CARD_SETTLED]: 'Settled CARD Report',
  [ReportPageTypeEnum.CARD_BLANK_STOCK]: 'Blank Stock CARD Report',
  [ReportPageTypeEnum.FLM1_DAILY_CN_SUMMARY]: 'FLM1 Daily CN Summary',
  [ReportPageTypeEnum.FLM2_DAILY_ET_SUMMARY]: 'Encashed TC Balance',
  [ReportPageTypeEnum.FLM3_PURCHASE_FROM_PUBLIC]:
    'FLM 3 - Purchase from Public',
  [ReportPageTypeEnum.FLM4_PURCHASE_FROM_FFMC]: 'FLM 4 - Purchase from FFMC',
  [ReportPageTypeEnum.FLM5_SALES_TO_PUBLIC]: 'FLM 5 - Sales to Public',
  [ReportPageTypeEnum.FLM6_SALES_TO_FFMC]: 'FLM 6 - Sales to FFMC',
  [ReportPageTypeEnum.FLM7_SURRENDER_STATEMENT]: 'FLM 7 - Surrender Statement',
  [ReportPageTypeEnum.FLM8_CN_STATEMENT]: 'FLM 8 - CN Statement',
};

export const getReportPageTypeFromSlug = (
  slug?: string
): ReportPageType | null => {
  if (!slug) {
    return null;
  }

  const normalizedSlug = slug.trim().toLowerCase();
  const alias = REPORT_PAGE_SLUG_ALIASES[normalizedSlug];

  if (alias) {
    return alias;
  }

  return Object.values(ReportPageTypeEnum).includes(
    normalizedSlug as ReportPageType
  )
    ? (normalizedSlug as ReportPageType)
    : null;
};

export const getReportPageTitle = (pageType: ReportPageType | null): string => {
  if (!pageType) {
    return 'Reports';
  }

  return REPORT_PAGE_TITLE_BY_TYPE[pageType] ?? 'Reports';
};

export interface IReportDateRange {
  preset: ReportDatePreset;
  startDate: string;
  endDate: string;
}

export interface IReportSelectOption {
  id: string;
  label: string;
  description?: string;
}

export interface IReportPartyProfileSelection {
  allSelected: boolean;
  selectedIds: string[];
  excludedIds: string[];
}

export interface IReportFiltersState {
  dateRange: IReportDateRange;
  stateIds: string[];
  branchIds: string[];
  counterIds: string[];
  partyTypeCodes: string[];
  partyProfileSearch: string;
  partyProfileSelection: IReportPartyProfileSelection;
  transactionTypes: ReportTransactionType[];
  sortBy: ReportSortBy;
}

export interface IProductProfitReportFiltersState extends IReportFiltersState {
  currencyIds: string[];
  productIds: string[];
}

export const ReportLayoutEnum = {
  GROUPED: 'grouped',
  FLAT: 'flat',
  SINGLE: 'single',
} as const;

export type ReportLayout =
  (typeof ReportLayoutEnum)[keyof typeof ReportLayoutEnum];

export const ReportExportFormatEnum = {
  CSV: 'csv',
  XLSX: 'xlsx',
} as const;

export type ReportExportFormat =
  (typeof ReportExportFormatEnum)[keyof typeof ReportExportFormatEnum];

export interface ISalePurchaseReportColumn {
  key: string;
  label: string;
}

export interface ISalePurchaseReportRow {
  rowType: 'GROUP' | 'ITEM' | 'SUBTOTAL';
  transactionId: string;
  partyProfileId: string;
  groupLabel?: string;
  sortPartyProfile?: string;
  sortDate?: string;
  sortBranch?: string;
  sortDateTime?: string;
  sortTransactionNumber?: string;
  [key: string]: string | undefined;
}

export interface ISalePurchaseReportResponse {
  columns: ISalePurchaseReportColumn[];
  rows: ISalePurchaseReportRow[];
  layout: ReportLayout;
}

export interface ISalePurchaseReportRequest {
  startDate?: string;
  endDate?: string;
  branchIds?: string[];
  stateIds?: string[];
  counterIds?: string[];
  partyProfileIds?: string[];
  partyTypeCodes?: string[];
  transactionTypes?: ReportTransactionType[];
  layout?: ReportLayout;
  sortBy?: ReportSortBy;
}

export interface IProductProfitReportResponse {
  columns: ISalePurchaseReportColumn[];
  rows: ISalePurchaseReportRow[];
  layout: ReportLayout;
}

export interface IProductProfitReportRequest {
  startDate?: string;
  endDate?: string;
  branchIds?: string[];
  stateIds?: string[];
  counterIds?: string[];
  partyProfileIds?: string[];
  partyTypeCodes?: string[];
  currencyIds?: string[];
  productIds?: string[];
  sortBy?: ReportSortBy;
}

export const SpecialReportTemplateEnum = {
  ACCOUNT_POSTING: 'ACCOUNT_POSTING',
} as const;

export type SpecialReportTemplate =
  (typeof SpecialReportTemplateEnum)[keyof typeof SpecialReportTemplateEnum];

export interface ISpecialReportRequest {
  branchIds?: string[];
  template?: SpecialReportTemplate;
  transactionNumbers?: string[];
  sortBy?: ReportSortBy;
}

export type ISpecialReportRow = ISalePurchaseReportRow;

export interface ISpecialReportResponse {
  columns: ISalePurchaseReportColumn[];
  rows: ISpecialReportRow[];
  template?: SpecialReportTemplate;
}

export interface ICurrencyBalanceReportColumn {
  key: string;
  label: string;
}

export interface ICurrencyBalanceReportRow {
  date: string;
  branch: string;
  counter: string;
  opening: string;
  purchaseBulk: string;
  purchaseRetail: string;
  sellBulk: string;
  sellRetail: string;
  closing: string;
}

export interface ICurrencyBalanceReportResponse {
  columns: ICurrencyBalanceReportColumn[];
  rows: ICurrencyBalanceReportRow[];
}

export interface ICurrencyBalanceReportRequest {
  startDate?: string;
  endDate?: string;
  branchIds?: string[];
  counterIds?: string[];
  currencyIds?: string[];
}

export interface ICardSettlementReportFiltersState {
  dateRange: IReportDateRange;
  branchIds: string[];
  productIds: string[];
  currencyIds: string[];
  issuerPartyProfileIds: string[];
  sortBy: ReportSortBy;
}

export type ICardSettlementReportResponse = ISalePurchaseReportResponse;

export interface ICardSettlementReportRequest {
  startDate?: string;
  endDate?: string;
  branchIds?: string[];
  productIds?: string[];
  currencyIds?: string[];
  issuerPartyProfileIds?: string[];
  sortBy?: ReportSortBy;
}

export type ICardBlankStockReportResponse = ISalePurchaseReportResponse;

export type ICardBlankStockReportRequest = ICardSettlementReportRequest;

export interface IFlm1ReportColumn {
  key: string;
  label: string;
  groupLabel?: string;
  highlight?: boolean;
}

export interface IFlm1ReportRow {
  rowType: 'HEADER' | 'ITEM' | 'TOTAL';
  lineKey: string;
  particulars: string;
  [key: string]: string;
}

export interface IFlm1ReportBlock {
  columns: IFlm1ReportColumn[];
  rows: IFlm1ReportRow[];
}

export interface IFlm1ReportGroup {
  branchId: string;
  branchLabel: string;
  empty: boolean;
  emptyMessage?: string;
  blocks: IFlm1ReportBlock[];
}

export interface IFlm1DailyCnSummaryResponse {
  layout?: 'branch_wise' | 'consolidate';
  date: string;
  productLabel: string;
  currenciesPerBlock: number;
  groups: IFlm1ReportGroup[];
}

export interface IFlm1DailyCnSummaryRequest {
  date?: string;
  branchIds?: string[];
  productId?: string;
  layout?: 'branch_wise' | 'consolidate';
}

export type IFlm8ReportColumn = IFlm1ReportColumn;
export type IFlm8ReportRow = IFlm1ReportRow;
export type IFlm8ReportBlock = IFlm1ReportBlock;
export type IFlm8ReportGroup = IFlm1ReportGroup;

export interface IFlm8CnStatementResponse {
  view: 'vertical' | 'horizontal';
  date: string;
  startDate: string;
  endDate: string;
  productLabel: string;
  currenciesPerBlock: number;
  groups: IFlm8ReportGroup[];
}

export interface IFlm8CnStatementRequest {
  startDate?: string;
  endDate?: string;
  branchIds?: string[];
  productId?: string;
  view?: 'vertical' | 'horizontal';
  profileType?: 'FFMC' | 'AD';
  apConnect?: boolean;
}

export interface IFlm8CnStatementLockDataRequest {
  lockedThroughDate: string;
  branchIds: string[];
  reportStartDate?: string;
  reportEndDate?: string;
}

export interface ITransactionDataLockResult {
  id: string;
  branchId: string;
  branchName?: string | null;
  lockedThroughDate: string;
  lockedAt: string;
  lockedBy: string;
  reportStartDate?: string | null;
  reportEndDate?: string | null;
  status?: 'created' | 'advanced' | 'unchanged' | 'skipped';
  message?: string;
}

export interface IFlm8CnStatementLockDataResponse {
  results: ITransactionDataLockResult[];
}

export interface IFlm3ReportColumn {
  key: string;
  label: string;
}

export interface IFlm3ReportRow {
  rowType: 'ITEM' | 'TOTAL';
  transactionId: string;
  [key: string]: string;
}

export interface IFlm3ReportTotals {
  feAmount: string;
  rupeeEquivalent: string;
  netAmount: string;
  commissionAmount: string;
  byCash: string;
  byCheque: string;
  byOther: string;
}

export interface IFlm3ReportGroup {
  branchId: string;
  branchLabel: string;
  empty: boolean;
  emptyMessage?: string;
  columns: IFlm3ReportColumn[];
  rows: IFlm3ReportRow[];
  totals: IFlm3ReportTotals;
}

export interface IFlm3PurchaseFromPublicResponse {
  view: 'normal' | 'extended';
  layout?: 'branch_wise' | 'consolidate';
  columns: IFlm3ReportColumn[];
  rows: IFlm3ReportRow[];
  totals: IFlm3ReportTotals;
  groups?: IFlm3ReportGroup[];
}

export interface IFlm3PurchaseFromPublicRequest {
  startDate?: string;
  endDate?: string;
  branchIds?: string[];
  productId?: string;
  view?: 'normal' | 'extended';
  layout?: 'branch_wise' | 'consolidate';
}

export type IFlm4PurchaseFromFfmcResponse = IFlm3PurchaseFromPublicResponse;
export interface IFlm4PurchaseFromFfmcRequest extends IFlm3PurchaseFromPublicRequest {
  profileTypes?: string[];
}
export type IFlm5SalesToPublicResponse = IFlm3PurchaseFromPublicResponse;
export type IFlm5SalesToPublicRequest = IFlm3PurchaseFromPublicRequest;
export type IFlm6SalesToFfmcResponse = IFlm3PurchaseFromPublicResponse;
export type IFlm6SalesToFfmcRequest = IFlm4PurchaseFromFfmcRequest;

export interface IReportTemplateOption {
  id: SpecialReportTemplate;
  label: string;
}
