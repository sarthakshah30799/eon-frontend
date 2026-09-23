import type {
  DealCoverRatePayload,
  DealCoverSnapshot,
  IDealCoverRate,
  DealCoverStatus,
} from '@/api/dealCoverRate';

export type DealCoverRateFormValues = {
  branchId: string;
  transactionDate: string;
  bankAccountProfileId: string;
  productId: string;
  partyProfileType: string;
  partyProfileId: string;
  marketingExecutiveId: string;
  passengerId: string;
  passengerName: string;
  passengerPan: string;
  passengerPanHolder: string;
  passengerPanDob: string;
  passengerPassport: string;
  purposeId: string;
  subpurposeId: string;
  currencyId: string;
  issuerPartyProfileId: string;
  feAmount: string;
  dealRate: string;
  inrAmount: string;
  fbChargeAmount: string;
  narration: string;
  maturityOptionId: string;
  status?: DealCoverStatus;
  dealNo?: string;
  bookingRate?: string;
  rejectionReason?: string;
  branchSnapshot?: DealCoverSnapshot | null;
  bankAccountProfileSnapshot?: DealCoverSnapshot | null;
  productSnapshot?: DealCoverSnapshot | null;
  partyProfileSnapshot?: DealCoverSnapshot | null;
  currencySnapshot?: DealCoverSnapshot | null;
  issuerPartyProfileSnapshot?: DealCoverSnapshot | null;
};

export type DealCoverRateFormProps = {
  initialValues: DealCoverRateFormValues;
  readOnly?: boolean;
  onSubmit: (values: DealCoverRateFormValues) => Promise<void> | void;
  footerActions?: React.ReactNode;
  submitLabel?: string;
};

export type { DealCoverRatePayload, IDealCoverRate, DealCoverStatus };
