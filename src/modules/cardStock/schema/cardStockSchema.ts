import * as yup from 'yup';

const futureDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const cardStockSchema = yup.object({
  transactionNumber: yup.string().optional(),
  receiptDate: yup.string().required('Receipt date is required'),
  issuerPartyProfileId: yup.string().required('Card issuer is required'),
  hoBranchId: yup.string().required('HO branch is required'),
  counterId: yup.string().required('Counter is required'),
  totalFeAmount: yup.string().required(),
  items: yup.array().of(yup.object({
    currencyId: yup.string().required('Currency is required'),
    per: yup.string().required('Per is required').test('positive', 'Per must be greater than zero', value => Number(value) > 0),
    productId: yup.string().required('Product is required'),
    issuerPartyProfileId: yup.string().required('Issuer is required'),
    feAmount: yup.string().required(),
    cards: yup.array().of(yup.object({
      series: yup.string().matches(/^[A-Za-z0-9]{6}$/, 'Series must be exactly 6 alphanumeric characters (for example, CC0000)').required('Series is required'),
      quantity: yup.string().oneOf(['1'], 'Quantity must be 1').required(),
      kitNumber: yup.string().trim().required('Kit number is required'),
      cardNumber: yup.string().trim().required('Card number is required'),
      denomination: yup.string().test('positive', 'Denomination must be greater than zero', value => Number(value) > 0).required('Denomination is required'),
      amount: yup.string().required(),
      expirationDate: yup.string().required('Expiration date is required').test('future', 'Expiration date must be in the future', value => Boolean(value && new Date(`${value}T00:00:00`) > futureDate())),
    })).min(1, 'At least one card is required').required(),
  })).min(1, 'At least one item is required').required(),
});
