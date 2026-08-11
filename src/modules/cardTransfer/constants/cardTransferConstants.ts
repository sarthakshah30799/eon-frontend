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
  sourceDescription: 'Cards are reserved from the selected HO branch and counter when submitted.',
} as const;
