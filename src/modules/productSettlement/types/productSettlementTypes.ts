import type { ProductSettlementDocumentKind } from '@/api/productSettlement';
import type { CardStockSnapshot } from '@/api/cardStock';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';

export interface ProductSettlementFormItem {
  id: string;
  type: string;
  productCode: string;
  series: string;
  kitNumber: string;
  maskedCardNumber: string;
  denomination: string;
  saleKind: string;
  saleBuyRate: string;
  bookingRate: string;
  rate: string;
  amount: string;
}

export interface ProductSettlementFormValues {
  kind: ProductSettlementDocumentKind;
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
  items: ProductSettlementFormItem[];
}
