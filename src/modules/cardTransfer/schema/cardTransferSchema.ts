import * as yup from 'yup';

export const cardTransferSchema = yup.object({
  transferType: yup.mixed<'SELL' | 'PURCHASE'>().oneOf(['SELL', 'PURCHASE']).required('Transfer type is required'),
  sourceBranchId: yup.string().required('Source HO branch is required'),
  sourceCounterId: yup.string().required('Source counter is required'),
  destinationBranchId: yup.string().required('Destination branch is required'),
  transactionDate: yup.string().required('Transaction date is required'),
  sellTransactionNumber: yup.string().required('Sell transaction number is required'),
  purchaseTransactionNumber: yup.string().optional(),
  remarks: yup.string().max(500, 'Remarks cannot exceed 500 characters').optional(),
  items: yup.array().of(yup.object({
    currencyId: yup.string().required('Currency is required'),
    per: yup.string().required('Per is required').test('positive', 'Per must be greater than zero', value => Number(value) > 0),
    productId: yup.string().required('Product is required'),
    issuerPartyProfileId: yup.string().required('Issuer is required'),
    feAmount: yup.string().required(),
    cards: yup.array().min(1, 'Select at least one card').required('Cards are required'),
  })).min(1, 'Add at least one transfer item').required(),
});

