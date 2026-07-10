import * as yup from 'yup';
import { chequebookApi } from '@/api';
import { debouncePromise } from '@/hooks';

const debouncedValidateBookRange = debouncePromise(
  chequebookApi.validateBookRange,
  500,
  { valid: true }
);

const debouncedValidatePageRange = debouncePromise(
  chequebookApi.validatePageRange,
  500,
  { valid: true }
);

export const bulkDispatchSchema = yup.object().shape({
  dispatchDate: yup.string().required('Date is required'),
  branchId: yup.string().required('Branch is required'),
  bankAccountCode: yup.string().required('Bank Account Code is required'),
  bookNoFrom: yup
    .number()
    .typeError('Must be a number')
    .integer()
    .positive()
    .required('Check Book No. From is required')
    .test('book-range-overlap', 'Book range overlaps', async function (value) {
      const { bookNoTo } = this.parent;
      if (
        value === undefined ||
        value === null ||
        isNaN(value) ||
        bookNoTo === undefined ||
        bookNoTo === null ||
        isNaN(bookNoTo)
      ) {
        return true;
      }
      try {
        const res = await debouncedValidateBookRange({
          bookNoFrom: value,
          bookNoTo,
        });
        if (!res.valid) {
          throw this.createError({
            path: 'bookNoFrom',
            message: res.error || 'Book range overlaps',
          });
        }
        return true;
      } catch (err) {
        if (err && typeof err === 'object' && 'path' in err) {
          throw err;
        }
        return true;
      }
    }),
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
    .required('Cheque No. From is required')
    .test('page-range-overlap', 'Page range overlaps', async function (value) {
      const { mvNoTo } = this.parent;
      if (
        value === undefined ||
        value === null ||
        isNaN(value) ||
        !mvNoTo ||
        isNaN(parseInt(mvNoTo, 10))
      ) {
        return true;
      }
      try {
        const res = await debouncedValidatePageRange({
          mvNoFrom: value,
          mvNoTo: parseInt(mvNoTo, 10),
        });
        if (!res.valid) {
          throw this.createError({
            path: 'mvNoFrom',
            message: res.error || 'Page range overlaps',
          });
        }
        return true;
      } catch (err) {
        if (err && typeof err === 'object' && 'path' in err) {
          throw err;
        }
        return true;
      }
    }),
  mvNoTo: yup.string(),
  assignedTo: yup.string().required('Assigned To is required'),
  remarks: yup.string().optional(),
});
