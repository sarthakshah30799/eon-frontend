export const ReportDatePresetEnum = {
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

export const ReportPageTypeEnum = {
  SALE_PURCHASE: 'sale-purchase-report',
  PRODUCT_PROFIT: 'product-profit-report',
  SPECIAL: 'special-reports',
} as const;

export type ReportPageType =
  (typeof ReportPageTypeEnum)[keyof typeof ReportPageTypeEnum];

export const REPORT_PAGE_DEFAULT_TYPE = ReportPageTypeEnum.SALE_PURCHASE;

const REPORT_PAGE_SLUG_ALIASES: Partial<Record<string, ReportPageType>> = {
  'special-report': ReportPageTypeEnum.SPECIAL,
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
  [ReportPageTypeEnum.SALE_PURCHASE]: 'Sale & Purchase Reports',
  [ReportPageTypeEnum.PRODUCT_PROFIT]: 'Product Profit Reports',
  [ReportPageTypeEnum.SPECIAL]: 'Special Reports',
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
    normalizedSlug as ReportPageType,
  )
    ? (normalizedSlug as ReportPageType)
    : null;
};

export const getReportPageTitle = (
  pageType: ReportPageType | null
): string => {
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
  rowType: 'ITEM' | 'SUBTOTAL';
  transactionId: string;
  partyProfileId: string;
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
}

export const SpecialReportTemplateEnum = {
  ACCOUNT_POSTING: 'ACCOUNT_POSTING',
} as const;

export type SpecialReportTemplate =
  (typeof SpecialReportTemplateEnum)[keyof typeof SpecialReportTemplateEnum];

export interface ISpecialReportRequest {
  branchIds?: string[];
  template?: SpecialReportTemplate;
}

export type ISpecialReportRow = ISalePurchaseReportRow;

export interface ISpecialReportResponse {
  columns: ISalePurchaseReportColumn[];
  rows: ISpecialReportRow[];
  template?: SpecialReportTemplate;
}

export interface IReportTemplateOption {
  id: SpecialReportTemplate;
  label: string;
}
