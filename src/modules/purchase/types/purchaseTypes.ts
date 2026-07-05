import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { ITransactionReferenceSnapshot } from '@/modules/transactions';
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
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';

export interface IPurchaseTransactionFormRow {
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  productId: string;
  productCode: string;
  productDescription: string;
  quantity: string;
  rate: string;
  total: string;
  roundOff: string;
  finalAmount: string;
}

export interface IPurchaseFormValues {
  purchasePageType: PurchasePageType | null;
  branchSnapshot: ITransactionReferenceSnapshot | null;
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
  partyProfileContactName: string;
  partyProfileApplyTax: boolean;
  agentProfileId: string;
  agentProfileCode: string;
  agentProfileName: string;
  manualBookReferenceType: 'CASHIER' | 'DELIVERY_BOY';
  manualBookId: string;
  manualBookNo: string;
  deliveryBoyUserId: string;
  deliveryBoyUserCode: string;
  deliveryBoyUserName: string;
  number: string;
  transactions: IPurchaseTransactionFormRow[];
  additionalCharges: ITransactionAdditionalChargeFormRow[];
  paymentDetails: ITransactionPaymentDetailFormRow[];
}

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
}

export interface IPurchasePricingData {
  currencies: ICurrencyProfile[];
  products: IPurchaseProductOption[];
  latestRates: import('@/modules/currencyRates/types/currencyRatesTypes').ICurrencyRate[];
  productCurrencyRates: import('@/modules/currencyRates/types/currencyRatesTypes').IProductCurrencyRate[];
}

export interface IPurchaseSubmitPayload {
  transaction: {
    number: string;
    slug: string;
    branchId: string;
    branchSnapshot: ITransactionReferenceSnapshot | null;
    requiresApproval: boolean;
    partyProfileId: string;
    agentProfileId?: string | null;
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
