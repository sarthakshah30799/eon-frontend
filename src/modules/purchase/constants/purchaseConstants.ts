export const PURCHASE_PAGE_STATUS_TEXT = {
  pageNotFound: 'This purchase page was not found.',
  transactionPageNotFound: 'This transaction page was not found.',
  transactionNotFound: 'Transaction not found.',
} as const;

export const PURCHASE_WORKPLACE_TEXT = {
  branchLabel: 'Branch',
  counterLabel: 'Counter',
  selectBranch: 'Select branch',
  selectCounter: 'Select counter',
  selectBranchFirst: 'Select branch first',
  noCountersForBranch: 'No counters for this branch',
} as const;

export const PURCHASE_PRINT_TEXT = {
  partyName: 'Party Name',
  passportPassengerName: 'Passport Passenger Name',
  transactionDetails: 'Transaction Details',
  cardDetails: 'CARD Details',
  srNo: 'Sr. No.',
  currency: 'Currency',
  ex: 'EX',
  kitNumber: 'Kit Number',
  cardNumber: 'Card Number',
  quantity: 'Quantity',
  per: 'Per',
  rate: 'Rate',
  finalAmount: 'Final Amount',
  noItems: 'No items',
  noCardItems: 'No CARD items',
} as const;

export const PURCHASE_PREVIEW_TEXT = {
  loading: 'Loading...',
  gstSummaryHeading: 'GST Summary',
  tcsSummaryHeading: 'TCS Summary',
  submitBlockedWhileLoading:
    'Waiting for tax, TCS, purchase rule, and credit calculations to finish.',
} as const;

export const PURCHASE_RULE_TEXT = {
  heading: 'Purchase Rule',
  passed: 'Purchase rule check passed',
  failedFallback: 'Purchase rule check failed',
  fixBeforeSave: 'Fix these before saving:',
  cannotPunchTransactions:
    'Transactions cannot be punched for this date. Complete day start or check monthwise locking.',
  cdfRequired: (threshold: string, currency: string) =>
    `CDF declaration is required. This purchase, including history, has reached the CDF threshold of ${threshold} ${currency}. You will enter CDF details when you save.`,
  convertedAmount: 'Converted amount:',
  cashTotal: 'Cash total:',
  chequeTotal: 'Cheque total:',
  cashLimit: 'Cash limit:',
  cdfThreshold: 'CDF threshold:',
  historyAmount: 'History amount:',
} as const;

export const PURCHASE_CREDIT_TEXT = {
  heading: 'Credit Check',
  passed: 'Credit check passed',
  notConfigured:
    'Outstanding is allowed. Party credit limit/days are not configured.',
  failedFallback: 'Credit check failed',
  fixBeforeSave: 'Fix these before saving:',
  payableAmount: 'Payable amount:',
  totalPaid: 'Total paid:',
  currentOutstanding: 'Current outstanding:',
  existingOutstanding: 'Existing outstanding:',
  totalExposure: 'Total exposure:',
  availableCredit: 'Available credit:',
  applicableLimit: 'Applicable credit limit:',
  applicableDays: 'Applicable credit days:',
} as const;
