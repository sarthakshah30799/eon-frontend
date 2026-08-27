export * from './transferHooksUtils';
export * from './transferPermissionUtils';
export const getTransferNumberSeriesCode = (
  transferType: import('../types').TransferType
) =>
  transferType === 'BRANCH' ? 'BRANCH_TRANSFER_SELL' : 'COUNTER_TRANSFER_SELL';
export * from './transferFormUtils';
export * from './transferPrintUtils';
