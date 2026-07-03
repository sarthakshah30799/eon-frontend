export const ManualBillBookStatusEnum = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const;

export type ManualBillBookStatus =
  (typeof ManualBillBookStatusEnum)[keyof typeof ManualBillBookStatusEnum];

export type ManualBillBookReviewStatus = Exclude<
  ManualBillBookStatus,
  typeof ManualBillBookStatusEnum.PENDING
>;
