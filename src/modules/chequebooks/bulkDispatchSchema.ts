import * as yup from 'yup';

export const bulkDispatchSchema = yup.object().shape({
  dispatchDate: yup.string().required('Date is required'),
  branchId: yup.string().required('Branch is required'),
  transactionType: yup.string().required('Transaction Type is required'),
  bookNoFrom: yup
    .number()
    .typeError('Must be a number')
    .integer()
    .positive()
    .required('Check Book No. From is required'),
  bookNoTo: yup
    .number()
    .typeError('Must be a number')
    .integer()
    .positive()
    .min(
      yup.ref('bookNoFrom'),
      'Check Book No. To must be >= Check Book No. From'
    )
    .required('Check Book No. To is required'),
  vouchersPerBook: yup
    .number()
    .typeError('Must be a number')
    .integer()
    .positive()
    .min(1, 'Must be at least 1')
    .required('No Of Leaf Per Book is required'),
  mvNoFrom: yup
    .number()
    .typeError('Must be a number')
    .integer()
    .positive()
    .required('Cheque No. From is required'),
  mvNoTo: yup.string(),
  assignedTo: yup.string().required('Assigned To is required'),
  remarks: yup.string().optional(),
});
