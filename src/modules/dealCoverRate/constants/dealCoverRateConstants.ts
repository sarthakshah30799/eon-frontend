import { DealCoverStatus } from '@/api/dealCoverRate';

export const TT_PRODUCT_CODE = 'TT';

export const DEAL_COVER_RATE_TEXT = {
  title: 'Deal Cover Rate',
  description: 'Create and manage TT deal cover rates pending acknowledgement.',
  empty: 'No deal cover rates found.',
  createTitle: 'Create Deal Cover Rate',
  createDescription:
    'Capture deal details. Deal rate is locked from the product sale margin.',
  editTitle: 'Edit Deal Cover Rate',
  viewTitle: 'Deal Cover Rate',
  readonlyDescription: 'Only PENDING deals can be edited or cancelled.',
  newDeal: 'New Deal Cover Rate',
  submit: 'Save Deal',
  update: 'Update Deal',
  cancel: 'Cancel Deal',
  back: 'Back',
  close: 'Close',
  confirm: 'Confirm',
  view: 'View',
  edit: 'Edit',
  created: 'Deal cover rate created.',
  updated: 'Deal cover rate updated.',
  cancelled: 'Deal cover rate cancelled.',
  notFound: 'Deal cover rate not found.',
  cancelConfirm: 'Cancel this pending deal cover rate?',
  detailsHeading: 'Deal Details',
  passengerHeading: 'Passenger',
  passengerSelectPartyFirst: 'Select a party profile to load passenger details.',
  passengerFromProfile:
    'Passenger details are taken from the selected party profile and cannot be edited.',
  passengerIndividualHint:
    'Enter PAN or passport to look up an existing passenger. If none is found, details are saved as a new passenger on this deal.',
  passengerFound: 'Existing passenger found and applied.',
  passengerNew: 'No existing passenger found. Continue with new passenger details.',
  passengerLookingUp: 'Looking up passenger…',
  passengerLookupFailed: 'Passenger lookup failed. Continue as a new passenger.',
  passengerLinked: 'linked',
  branch: 'Branch',
  selectBranch: 'Select branch',
  transactionDate: 'Transaction Date',
  bankAccount: 'Bank Account',
  selectBank: 'Select bank ledger account',
  product: 'Product',
  selectProduct: 'Select product',
  partyType: 'Party Type',
  selectPartyType: 'Select party type',
  party: 'Party Profile',
  selectParty: 'Select party profile',
  marketingExecutive: 'Marketing Executive',
  selectMarketingExecutive: 'Select marketing executive',
  purpose: 'Purpose',
  subpurpose: 'Subpurpose',
  selectSubpurpose: 'Select subpurpose',
  currency: 'Currency',
  selectCurrency: 'Select currency',
  issuer: 'Issuer',
  selectIssuer: 'Select issuer',
  feAmount: 'FE Amount',
  dealRate: 'Deal Rate',
  inrAmount: 'INR Amount',
  fbChargeAmount: 'FB Charge Amount',
  narration: 'Narration',
  maturity: 'Maturity',
  selectMaturity: 'Select maturity',
  passengerName: 'Passenger Name',
  passengerPan: 'PAN',
  passengerPanHolder: 'PAN Holder',
  passengerPanDob: 'PAN DOB',
  passengerPassport: 'Passport',
  status: 'Status',
  dealNo: 'Deal No',
  transactionNumber: 'Transaction No',
  bookingRate: 'Booking Rate',
  actions: 'Actions',
  rejectionReason: 'Rejection Reason',
} as const;

export const DEAL_COVER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: DealCoverStatus.PENDING, label: 'Pending' },
  { value: DealCoverStatus.APPROVED, label: 'Approved' },
  { value: DealCoverStatus.REJECTED, label: 'Rejected' },
  { value: DealCoverStatus.CANCELLED, label: 'Cancelled' },
] as const;

export const DEAL_COVER_STATUS_FILTER_OPTIONS = DEAL_COVER_STATUS_OPTIONS.map(
  option => ({
    value: option.value,
    label: option.label,
  })
);

const DEAL_COVER_STATUS_SET = new Set<string>(
  Object.values(DealCoverStatus)
);

export const readDealCoverStatusFromSearchParams = (
  searchParams: URLSearchParams
): DealCoverStatus | undefined => {
  const raw = searchParams.get('status')?.trim();
  if (!raw || raw === 'ALL') {
    return undefined;
  }
  return DEAL_COVER_STATUS_SET.has(raw)
    ? (raw as DealCoverStatus)
    : undefined;
};

export const resolveDealCoverStatusDropdownValue = (
  status: DealCoverStatus | undefined
) => {
  const selected = status ?? 'ALL';
  return (
    DEAL_COVER_STATUS_FILTER_OPTIONS.find(option => option.value === selected) ??
    DEAL_COVER_STATUS_FILTER_OPTIONS[0]
  );
};
