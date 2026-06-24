import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { ExpenseIncomeBookingForm } from '../forms/ExpenseIncomeBookingForm';
import {
  useGetBookingMaster,
  useCreateBookingMaster,
  useUpdateBookingMaster,
} from '../hooks';
import type { ICreateExpenseIncomeBookingMaster } from '../types/expenseIncomeBookingTypes';

interface ExpenseIncomeBookingFormViewProps {
  type: 'EXPENSE' | 'INCOME';
  mode: 'create' | 'edit';
}

export const ExpenseIncomeBookingFormView = ({ type, mode }: ExpenseIncomeBookingFormViewProps) => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const basePath = type === 'EXPENSE' ? '/admin/expense-booking' : '/admin/income-booking';
  const { canModify } = usePermission(basePath);

  const { data: master, isLoading } = useGetBookingMaster(id);
  const { submitBookingMaster, isPending: isCreatePending } = useCreateBookingMaster();
  const { updateBookingMaster: triggerUpdate, isPending: isUpdatePending } = useUpdateBookingMaster();

  const isSubmitting = isCreatePending || isUpdatePending;

  if (mode === 'edit' && isLoading) {
    return <Loader />;
  }

  if (mode === 'edit' && !master) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Booking Master not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: ICreateExpenseIncomeBookingMaster) => {
    try {
      const payload = {
        ...values,
        description: values.description || null,
        tdsAccountId: values.tdsApplicable ? (values.tdsAccountId || null) : null,
        tdsValue: values.tdsApplicable ? Number(values.tdsValue || 0) : 0,
        totalGst: Number(values.totalGst || 0),
        from: values.from || null,
        to: values.to || null,
      };

      if (mode === 'create') {
        await submitBookingMaster(payload);
      } else {
        await triggerUpdate({ id, data: payload });
      }
      navigate(basePath);
    } catch (err) {
      console.error(err);
    }
  };

  const defaultValues: ICreateExpenseIncomeBookingMaster = mode === 'edit' && master
    ? {
        type: master.type,
        interstateTransaction: master.interstateTransaction,
        code: master.code,
        description: master.description ?? '',
        applicableCustomer: master.applicableCustomer,
        applicableVendor: master.applicableVendor,
        applicableEmployee: master.applicableEmployee,
        applicableAgent: master.applicableAgent,
        applicableTcIssuer: master.applicableTcIssuer,
        active: master.active,
        allowRecPay: master.allowRecPay,
        totalGst: master.totalGst,
        tdsApplicable: master.tdsApplicable,
        tdsValue: master.tdsValue,
        tdsAccountId: master.tdsAccountId,
        from: master.from ? new Date(master.from).toISOString().split('T')[0] : null,
        to: master.to ? new Date(master.to).toISOString().split('T')[0] : null,
      }
    : {
        type,
        interstateTransaction: false,
        code: '',
        description: '',
        applicableCustomer: false,
        applicableVendor: false,
        applicableEmployee: false,
        applicableAgent: false,
        applicableTcIssuer: false,
        active: true,
        allowRecPay: false,
        totalGst: 0,
        tdsApplicable: false,
        tdsValue: 0,
        tdsAccountId: null,
        from: null,
        to: null,
      };

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <ExpenseIncomeBookingForm
          type={type}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel={mode === 'create' ? 'Create' : 'Save Changes'}
          isSubmitting={isSubmitting}
          readOnly={mode === 'edit' && !canModify}
          currentId={mode === 'edit' ? id : undefined}
        />
      </section>
    </div>
  );
};

export default ExpenseIncomeBookingFormView;
