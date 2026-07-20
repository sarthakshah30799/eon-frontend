import { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
} from '@/components/forms';
import { chequebookApi, counterProfileApi } from '@/api';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import {
  bulkDispatchSchema,
} from './bulkDispatchSchema';

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

const BulkDispatchFormFields = ({ reassignId }: BulkDispatchFormFieldsProps) => {
  const form = useFormContext();
  const { user, activeBranchId } = useAuth();
  const canSelectBranch = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const branchId = useWatch({ name: 'branchId' });
  const dispatchDate = useWatch({ name: 'dispatchDate' });
  const bookNoFrom = useWatch({ name: 'bookNoFrom' });
  const bookNoTo = useWatch({ name: 'bookNoTo' });
  const vouchersPerBook = useWatch({ name: 'vouchersPerBook' });
  const mvNoFrom = useWatch({ name: 'mvNoFrom' });
  const { data: branches = [] } = useListBranchProfiles({ activeOnly: true });

  // Pre-fill form when reassigning a rejected book
  useEffect(() => {
    if (!reassignId) return;
    chequebookApi.findById(reassignId).then(book => {
      const assignedToId = book.assignedTo && typeof book.assignedTo === 'object'
        ? book.assignedTo.id
        : (book.assignedTo as string) ?? '';
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
    }).catch(err => {
      console.error('Failed to pre-fill reassign data', err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reassignId, activeBranchId]);

  // Reset assignedTo when branchId changes in create mode.
  useEffect(() => {
    if (reassignId) return;
    form.setValue('assignedTo', '');
  }, [branchId, form, reassignId]);

  useEffect(() => {
    const fetchNextNumber = async () => {
      if (branchId && dispatchDate) {
        try {
          const res = await chequebookApi.getNextNumber(branchId, dispatchDate);
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
  }, [branchId, dispatchDate, form]);

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

  const branchOptions = useMemo(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [branches]
  );

  const visibleBranchOptions = useMemo(
    () =>
      canSelectBranch
        ? branchOptions
        : branchOptions.filter(option => option.value === activeBranchId),
    [activeBranchId, branchOptions, canSelectBranch]
  );

  const loadBranches = useCallback(
    async (inputValue: string) => ({
      options: inputValue
        ? visibleBranchOptions.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          )
        : visibleBranchOptions,
      hasMore: false,
    }),
    [visibleBranchOptions]
  );

  const loadBankAccounts = async (inputValue: string, page = 1) => {
    try {
      const response = await accountProfileApi.getAccountProfiles({
        page,
        limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
        search: inputValue,
        active: true,
      });
      const bankAccounts = (response.data || []).filter(acc => {
        return (
          (acc.bankNature && acc.bankNature.value !== 'NONE') ||
          (acc.accountType && acc.accountType.value === 'BANK LEDGER') ||
          (acc.financialCode && acc.financialCode === 'BANKBL')
        );
      });
      return {
        options: bankAccounts.map(acc => ({
          value: acc.id,
          label: `${acc.accountCode} - ${acc.accountName}`,
        })),
        hasMore: (response.data || []).length === ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
      };
    } catch {
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const loadAssignedTo = useCallback(async () => {
    if (!branchId) {
      return {
        options: [],
        hasMore: false,
      };
    }
    try {
      const managers = await chequebookApi.getBranchManagers(branchId);
      return {
        options: managers.map(m => ({
          value: m.id,
          label: m.name,
        })),
        hasMore: false,
      };
    } catch {
      return {
        options: [],
        hasMore: false,
      };
    }
  }, [branchId]);

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
        defaultOptions={visibleBranchOptions}
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

export const BulkDispatchForm = ({ onSuccess, reassignId }: BulkDispatchFormProps) => {
  const navigate = useNavigate();
  const { user, activeBranchId, activeCounterId, setWorkplace } = useAuth();
  const canSelectBranch = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);

  const onCancel = () => {
    navigate('/cheque-books');
  };

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
        await chequebookApi.reassignDispatch(reassignId, {
          assignedTo: formatted.assignedTo,
          dispatchDate: formatted.dispatchDate,
          bankAccountCode: formatted.bankAccountCode,
          bookNoFrom: formatted.bookNoFrom,
          bookNoTo: formatted.bookNoTo,
          vouchersPerBook: formatted.vouchersPerBook,
          mvNoFrom: formatted.mvNoFrom,
          remarks: formatted.remarks,
        });
        toast.success('ChequeBook dispatch reassigned successfully.');
      } else {
        if (canSelectBranch) {
          const counters = await counterProfileApi.getCounterProfiles({
            activeOnly: true,
            branchId: values.branchId,
          });
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
        await chequebookApi.create(formatted);
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
        yupResolver(bulkDispatchSchema) as unknown as Resolver<IBulkDispatchFormValues>
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
