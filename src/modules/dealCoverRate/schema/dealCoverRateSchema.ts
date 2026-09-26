import * as yup from 'yup';

export const dealCoverRateSchema = yup.object({
  branchId: yup.string().required('Branch is required'),
  transactionDate: yup.string().required('Transaction date is required'),
  bankAccountProfileId: yup.string().required('Bank account is required'),
  productId: yup.string().required('Product is required'),
  partyProfileType: yup.string().required('Party type is required'),
  partyProfileId: yup.string().required('Party profile is required'),
  marketingExecutiveId: yup.string().optional(),
  passengerName: yup.string().trim().required('Passenger name is required'),
  passengerId: yup.string().optional(),
  passengerPan: yup.string().optional(),
  passengerPanHolder: yup.string().optional(),
  passengerPanDob: yup.string().optional(),
  passengerPassport: yup.string().optional(),
  purposeId: yup.string().required('Purpose is required'),
  subpurposeId: yup.string().optional(),
  currencyId: yup.string().required('Currency is required'),
  issuerPartyProfileId: yup.string().required('Issuer is required'),
  feAmount: yup
    .string()
    .required('FE amount is required')
    .test('positive', 'FE amount must be greater than zero', value =>
      Number(value) > 0
    ),
  dealRate: yup
    .string()
    .required('Deal rate is required')
    .test('positive', 'Deal rate must be greater than zero', value =>
      Number(value) > 0
    ),
  inrAmount: yup.string().required('INR amount is required'),
  fbChargeAmount: yup.string().optional(),
  narration: yup.string().max(500).optional(),
  maturityOptionId: yup.string().required('Maturity is required'),
});
