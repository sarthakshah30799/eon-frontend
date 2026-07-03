import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type { IPartyProfile } from '@/modules/partyProfiles/types';
import type { ITransactionAdditionalChargeFormRow } from '@/components/forms';
import type { ITransactionPaymentDetailFormRow } from '@/components/forms';

export interface IBuyFromTransactionFormRow {
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

export interface IBuyFromDraftDocumentAttachment {
  documentProfileId: string;
  file: File;
}

export interface IBuyFromFormValues {
  partyProfileId: string;
  partyProfileCode: string;
  partyProfileName: string;
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
  transactions: IBuyFromTransactionFormRow[];
  additionalCharges: ITransactionAdditionalChargeFormRow[];
  paymentDetails: ITransactionPaymentDetailFormRow[];
}

export interface IBuyFromSelectedPartyProfile {
  id: string;
  code: string;
  name: string;
  type: string;
}

export interface IBuyFromSelectedCurrencyProfile {
  id: string;
  currencyCode: string;
  currencyName: string;
}

export interface IBuyFromProductOption {
  id: string;
  productCode: string;
  productDescription: string;
}

export interface IBuyFromPricingData {
  currencies: ICurrencyProfile[];
  products: IBuyFromProductOption[];
  latestRates: import('@/modules/currencyRates/types/currencyRatesTypes').ICurrencyRate[];
  productCurrencyRates: import('@/modules/currencyRates/types/currencyRatesTypes').IProductCurrencyRate[];
}

export interface IBuyFromPartyProfileResult extends IPartyProfile {
  rowKey?: string;
}
