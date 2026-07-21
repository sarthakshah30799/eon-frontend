export const TransactionProfileType = {
  AD1: 'AD1',
} as const;
export type TransactionProfileType = (typeof TransactionProfileType)[keyof typeof TransactionProfileType];
