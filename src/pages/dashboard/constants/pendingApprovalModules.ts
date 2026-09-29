export const PENDING_APPROVAL_ENTITY_TYPES = [
  'transfer',
  'card-transfer',
  'credit-request-fund',
  'party-profile',
  'transaction',
  'advice',
  'chequebook',
  'manual-book',
] as const;

export type PendingApprovalEntityType =
  (typeof PENDING_APPROVAL_ENTITY_TYPES)[number];

export const PENDING_APPROVAL_MODULE_LABELS: Record<
  PendingApprovalEntityType,
  string
> = {
  transfer: 'Branch Transfer',
  'card-transfer': 'CARD Transfer',
  'credit-request-fund': 'Credit Request Fund',
  'party-profile': 'Profile Approval',
  transaction: 'Transaction',
  advice: 'Advice',
  chequebook: 'Cheque Book',
  'manual-book': 'Manual Bill',
};

export const PENDING_APPROVALS_TITLE = 'Pending Requests';
export const PENDING_APPROVALS_EMPTY = 'No pending requests';
export const PENDING_APPROVALS_ITEMS_LABEL = 'items';
export const PENDING_STATUS_LABEL = 'Pending';
export const PENDING_APPROVALS_VIEW_LABEL = 'View details';
export const PENDING_APPROVALS_COLUMNS = {
  code: 'Reference',
  name: 'Details',
  type: 'Type',
  status: 'Status',
  createdAt: 'Created',
  actions: 'Action',
} as const;
