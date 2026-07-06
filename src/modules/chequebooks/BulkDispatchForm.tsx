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
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { chequebookApi } from '@/api';
import { accountProfileApi } from '@/api/accountProfile/accountProfile.api';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';
import {
  bulkDispatchSchema,
} from './bulkDispatchSchema';

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
}

const BulkDispatchFormFields = () => {
  const form = useFormContext();
  const branchId = useWatch({ name: 'branchId' });
  const dispatchDate = useWatch({ name: 'dispatchDate' });
  const bookNoFrom = useWatch({ name: 'bookNoFrom' });
  const bookNoTo = useWatch({ name: 'bookNoTo' });
  const vouchersPerBook = useWatch({ name: 'vouchersPerBook' });
  const mvNoFrom = useWatch({ name: 'mvNoFrom' });

  // Reset assignedTo when branchId changes to avoid invalid branch manager assignment
  useEffect(() => {
    form.setValue('assignedTo', '');
  }, [branchId, form]);

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

  const { user } = useAuth();
  const isAdmin = user?.isAdmin === true;

  const loadBranches = async () => {
    try {
      const branches = await branchProfileApi.getBranchProfiles({
        activeOnly: true,
      });
      return {
        options: branches.map(b => ({
          value: b.id,
          label: `${b.code} - ${b.name}`,
        })),
        hasMore: false,
      };
    } catch {
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  const loadBankAccounts = async (inputValue: string) => {
    try {
      const response = await accountProfileApi.getAccountProfiles({
        page: 1,
        limit: 100,
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
        hasMore: false,
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
        disabled={!isAdmin}
      />
      <FormFieldSelect
        name="bankAccountCode"
        label="Bank Account Code"
        loadOptions={loadBankAccounts}
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

export const BulkDispatchForm = ({ onSuccess }: BulkDispatchFormProps) => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const isAdmin = user?.isAdmin === true;

  const onCancel = () => {
    navigate('/admin/chequebooks');
  };

  const handleSubmit = async (values: IBulkDispatchFormValues) => {
    try {
      const formattedValues = {
        ...values,
        bookNoFrom: Number(values.bookNoFrom),
        bookNoTo: Number(values.bookNoTo),
        vouchersPerBook: Number(values.vouchersPerBook),
        mvNoFrom: Number(values.mvNoFrom),
      };
      await chequebookApi.create(formattedValues);
      toast.success('ChequeBook record saved successfully.');
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
    branchId: isAdmin ? '' : (activeBranchId || ''),
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
      <BulkDispatchFormFields />
    </Form>
  );
};
