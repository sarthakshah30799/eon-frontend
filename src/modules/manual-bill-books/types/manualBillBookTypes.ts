export const ManualBillBookStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ManualBillBookStatus =
  (typeof ManualBillBookStatusEnum)[keyof typeof ManualBillBookStatusEnum];

export type ManualBillBookReviewStatus = Exclude<
  ManualBillBookStatus,
  typeof ManualBillBookStatusEnum.PENDING
>;
