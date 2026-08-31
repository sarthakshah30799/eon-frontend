import type { CardStockSettlementDocumentKind } from '@/api/cardSettlement';
import type { CardStockSnapshot } from '@/api/cardStock';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';

export interface CardSettlementFormItem {
  id: string;
  series: string;
  kitNumber: string;
  maskedCardNumber: string;
  denomination: string;
  saleKind: string;
  saleBuyRate: string;
  rate: string;
  amount: string;
}

export interface CardSettlementFormValues {
  kind: CardStockSettlementDocumentKind;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot?:
    | CardStockSnapshot
    | ITransactionReferenceSnapshot
    | null;
  currencyId: string;
  currencySnapshot?: CardStockSnapshot | ITransactionReferenceSnapshot | null;
  branchId: string;
  branchSnapshot?: CardStockSnapshot | ITransactionReferenceSnapshot | null;
  hoBranchId: string;
  hoBranchSnapshot?: CardStockSnapshot | ITransactionReferenceSnapshot | null;
  transactionDate: string;
  transactionNumber: string;
  reference: string;
  remarks: string;
  items: CardSettlementFormItem[];
}
