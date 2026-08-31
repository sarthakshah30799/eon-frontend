import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Form,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  FormFieldCategoryOption,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { useAuth } from '@/lib/AuthContext';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import type { Resolver } from 'react-hook-form';
import {
  useCreateManualBillBook,
  useGetManualBillBook,
  useGetNextManualBillBookNumber,
  useLoadManualBillBookBranchManagers,
  useReassignManualBillBookDispatch,
  useLoadManualBillBookCounterProfiles,
  useValidateManualBillBookBookRange,
  useValidateManualBillBookPageRange,
} from '../hooks';
import type { IBulkDispatchFormValues } from '../types';

const getBulkDispatchSchema = (
  validateBookRange: (
    bookNoFrom: number,
    bookNoTo: number
  ) => Promise<{ valid: boolean; error?: string }>,
  validatePageRange: (
    mvNoFrom: number,
    mvNoTo: number
  ) => Promise<{ valid: boolean; error?: string }>
) =>
  yup.object().shape({
    dispatchDate: yup.string().required('Date is required'),
    branchId: yup.string().required('Branch is required'),
    transactionType: yup.string().required('Transaction Type is required'),
    bookNoFrom: yup
      .number()
      .typeError('Must be a number')
      .integer()
      .positive()
      .required('Book No. From is required')
      .test(
        'book-range-overlap',
        'Book range overlaps',
        async function (value) {
          const { bookNoTo } = this.parent;
          if (
            value === undefined ||
            value === null ||
            isNaN(value) ||
            bookNoTo === undefined ||
            bookNoTo === null ||
            isNaN(bookNoTo)
          )
            return true;
          try {
            const res = await validateBookRange(value, bookNoTo);
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
        }
      ),
    bookNoTo: yup
      .number()
      .typeError('Must be a number')
      .integer()
      .positive()
      .min(yup.ref('bookNoFrom'), 'Book No. To must be >= Book No. From')
      .required('Book No. To is required'),
    vouchersPerBook: yup
      .number()
      .typeError('Must be a number')
      .integer()
      .positive()
      .min(1, 'Must be at least 1')
      .required('No Of Voucher Per Book is required'),
    mvNoFrom: yup
      .number()
      .typeError('Must be a number')
      .integer()
      .positive()
      .required('MV No. From is required')
      .test(
        'page-range-overlap',
        'Page range overlaps',
        async function (value) {
          const { mvNoTo } = this.parent;
          if (
            value === undefined ||
            value === null ||
            isNaN(value) ||
            !mvNoTo ||
            isNaN(parseInt(mvNoTo, 10))
          )
            return true;
          try {
            const res = await validatePageRange(value, parseInt(mvNoTo, 10));
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
        }
      ),
    mvNoTo: yup.string(),
    assignedTo: yup.string().required('Assigned To is required'),
    remarks: yup.string().optional(),
  });

interface BulkDispatchFormProps {
  onSuccess: () => void;
  reassignId?: string;
}

interface BulkDispatchFormFieldsProps {
  reassignId?: string;
}

const BulkDispatchFormFields = ({
  reassignId,
}: BulkDispatchFormFieldsProps) => {
  const form = useFormContext<IBulkDispatchFormValues>();
  const { user, activeBranchId } = useAuth();
  const canSelectBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const branchId = useWatch({ name: 'branchId', control: form.control });

  const { data: book } = useGetManualBillBook(reassignId);
  const getNextNumber = useGetNextManualBillBookNumber();
  const loadBranchesRaw = useLoadBranchOptions({ activeOnly: true });
  const loadAssignedToRaw = useLoadManualBillBookBranchManagers();

  // Pre-fill form with rejected book data in reassign mode
  useEffect(() => {
    if (!book) return;
    const assignedToId =
      book.assignedTo && typeof book.assignedTo === 'object'
        ? book.assignedTo.id
        : (book.assignedTo as string);
    form.reset({
      dispatchDate: book.dispatchDate,
      no: book.no,
      branchId: book.branchId || activeBranchId || '',
      transactionType: book.transactionType,
      bookNoFrom: String(book.bookNoFrom),
      bookNoTo: String(book.bookNoTo),
      vouchersPerBook: book.vouchersPerBook,
      mvNoFrom: String(book.mvNoFrom),
      mvNoTo: String(book.mvNoTo),
      assignedTo: assignedToId,
      remarks: book.remarks || '',
    });
  }, [book, activeBranchId, form]);

  const dispatchDate = useWatch({
    name: 'dispatchDate',
    control: form.control,
  });
  const bookNoFrom = useWatch({ name: 'bookNoFrom', control: form.control });
  const bookNoTo = useWatch({ name: 'bookNoTo', control: form.control });
  const vouchersPerBook = useWatch({
    name: 'vouchersPerBook',
    control: form.control,
  });
  const mvNoFrom = useWatch({ name: 'mvNoFrom', control: form.control });

  useEffect(() => {
    const fetchNextNumber = async () => {
      if (branchId && dispatchDate) {
        try {
          const res = await getNextNumber(branchId, dispatchDate);
          form.setValue('no', res.nextNumber);
        } catch (err) {
          console.error('Failed to fetch next number', err);
          form.setValue('no', '');
        }
      } else {
        form.setValue('no', '');
      }
    };
    fetchNextNumber();
  }, [branchId, dispatchDate, form, getNextNumber]);

  useEffect(() => {
    const fromBook = parseInt(String(bookNoFrom), 10);
    const toBook = parseInt(String(bookNoTo), 10);
    const vpb = parseInt(String(vouchersPerBook), 10);
    const fromMv = parseInt(String(mvNoFrom), 10);

    if (!isNaN(fromBook) && !isNaN(toBook) && !isNaN(vpb) && !isNaN(fromMv)) {
      const numBooks = toBook - fromBook + 1;
      if (numBooks > 0) {
        const calculatedTo = fromMv + numBooks * vpb - 1;
        form.setValue('mvNoTo', String(calculatedTo));
      } else {
        form.setValue('mvNoTo', '');
      }
    } else {
      form.setValue('mvNoTo', '');
    }
  }, [bookNoFrom, bookNoTo, vouchersPerBook, mvNoFrom, form]);

  // Reset Assigned To when Branch changes in create mode.
  useEffect(() => {
    if (reassignId) return;
    form.setValue('assignedTo', '');
  }, [branchId, form, reassignId]);

  // Debounced trigger validation on dependent changes
  useEffect(() => {
    if (!bookNoFrom || !bookNoTo) return;
    const timer = setTimeout(() => {
      form.trigger('bookNoFrom');
    }, 500);
    return () => clearTimeout(timer);
  }, [bookNoFrom, bookNoTo, form]);

  const loadBranches = useCallback(
    async (inputValue: string, page = 1) => {
      const res = await loadBranchesRaw(inputValue, page);
      let options = res.options;
      if (!canSelectBranch) {
        options = options.filter(option => option.value === activeBranchId);
      }
      return {
        options,
        hasMore: canSelectBranch ? Boolean(res.hasMore) : false,
      };
    },
    [activeBranchId, canSelectBranch, loadBranchesRaw]
  );

  const loadAssignedTo = useCallback(
    async (inputValue: string) => {
      if (!branchId) {
        return { options: [], hasMore: false };
      }
      return await loadAssignedToRaw(branchId, inputValue);
    },
    [branchId, loadAssignedToRaw]
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FormFieldInput name="dispatchDate" label="Date" type="date" />
      <FormFieldInput
        name="no"
        label="NO"
        disabled
        placeholder="Auto-Generated"
      />
      <FormFieldSelect
        name="branchId"
        label="Branch"
        loadOptions={loadBranches}
        defaultOptions={true}
        pagination
        disabled={reassignId ? true : !canSelectBranch}
      />
      <FormFieldCategoryOption
        name="transactionType"
        label="Txn Type"
        code={CategoryOptionCodeEnum.Transaction}
        useValueAsId={true}
        isCreatable={false}
      />
      <FormFieldInput name="bookNoFrom" label="Book No. From" type="number" />
      <FormFieldInput name="bookNoTo" label="Book No. To" type="number" />
      <div className="md:col-span-2">
        <FormFieldInput
          name="vouchersPerBook"
          label="No Of Voucher Per Book"
          type="number"
        />
      </div>
      <FormFieldInput name="mvNoFrom" label="MV No. From" type="number" />
      <FormFieldInput name="mvNoTo" label="MV No. To" disabled />
      {branchId && (
        <FormFieldSelect
          key={branchId}
          name="assignedTo"
          label="Assigned To"
          loadOptions={loadAssignedTo}
        />
      )}
      <FormFieldTextarea name="remarks" label="Remarks" rows={3} />
    </div>
  );
};

export const BulkDispatchForm = ({
  onSuccess,
  reassignId,
}: BulkDispatchFormProps) => {
  const navigate = useNavigate();
  const { user, activeBranchId, activeCounterId, setWorkplace } = useAuth();
  const canSelectBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const { submitManualBillBook } = useCreateManualBillBook();
  const { mutateAsync: reassignDispatch } = useReassignManualBillBookDispatch();
  const loadCounterProfiles = useLoadManualBillBookCounterProfiles();

  const validateBookRange = useValidateManualBillBookBookRange();
  const validatePageRange = useValidateManualBillBookPageRange();

  const schema = useMemo(() => {
    return getBulkDispatchSchema(validateBookRange, validatePageRange);
  }, [validateBookRange, validatePageRange]);

  const isReassign = !!reassignId;

  const onCancel = () => {
    navigate('/manual-bill-books');
  };

  const handleSubmit = async (values: IBulkDispatchFormValues) => {
    if (isReassign && reassignId) {
      await reassignDispatch({
        id: reassignId,
        data: {
          assignedTo: values.assignedTo,
          remarks: values.remarks || undefined,
          dispatchDate: values.dispatchDate,
          transactionType: values.transactionType,
          bookNoFrom: Number(values.bookNoFrom),
          bookNoTo: Number(values.bookNoTo),
          vouchersPerBook: Number(values.vouchersPerBook),
          mvNoFrom: Number(values.mvNoFrom),
          mvNoTo: values.mvNoTo ? Number(values.mvNoTo) : undefined,
        },
      });
      toast.success('Dispatch reassigned and reset to Pending.');
      onSuccess();
    } else {
      if (canSelectBranch) {
        const counters = await loadCounterProfiles(values.branchId);
        const selectedCounterId =
          counters.find(counter => counter.isActive !== false)?.id ||
          activeCounterId ||
          '';

        if (!selectedCounterId) {
          toast.error('Please select a branch with an active counter.');
          return;
        }

        await setWorkplace(values.branchId, selectedCounterId);
      }
      await submitManualBillBook(values);
      onSuccess();
    }
  };

  const defaultValues = {
    dispatchDate: new Date().toISOString().slice(0, 10),
    no: '',
    branchId: canSelectBranch ? '' : activeBranchId || '',
    transactionType: '',
    bookNoFrom: '',
    bookNoTo: '',
    vouchersPerBook: 50,
    mvNoFrom: '',
    mvNoTo: '',
    assignedTo: '',
    remarks: '',
  };

  return (
    <Form
      id="bulk-dispatch-form"
      onSubmit={handleSubmit}
      resolver={yupResolver(schema) as Resolver<IBulkDispatchFormValues>}
      defaultValues={defaultValues}
      mode="all"
      footer={{
        submitLabel: isReassign ? 'Reassign' : 'Create',
        onBackClick: () => {
          void onCancel();
        },
        onCancel,
      }}
    >
      <BulkDispatchFormFields reassignId={reassignId} />
    </Form>
  );
};
