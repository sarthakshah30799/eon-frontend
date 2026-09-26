import {
  ProductSettlementDocumentKind,
  ProductSettlementType,
  type ProductSettlementDocumentItem,
} from '@/api/productSettlement';
import type {
  ProductSettlementFormItem,
  ProductSettlementFormValues,
} from '../types/productSettlementTypes';

type SettlementItemLike = {
  id: string;
  type?: string | null;
  productCode?: string | null;
  series?: string | null;
  kitNumber?: string | null;
  maskedCardNumber?: string | null;
  denomination: string;
  saleKind?: string | null;
  saleBuyRate: string;
  buyRate?: string | null;
  bookingRate?: string | null;
  issuerRate?: string | null;
  productSnapshot?: ProductSettlementDocumentItem['productSnapshot'];
};

export const emptySettlementForm = (
  kind: ProductSettlementDocumentKind
): ProductSettlementFormValues => ({
  kind,
  issuerPartyProfileId: '',
  currencyId: '',
  branchId: '',
  hoBranchId: '',
  transactionDate: '',
  transactionNumber: '',
  reference: '',
  remarks: '',
  items: [],
});

export const settlementAmountFrom = (denomination: string, rate: string) => {
  const amount = Number(denomination) * Number(rate);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

export const resolveProductCode = (item: {
  productCode?: string | null;
  productSnapshot?: {
    productCode?: string | null;
    code?: string | null;
  } | null;
}) =>
  String(
    item.productCode ??
      item.productSnapshot?.productCode ??
      item.productSnapshot?.code ??
      ''
  ).trim();

export const resolveSettlementType = (item: {
  type?: string | null;
  productCode?: string | null;
  productSnapshot?: {
    productCode?: string | null;
    code?: string | null;
  } | null;
}) => {
  const explicit = String(item.type ?? '').trim().toUpperCase();
  if (
    explicit === ProductSettlementType.CARD ||
    explicit === ProductSettlementType.TT
  ) {
    return explicit;
  }
  const code = resolveProductCode(item).toUpperCase();
  return code === ProductSettlementType.TT
    ? ProductSettlementType.TT
    : ProductSettlementType.CARD;
};

/** CARD uses masked number; TT uses synthetic series as the card-number column. */
export const displayCardNumber = (item: {
  type?: string | null;
  series?: string | null;
  maskedCardNumber?: string | null;
  productCode?: string | null;
  productSnapshot?: {
    productCode?: string | null;
    code?: string | null;
  } | null;
}) => {
  const type = resolveSettlementType(item);
  if (type === ProductSettlementType.TT) {
    return item.series?.trim() || '-';
  }
  return item.maskedCardNumber?.trim() || '-';
};

export const toFormItem = (
  item: SettlementItemLike,
  kind: ProductSettlementDocumentKind
): ProductSettlementFormItem => {
  const type = resolveSettlementType(item);
  const series = item.series ?? '';
  const rate =
    kind === ProductSettlementDocumentKind.HO_ISSUER
      ? item.issuerRate || item.saleBuyRate
      : item.buyRate || item.saleBuyRate;
  return {
    id: item.id,
    type,
    productCode: resolveProductCode(item),
    series,
    kitNumber: item.kitNumber ?? '',
    // TT shows synthetic series in the card-number column.
    maskedCardNumber:
      type === ProductSettlementType.TT
        ? series
        : (item.maskedCardNumber ?? ''),
    denomination: item.denomination,
    saleKind: item.saleKind ?? '',
    saleBuyRate: item.saleBuyRate,
    bookingRate: item.bookingRate ?? '',
    rate,
    amount: settlementAmountFrom(item.denomination, rate),
  };
};
