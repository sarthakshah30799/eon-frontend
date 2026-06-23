import * as yup from 'yup';

export const partyProfileSchema = yup.object({
  dateOfIntro: yup.string().trim().optional(),
  code: yup
    .string()
    .trim()
    .required('Code is required')
    .min(4, 'Code must be at least 4 characters')
    .max(20, 'Code must be at most 20 characters'),
  name: yup
    .string()
    .trim()
    .required('Name is required'),
  isIndividual: yup.boolean().default(false),

  creditLimit: yup.number().typeError('Credit Limit must be a number').min(-1, 'Credit Limit cannot be less than -1').optional().nullable(),
  creditDays: yup.number().integer('Credit Days must be an integer').typeError('Credit Days must be a number').min(-1, 'Credit Days cannot be less than -1').optional().nullable(),
  temporaryCreditLimit: yup.number().typeError('Temporary Credit Limit must be a number').min(-1, 'Temporary Credit Limit cannot be less than -1').optional().nullable(),
  temporaryCreditDays: yup.number().integer('Temporary Credit Days must be an integer').typeError('Temporary Credit Days must be a number').min(-1, 'Temporary Credit Days cannot be less than -1').optional().nullable(),
  permanentCreditLimit: yup.number().typeError('Permanent Credit Limit must be a number').min(-1, 'Permanent Credit Limit cannot be less than -1').optional().nullable(),
  permanentCreditDays: yup.number().integer('Permanent Credit Days must be an integer').typeError('Permanent Credit Days must be a number').min(-1, 'Permanent Credit Days cannot be less than -1').optional().nullable(),

  address1: yup.string().trim().required('Address Line 1 is required'),
  address2: yup.string().trim().optional().nullable(),
  address3: yup.string().trim().optional().nullable(),
  city: yup.string().trim().required('City is required'),
  pinCode: yup.string().trim().required('Pin Code is required'),

  kycApprovalNumber: yup.string().trim().optional().nullable(),
  kycRiskCategory: yup.string().trim().optional().nullable(),
  chqTrxnLimit: yup.number().typeError('Chq Trxn Limit must be a number').min(-1, 'Chq Trxn Limit cannot be less than -1').optional().nullable(),
  defaultHandlingCharges: yup.number().typeError('Handling Charges must be a number').optional().nullable(),
  defaultAgent: yup.string().trim().optional().nullable(),

  phoneNo: yup.string().trim().optional().nullable(),

  blockDateFrom: yup.string().trim().optional().nullable(),
  establishmentDate: yup.string().trim().optional().nullable(),
  remarks: yup.string().trim().optional().nullable(),
  email: yup.string().trim().email('Must be a valid email').optional().nullable(),
  contactName: yup.string().trim().optional().nullable(),
  designation: yup.string().trim().optional().nullable(),
  group: yup.string().trim().optional().nullable(),
  entityType: yup.string().trim().optional().nullable(),
  panName: yup.string().trim().optional().nullable(),
  panDob: yup.string().trim().optional().nullable(),
  panNo: yup
    .string()
    .trim()
    .optional()
    .nullable()
    .test('pan-format', 'PAN No must be a valid 10-character Indian PAN', value => {
      if (!value) return true;
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value);
    }),
  marketingExecutive: yup.string().trim().optional().nullable(),
  businessNature: yup.string().trim().optional().nullable(),
  isTdsDeducted: yup.boolean().default(false),
  tds: yup.string().trim().optional().nullable(),
  tdsGroup: yup.string().trim().optional().nullable(),
  active: yup.boolean().default(false),
  isActive: yup.boolean().default(false),
  printAddress: yup.boolean().default(false),
  eefcClient: yup.boolean().default(false),
  sale: yup.boolean().default(false),
  purchase: yup.boolean().default(false),
  applyTax: yup.boolean().default(false),
  igstOnly: yup.boolean().default(false),
  gstNo: yup.string().trim().optional().nullable(),
  sgstNo: yup.string().trim().optional().nullable(),
  igstNo: yup.string().trim().optional().nullable(),
  gstStateId: yup.string().trim().optional().nullable(),

  originBranchId: yup.string().trim().optional().nullable(),
  location: yup.string().trim().optional().nullable(),
  webSite: yup.string().trim().optional().nullable(),
  accountHolderName: yup.string().trim().optional().nullable(),
  bankName: yup.string().trim().optional().nullable(),
  accountNumber: yup.string().trim().optional().nullable(),
  ifscCode: yup.string().trim().optional().nullable(),
  bankBranchName: yup.string().trim().optional().nullable(),
  cancelledChequeCopy: yup.string().trim().optional().nullable(),
  rejectReason: yup.string().trim().optional().nullable(),
  ffmcRegNo: yup.string().trim().optional().nullable(),
  ffmcRegDate: yup.string().trim().optional().nullable(),
});

export default partyProfileSchema;
