export const CARD_TRANSFER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'HELD', label: 'Held' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const CARD_TRANSFER_COPY = {
  listTitle: 'CARD Transfer Requests',
  listDescription: 'Review CARD transfer requests between branches.',
  createTitle: 'Create CARD Transfer',
  editTitle: 'CARD Transfer Request',
  sourceDescription:
    'Cards are reserved from the selected source branch when submitted.',
  loadingTransactionDate: 'Loading transaction date for selected branch...',
  loadingCards: 'Loading available cards from source branch...',
  validationFailed: 'Fix the highlighted transfer errors before submitting.',
  selectItemContextFirst:
    'Select product type, currency, and card issuer before choosing cards.',
  noMatchingCards:
    'No available cards match the selected product, currency, and issuer at this source branch.',
} as const;

export const CARD_TRANSFER_VALIDATION_TEXT = {
  selectAtLeastOneCard: 'Select at least one card',
  cardsMismatch:
    'Selected cards must match the item product, currency, and issuer',
  feAmountMismatch: 'FE amount must match the total of selected cards',
  branchesMustDiffer: 'Source and destination branches must be different',
} as const;
