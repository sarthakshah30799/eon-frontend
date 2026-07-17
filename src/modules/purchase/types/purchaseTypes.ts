import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';
import type { ITransactionDocumentEntity } from '@/modules/transactions';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import type { ITransactionAdditionalChargeFormRow } from '@/components/forms';
import type { ITransactionPaymentDetailFormRow } from '@/components/forms';
import type {
  ICreateTransactionAdditionalChargePayload,
  ICreateTransactionDocumentPayload,
  ICreateTransactionItemPayload,
  ICreateTransactionPaymentPayload,
  TradeMode,
  TransactionType,
} from '@/modules/transactions';
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';

export interface IPurchaseTransactionFormRow {
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  productId: string;
  productCode: string;
  productDescription: string;
  quantity: string;
  per: string;
  rate: string;
  commission: string;
  commissionSnapshot: Record<string, unknown> | null;
  total: string;
  roundOff: string;
  finalAmount: string;
}

export interface IPurchaseFormValues {
  purchasePageType: PurchasePageType | null;
  branchId: string;
  branchSnapshot: ITransactionReferenceSnapshot | null;
  counterId: string;
  transactionType: TransactionType;
  tradeMode: TradeMode;
  partyProfileId: string;
  partyProfileCode: string;
  partyProfileName: string;
  partyProfileEmail: string;
  partyProfilePhoneNo: string;
  partyProfileAddress1: string;
  partyProfileAddress2: string;
  partyProfileAddress3: string;
  partyProfileCity: string;
  partyProfilePinCode: string;
  partyProfilePanNo: string;
  partyProfileGstNo: string;
  partyProfileGstStateName: string;
  partyProfileStateName: string;
  partyProfileContactName: string;
  partyProfileApplyTax: boolean;
  agentProfileId: string;
  agentProfileCode: string;
  agentProfileName: string;
  manualBookReferenceType: 'CASHIER' | 'DELIVERY_BOY';
  manualBookId: string;
  manualBookNo: string;
  manualBookPageId: string;
  manualBookPageSnapshot: Record<string, unknown> | null;
  cashierUserId: string;
  cashierUserCode: string;
  cashierUserName: string;
  deliveryBoyUserId: string;
  deliveryBoyUserCode: string;
  deliveryBoyUserName: string;
  number: string | null;
  transactions: IPurchaseTransactionFormRow[];
  additionalCharges: ITransactionAdditionalChargeFormRow[];
  paymentDetails: ITransactionPaymentDetailFormRow[];
}

export type IPurchaseTransactionDocument = ITransactionDocumentEntity;

export interface IPurchaseDocumentAttachment {
  documentProfileId: string;
  file: File;
}

export type IPurchaseDraftDocumentAttachment = IPurchaseDocumentAttachment;

export interface IPurchaseSelectedPartyProfile {
  id: string;
  code: string;
  name: string;
  type: string;
  email?: string;
  phoneNo?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  pinCode?: string;
  panNo?: string;
  gstNo?: string;
  gstStateName?: string;
  stateName?: string;
  contactName?: string;
}

export interface IPurchaseSelectedCurrencyProfile {
  id: string;
  currencyCode: string;
  currencyName: string;
}

export interface IPurchaseProductOption {
  id: string;
  productCode: string;
  productDescription: string;
  availableInBulkBuying: boolean;
  availableInBulkSelling: boolean;
}

export interface IPurchasePricingData {
  currencies: ICurrencyProfile[];
  products: IPurchaseProductOption[];
  latestRates: import('@/modules/currencyRates/types/currencyRatesTypes').ICurrencyRate[];
  productCurrencyRates: import('@/modules/currencyRates/types/currencyRatesTypes').IProductCurrencyRate[];
  agentCommissionRules?: IPartyProfileCommissionRule[];
}

export interface IPurchaseSubmitPayload {
  transaction: {
    number?: string | null;
    slug: string;
    branchId: string;
    branchSnapshot: ITransactionReferenceSnapshot | null;
    counterId: string;
    requiresApproval: boolean;
    partyProfileId: string;
    agentProfileId?: string | null;
    manualBookPageId?: string | null;
    manualBookPageSnapshot?: Record<string, unknown> | null;
    transactionType: TransactionType;
    tradeMode: TradeMode;
    remarks?: string | null;
    items: ICreateTransactionItemPayload[];
    documents: ICreateTransactionDocumentPayload[];
    additionalCharges: ICreateTransactionAdditionalChargePayload[];
    payments: ICreateTransactionPaymentPayload[];
  };
  attachments: IPurchaseDocumentAttachment[];
}

export interface IPurchasePartyProfileResult extends IPartyProfile {
  rowKey?: string;
}

export interface IPurchaseBookPageOption {
  id: string;
  pageNo: number;
  bookNo: number;
  bookLabel: string;
  userId: string;
  status: string;
  snapshot: Record<string, unknown>;
}
