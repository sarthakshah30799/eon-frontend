import * as yup from 'yup';

const decimalStringSchema = yup
  .string()
  .trim()
  .test('decimal', 'Must be a valid decimal number', value => {
    if (!value) return true;
    return /^\d+(\.\d+)?$/.test(value);
  });

const decimalPlaces = (maxDecimals: number) => {
  return (value: string | undefined) => {
    if (!value) return true;
    const parts = value.split('.');
    if (parts.length < 2) return true;
    return parts[1].length <= maxDecimals;
  };
};

export const ad1Schema = yup.object({
  transactionType: yup.string().trim().required('Type is required'),
  profileType: yup.string().trim().required('Profile Type is required'),
  branchId: yup.string().trim().required('Branch is required'),
  dealId: yup.string().trim().default(''),
  docNo: yup.string().trim().required('Doc No. is required'),
  transactionDate: yup.string().trim().required('Transaction Date is required'),
  marketingId: yup.string().trim().default(''),
  segmentId: yup.string().trim().default(''),
  servicedById: yup.string().trim().default(''),
  servicedBy: yup.string().trim().required('Serviced By is required'),
  purposeId: yup.string().trim().required('Purpose is required'),
  remitterName: yup.string().trim().required('Remitter Name is required'),
  contactNo: yup.string().trim().default(''),
  email: yup.string().trim().email('Must be a valid email').default(''),
  address: yup.string().trim().default(''),
  pan: yup
    .string()
    .trim()
    .required('Pan is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'PAN No must be a valid 10-character Indian PAN'),
  dateOfBirth: yup
    .string()
    .trim()
    .required('Date of birth is required')
    .test('dob-18-plus', 'DOB must be at least 18 years old', value => {
      if (!value) return true;
      const dob = new Date(value);
      const today = new Date();
      const minDob = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      dob.setHours(0, 0, 0, 0);
      minDob.setHours(0, 0, 0, 0);
      return dob <= minDob;
    }),
  productId: yup.string().trim().required('Product is required'),
  beneficiaryName: yup.string().trim().required('Beneficiary Name is required'),
  beniAddress: yup.string().trim().required('Beneficiary Address is required'),
  beneAccountNumber: yup.string().trim().required('Beneficiary Account Number is required'),
  beneBankName: yup.string().trim().required('Beneficiary Bank Name is required'),
  swiftCode: yup.string().trim().required('Swift Code is required'),
  relationshipId: yup.string().trim().required('Relationship is required'),
  currencyId: yup.string().trim().required('Currency Code is required'),
  
  // 7 Decimals
  fcVolume: decimalStringSchema
    .required('FC Volume is required')
    .test('decimals', 'Must have up to 7 decimal places', decimalPlaces(7)),
  saleRate: decimalStringSchema
    .required('Sale Rate is required')
    .test('decimals', 'Must have up to 7 decimal places', decimalPlaces(7)),
    
  // 2 Decimals
  totalInrAmt: decimalStringSchema
    .required('Total INR Amt is required')
    .test('decimals', 'Must have up to 2 decimal places', decimalPlaces(2)),
  gst: decimalStringSchema
    .default('0')
    .test('decimals', 'Must have up to 2 decimal places', decimalPlaces(2)),
  bankCharges: decimalStringSchema
    .default('0')
    .test('decimals', 'Must have up to 2 decimal places', decimalPlaces(2)),
  tcs: decimalStringSchema
    .default('0')
    .test('decimals', 'Must have up to 2 decimal places', decimalPlaces(2)),
  otherIncome: decimalStringSchema
    .default('0')
    .test('decimals', 'Must have up to 2 decimal places', decimalPlaces(2)),
  finalAmount: decimalStringSchema
    .required('Final Amount is required')
    .test('decimals', 'Must have up to 2 decimal places', decimalPlaces(2)),
  settlementRate: decimalStringSchema
    .required('Settlement Rate is required')
    .test('decimals', 'Must have up to 2 decimal places', decimalPlaces(2)),
    
  grossRevenue: decimalStringSchema.default('0'),
  revenueReceivable: decimalStringSchema.default('0'),
  fxRefAgentId: yup.string().trim().default(''),
  commGivenId: yup.string().trim().default(''),
  commPercentOnFe: decimalStringSchema.default('0'),
  agentComm: decimalStringSchema.default('0'),
  tds: decimalStringSchema.default('0'),
  commissionPayable: decimalStringSchema.default('0'),
  netRevenue: decimalStringSchema.default('0'),
  bankNameId: yup.string().trim().required('Bank Name is required'),
  rtgsImpsNeftRefNo: yup.string().trim().default(''),
  remarks: yup.string().trim().default(''),
});
