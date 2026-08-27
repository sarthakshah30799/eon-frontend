import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
} from '@/components/forms';
import {
  useGetChequeBook,
  useGetNextChequeBookNumber,
  useLoadChequeBookBranchManagers,
  useLoadBankAccounts,
  useReassignChequeBookDispatch,
  useCreateChequeBook,
  useLoadBranchOptions,
  useLoadCounterProfilesForBranch,
} from './hooks';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { bulkDispatchSchema } from './bulkDispatchSchema';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;

interface IBulkDispatchFormValues {
  dispatchDate: string;
  no: string;
  branchId: string;
  bankAccountCode: string;
  bookNoFrom: string | number;
  bookNoTo: string | number;
  vouchersPerBook: string | number;
  mvNoFrom: string | number;
  mvNoTo: string;
  assignedTo: string;
  remarks: string;
}

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
  const form = useFormContext();
  const { user, activeBranchId } = useAuth();
  const canSelectBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const branchId = useWatch({ name: 'branchId' });
  const dispatchDate = useWatch({ name: 'dispatchDate' });
  const bookNoFrom = useWatch({ name: 'bookNoFrom' });
  const bookNoTo = useWatch({ name: 'bookNoTo' });
  const vouchersPerBook = useWatch({ name: 'vouchersPerBook' });
  const mvNoFrom = useWatch({ name: 'mvNoFrom' });

  const { data: book } = useGetChequeBook(reassignId);
  const getNextNumber = useGetNextChequeBookNumber();
  const loadAssignedToRaw = useLoadChequeBookBranchManagers();
  const loadBankAccounts = useLoadBankAccounts();
  const loadBranchesRaw = useLoadBranchOptions();

  // Pre-fill form when reassigning a rejected book
  useEffect(() => {
    if (!book) return;
    const assignedToId =
      book.assignedTo && typeof book.assignedTo === 'object'
        ? book.assignedTo.id
        : ((book.assignedTo as string) ?? '');
    form.setValue('dispatchDate', new Date().toISOString().slice(0, 10));
    form.setValue('branchId', book.branchId || activeBranchId || '');
    form.setValue('bankAccountCode', book.bankAccountCode ?? '');
    form.setValue('bookNoFrom', book.bookNoFrom ?? '');
    form.setValue('bookNoTo', book.bookNoTo ?? '');
    form.setValue('vouchersPerBook', book.vouchersPerBook ?? 50);
    form.setValue('mvNoFrom', book.mvNoFrom ?? '');
    form.setValue('remarks', book.remarks ?? '');
    // Set assignedTo after a tick so the reset-on-branchId effect has already fired
    setTimeout(() => form.setValue('assignedTo', assignedToId), 0);
  }, [book, activeBranchId, form]);

  // Reset assignedTo when branchId changes in create mode.
  useEffect(() => {
    if (reassignId) return;
    form.setValue('assignedTo', '');
  }, [branchId, form, reassignId]);

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
    const fromBook = parseInt(bookNoFrom, 10);
    const toBook = parseInt(bookNoTo, 10);
    const vpb = parseInt(vouchersPerBook, 10);
    const fromMv = parseInt(mvNoFrom, 10);

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

  const mvNoTo = useWatch({ name: 'mvNoTo' });
  // Validations are handled natively by yup schema test async callbacks

  // Debounced trigger validation on dependent changes
  useEffect(() => {
    if (!bookNoFrom || !bookNoTo) return;
    const timer = setTimeout(() => {
      form.trigger('bookNoFrom');
    }, 500);
    return () => clearTimeout(timer);
  }, [bookNoFrom, bookNoTo, form]);

  useEffect(() => {
    if (!mvNoFrom || !mvNoTo) return;
    const timer = setTimeout(() => {
      form.trigger('mvNoFrom');
    }, 500);
    return () => clearTimeout(timer);
  }, [mvNoFrom, mvNoTo, form]);

  const loadBranches = useCallback(
    async (inputValue: string) => {
      const res = await loadBranchesRaw(inputValue);
      let options = res.options;
      if (!canSelectBranch) {
        options = options.filter(option => option.value === activeBranchId);
      }
      return { options, hasMore: false };
    },
    [activeBranchId, canSelectBranch, loadBranchesRaw]
  );

  const loadAssignedTo = useCallback(
    async (inputValue: string) => {
      if (!branchId) {
        return { options: [], hasMore: false };
      }
      try {
        return await loadAssignedToRaw(branchId, inputValue);
      } catch {
        return { options: [], hasMore: false };
      }
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
        disabled={reassignId ? true : !canSelectBranch}
      />
      <FormFieldSelect
        name="bankAccountCode"
        label="Bank Account Code"
        loadOptions={loadBankAccounts}
        pagination
        pageSize={ACCOUNT_PROFILE_OPTION_PAGE_SIZE}
      />
      <FormFieldInput
        name="bookNoFrom"
        label="Check Book No. From"
        type="number"
      />
      <FormFieldInput name="bookNoTo" label="Check Book No. To" type="number" />
      <div className="md:col-span-2">
        <FormFieldInput
          name="vouchersPerBook"
          label="No Of Leaf Per Book"
          type="number"
        />
      </div>
      <FormFieldInput name="mvNoFrom" label="Cheque No. From" type="number" />
      <FormFieldInput name="mvNoTo" label="Cheque No. To" disabled />
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

  const onCancel = () => {
    navigate('/cheque-books');
  };

  const { mutateAsync: reassignDispatch } = useReassignChequeBookDispatch();
  const { mutateAsync: createChequeBook } = useCreateChequeBook();
  const loadCounterProfiles = useLoadCounterProfilesForBranch();

  const handleSubmit = async (values: IBulkDispatchFormValues) => {
    try {
      const { branchId, ...rest } = values;
      void branchId;
      const formatted = {
        ...rest,
        bookNoFrom: Number(rest.bookNoFrom),
        bookNoTo: Number(rest.bookNoTo),
        vouchersPerBook: Number(rest.vouchersPerBook),
        mvNoFrom: Number(rest.mvNoFrom),
      };
      if (reassignId) {
        await reassignDispatch({
          id: reassignId,
          data: {
            assignedTo: formatted.assignedTo,
            dispatchDate: formatted.dispatchDate,
            bankAccountCode: formatted.bankAccountCode,
            bookNoFrom: formatted.bookNoFrom,
            bookNoTo: formatted.bookNoTo,
            vouchersPerBook: formatted.vouchersPerBook,
            mvNoFrom: formatted.mvNoFrom,
            remarks: formatted.remarks,
          },
        });
        toast.success('ChequeBook dispatch reassigned successfully.');
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
        await createChequeBook(formatted);
        toast.success('ChequeBook record saved successfully.');
      }
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save chequebook.'
      );
    }
  };

  const defaultValues: IBulkDispatchFormValues = {
    dispatchDate: new Date().toISOString().slice(0, 10),
    no: '',
    branchId: canSelectBranch ? '' : activeBranchId || '',
    bankAccountCode: '',
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
      resolver={
        yupResolver(
          bulkDispatchSchema
        ) as unknown as Resolver<IBulkDispatchFormValues>
      }
      defaultValues={defaultValues}
      mode="all"
      footer={{
        submitLabel: 'Create',
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
