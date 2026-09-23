import type { TtSettlementDocumentKind } from '@/api/ttSettlement';
import type { DealCoverSnapshot } from '@/api/dealCoverRate';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';

export interface TtSettlementFormItem {
  id: string;
  dealNo: string;
  feAmount: string;
  dealRate: string;
  bookingRate: string;
  saleBuyRate: string;
  rate: string;
  amount: string;
}

export interface TtSettlementFormValues {
  kind: TtSettlementDocumentKind;
  issuerPartyProfileId: string;
  issuerPartyProfileSnapshot?:
    | DealCoverSnapshot
    | ITransactionReferenceSnapshot
    | null;
  currencyId: string;
  currencySnapshot?: DealCoverSnapshot | ITransactionReferenceSnapshot | null;
  branchId: string;
  branchSnapshot?: DealCoverSnapshot | ITransactionReferenceSnapshot | null;
  hoBranchId: string;
  hoBranchSnapshot?: DealCoverSnapshot | ITransactionReferenceSnapshot | null;
  transactionDate: string;
  transactionNumber: string;
  reference: string;
  remarks: string;
  items: TtSettlementFormItem[];
}
