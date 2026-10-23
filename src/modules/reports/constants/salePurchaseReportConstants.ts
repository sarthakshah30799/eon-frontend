import { SalePurchaseDetailEnum, SalePurchaseGroupByEnum } from '../types';

export const SALE_PURCHASE_REPORT_TEXT = {
  groupByHeading: 'Group By',
  codewise: 'Codewise',
  datewise: 'Datewise',
  branchwise: 'Branchwise',
  detailHeading: 'Report',
  short: 'Short',
  long: 'Long',
  comingSoon: 'Coming soon',
} as const;

export const SALE_PURCHASE_GROUP_BY_OPTIONS = [
  {
    id: SalePurchaseGroupByEnum.CODE,
    label: SALE_PURCHASE_REPORT_TEXT.codewise,
  },
  {
    id: SalePurchaseGroupByEnum.DATE,
    label: SALE_PURCHASE_REPORT_TEXT.datewise,
  },
  {
    id: SalePurchaseGroupByEnum.BRANCH,
    label: SALE_PURCHASE_REPORT_TEXT.branchwise,
  },
] as const;

export const SALE_PURCHASE_DETAIL_OPTIONS = [
  {
    id: SalePurchaseDetailEnum.SHORT,
    label: SALE_PURCHASE_REPORT_TEXT.short,
  },
  {
    id: SalePurchaseDetailEnum.LONG,
    label: SALE_PURCHASE_REPORT_TEXT.long,
  },
] as const;
