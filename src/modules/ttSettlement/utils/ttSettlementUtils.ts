import { TtSettlementDocumentKind } from '@/api/ttSettlement';
import type {
  TtSettlementFormItem,
  TtSettlementFormValues,
} from '../types/ttSettlementTypes';

export const emptySettlementForm = (
  kind: TtSettlementDocumentKind
): TtSettlementFormValues => ({
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

export const settlementAmountFrom = (feAmount: string, rate: string) => {
  const amount = Number(feAmount) * Number(rate);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

export const toFormItem = (
  item: {
    id: string;
    dealNo?: string | null;
    feAmount: string;
    dealRate?: string;
    bookingRate?: string | null;
    saleBuyRate?: string;
    buyRate?: string;
    settlementAmount?: string;
    issuerRate?: string | null;
    issuerSettlementAmount?: string | null;
  },
  kind: TtSettlementDocumentKind
): TtSettlementFormItem => {
  const rate =
    kind === TtSettlementDocumentKind.HO_ISSUER
      ? item.issuerRate || item.dealRate || item.saleBuyRate || ''
      : item.buyRate || item.dealRate || item.saleBuyRate || '';
  const feAmount = item.feAmount;
  return {
    id: item.id,
    dealNo: item.dealNo ?? '',
    feAmount,
    dealRate: item.dealRate ?? '',
    bookingRate: item.bookingRate ?? '',
    saleBuyRate: item.saleBuyRate ?? item.dealRate ?? '',
    rate,
    amount: settlementAmountFrom(feAmount, rate),
  };
};
