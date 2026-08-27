import { CardStockSettlementDocumentKind } from '@/api/cardSettlement';
import type {
  CardSettlementFormItem,
  CardSettlementFormValues,
} from '../types/cardSettlementTypes';

export const emptySettlementForm = (
  kind: CardStockSettlementDocumentKind
): CardSettlementFormValues => ({
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

export const toFormItem = (
  item: {
    id: string;
    series: string;
    kitNumber: string;
    maskedCardNumber: string;
    denomination: string;
    saleKind: string;
    saleBuyRate: string;
    buyRate?: string;
    settlementAmount?: string;
    issuerRate?: string | null;
    issuerSettlementAmount?: string | null;
  },
  kind: CardStockSettlementDocumentKind
): CardSettlementFormItem => {
  const rate =
    kind === CardStockSettlementDocumentKind.HO_ISSUER
      ? item.issuerRate || item.saleBuyRate
      : item.buyRate || item.saleBuyRate;
  return {
    id: item.id,
    series: item.series,
    kitNumber: item.kitNumber,
    maskedCardNumber: item.maskedCardNumber,
    denomination: item.denomination,
    saleKind: item.saleKind,
    saleBuyRate: item.saleBuyRate,
    rate,
    amount: settlementAmountFrom(item.denomination, rate),
  };
};
