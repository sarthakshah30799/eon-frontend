import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { manualBillBookApi } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';

export const bulkDispatchSchema = yup.object().shape({
  dispatchDate: yup.string().required('Date is required'),
  branchId: yup.string().required('Branch is required'),
  transactionType: yup.string().required('Transaction Type is required'),
  bookNoFrom: yup
    .number()
    .typeError('Must be a number')
    .integer()
    .positive()
    .required('Book No. From is required'),
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
    .required('MV No. From is required'),
  mvNoTo: yup.string(),
  assignedTo: yup.string().required('Assigned To is required'),
  remarks: yup.string().optional(),
});

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

  useEffect(() => {
    const fetchNextNumber = async () => {
      if (branchId && dispatchDate) {
        try {
          const res = await manualBillBookApi.getNextNumber(
            branchId,
            dispatchDate
          );
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

  // Reset Assigned To when Branch changes
  useEffect(() => {
    form.setValue('assignedTo', '');
  }, [branchId, form]);

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


  const loadAssignedTo = useCallback(async () => {
    if (!branchId) {
      return {
        options: [],
        hasMore: false,
      };
    }
    try {
      const managers = await manualBillBookApi.getBranchManagers(branchId);
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

export const BulkDispatchForm = ({ onSuccess }: BulkDispatchFormProps) => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const isAdmin = user?.isAdmin === true;

  const onCancel = () => {
    navigate('/admin/manual-bill-books');
  };

  const handleSubmit = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        bookNoFrom: Number(values.bookNoFrom),
        bookNoTo: Number(values.bookNoTo),
        vouchersPerBook: Number(values.vouchersPerBook),
        mvNoFrom: Number(values.mvNoFrom),
      };
      await manualBillBookApi.create(formattedValues);
      toast.success('Manual bill book record saved successfully.');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save manual bill book.');
    }
  };

  const defaultValues = {
    dispatchDate: new Date().toISOString().slice(0, 10),
    no: '',
    branchId: isAdmin ? '' : (activeBranchId || ''),
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
      resolver={yupResolver(bulkDispatchSchema) as any}
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
