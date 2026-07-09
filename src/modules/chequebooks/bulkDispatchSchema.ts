import * as yup from 'yup';
import { chequebookApi } from '@/api';
function debouncePromise<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<any> {
  let timer: NodeJS.Timeout | null = null;
  let activeResolve: ((value: any) => void) | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    if (activeResolve) activeResolve({ valid: true });

    return new Promise((resolve) => {
      activeResolve = resolve;
      timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch {
          resolve({ valid: true });
        }
      }, delay);
    });
  };
}

const debouncedValidateBookRange = debouncePromise(
  chequebookApi.validateBookRange,
  500
);

const debouncedValidatePageRange = debouncePromise(
  chequebookApi.validatePageRange,
  500
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
      const { branchId, bookNoTo } = this.parent;
      if (!branchId || value === undefined || value === null || isNaN(value) || bookNoTo === undefined || bookNoTo === null || isNaN(bookNoTo)) return true;
      try {
        const res = await debouncedValidateBookRange({
          branchId,
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
      if (value === undefined || value === null || isNaN(value) || !mvNoTo || isNaN(parseInt(mvNoTo, 10))) return true;
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
