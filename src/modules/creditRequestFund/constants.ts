export const CREDIT_REQUEST_FUND_PATHS = {
  list: '/credit-request-fund',
  create: '/credit-request-fund/create',
  edit: (id: string) => `/credit-request-fund/edit/${id}`,
} as const;

export const CREDIT_REQUEST_FUND_LABELS = {
  title: 'Credit Request Fund',
  create: 'Create Credit Request Fund',
  edit: 'Edit Credit Request Fund',
  view: 'Credit Request Fund Details',
  description: 'Request recognition of customer funds deposited at another branch',
  add: 'Add Credit Request Fund',
  empty: 'No credit request fund records found.',
  approve: 'Approve',
  reject: 'Reject',
  cancel: 'Cancel Request',
  rejectionRemarks: 'Rejection Remarks',
  destinationBranch: 'Destination Branch',
  linkedVouchers: 'Linked Vouchers',
  destinationReceipt: 'Destination Receipt',
  requestingReceipt: 'Requesting Receipt',
  requestingPayment: 'Requesting Payment',
  save: 'Save Credit Request Fund',
  back: 'Back',
  number: 'Number',
  transactionDate: 'Date',
  branch: 'Branch',
  party: 'Party',
  amount: 'Amount',
  status: 'Status',
  actions: 'Actions',
  viewAction: 'View',
  searchPlaceholder: 'Search number or narration',
  dateFrom: 'From Date',
  dateTo: 'To Date',
  allStatuses: 'All Statuses',
  allBranches: 'All Branches',
  allParties: 'All Parties',
  entityType: 'Entity Type',
  partyCode: 'Party Code',
  partyName: 'Party Name',
  accountType: 'A/C Type',
  accountCode: 'A/C Code',
  accountName: 'A/C Name',
  paymentMode: 'Payment Mode',
  chequeNumber: 'Cheque Number',
  chequeDate: 'Cheque Date',
  chequeBranch: 'Branch',
  drawnOn: 'Drawn On',
  remark: 'Remark',
  narration: 'Narration',
  paidByPanNumber: 'Paid By PAN',
  paidByPanName: 'Paid By Name',
  paidByPanDob: 'Paid By DOB',
  panHolderRelation: 'Relation',
  travelerPanNumber: 'Traveler PAN',
  travelerPanName: 'Traveler Name',
  travelerPanDob: 'Traveler DOB',
  transactionNumber: 'Transaction Number',
  addItem: 'Add Item',
  totalDebit: 'Total Debit',
  totalCredit: 'Total Credit',
  finalAmount: 'Final Amount',
  rejectTitle: 'Reject Credit Request Fund',
  rejectDescription: 'Enter remarks explaining why this request is rejected.',
  rejectConfirm: 'Confirm Rejection',
  rejectCancel: 'Cancel',
  approving: 'Approving...',
  rejecting: 'Rejecting...',
  cancelling: 'Cancelling...',
  pendingReadonly: 'This request is read-only.',
  pendingEditable: 'Pending — you can edit this request.',
  approvedReadonly: 'Approved — linked vouchers are shown below.',
  rejectedReadonly: 'Rejected',
  cancelledReadonly: 'Cancelled',
  panVerifyIncomplete:
    'Enter PAN number, name, and DOB, then press Enter to verify.',
  panVerifyChecking: 'Verifying PAN details...',
  panVerifySuccess: 'PAN details verified successfully',
  panVerifyFailed:
    'PAN verification failed. Please review the entered details.',
  electronicPaymentHint:
    'Cheque number is not required for bank payment modes.',
  formValidationError: 'Please correct the highlighted fields.',
  destinationDiffers:
    'Destination branch must be different from the requesting branch',
} as const;

export const CREDIT_REQUEST_FUND_STATUS = {
  PENDING: 'PENDING',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  CANCELLED: 'CANCELLED',
} as const;

export type CreditRequestFundStatus =
  (typeof CREDIT_REQUEST_FUND_STATUS)[keyof typeof CREDIT_REQUEST_FUND_STATUS];

export const CREDIT_REQUEST_FUND_STATUS_OPTIONS = [
  { value: CREDIT_REQUEST_FUND_STATUS.PENDING, label: 'Pending' },
  { value: CREDIT_REQUEST_FUND_STATUS.APPROVE, label: 'Approved' },
  { value: CREDIT_REQUEST_FUND_STATUS.REJECT, label: 'Rejected' },
  { value: CREDIT_REQUEST_FUND_STATUS.CANCELLED, label: 'Cancelled' },
] as const;

export const createCreditRequestFundIdempotencyKey = () =>
  `crf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
