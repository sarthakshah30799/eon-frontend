import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Form,
  FormFieldInput,
  FormFieldSelect,
  FormFieldDatePicker,
  FormFieldTextarea,
} from '@/components/forms';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { checkbookApi } from '@/api';
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

interface BulkDispatchFormProps {
  onSuccess: () => void;
}

const createStaticLoadOptions = (options: { value: any; label: string }[]) => {
  return async () => ({
    options,
    hasMore: false,
  });
};

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
          const res = await checkbookApi.getNextNumber(branchId, dispatchDate);
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

  const loadTxnTypes = createStaticLoadOptions([
    { value: 'PB-RETAIL PURCHASE', label: 'PB-RETAIL PURCHASE' },
    { value: 'PS-RETAIL SALE', label: 'PS-RETAIL SALE' },
    { value: 'FB-BULK BUY', label: 'FB-BULK BUY' },
    { value: 'FS-BULK SALE', label: 'FS-BULK SALE' },
  ]);

  const loadAssignedTo = createStaticLoadOptions([
    { value: 'BRANCH MANAGER', label: 'BRANCH MANAGER' },
    { value: 'CASHIER', label: 'CASHIER' },
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <FormFieldDatePicker name="dispatchDate" label="Date" />
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
      />
      <FormFieldSelect
        name="transactionType"
        label="Txn Type"
        loadOptions={loadTxnTypes}
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
      <FormFieldSelect
        name="assignedTo"
        label="Assigned To"
        loadOptions={loadAssignedTo}
      />
      <FormFieldTextarea name="remarks" label="Remarks" rows={3} />
    </div>
  );
};

export const BulkDispatchForm = ({ onSuccess }: BulkDispatchFormProps) => {
  const navigate = useNavigate();

  const onCancel = () => {
    navigate('/admin/checkbooks');
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
      await checkbookApi.create(formattedValues);
      toast.success('Checkbook record saved successfully.');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save checkbook.');
    }
  };

  const defaultValues = {
    dispatchDate: new Date().toISOString().slice(0, 10),
    no: '',
    branchId: '',
    transactionType: '',
    bookNoFrom: '',
    bookNoTo: '',
    vouchersPerBook: 50,
    mvNoFrom: '',
    mvNoTo: '',
    assignedTo: 'BRANCH MANAGER',
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
