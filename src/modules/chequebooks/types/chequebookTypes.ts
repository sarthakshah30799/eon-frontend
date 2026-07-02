export const ChequeBookStatusEnum = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type ChequeBookStatus =
  (typeof ChequeBookStatusEnum)[keyof typeof ChequeBookStatusEnum];
