import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { ExpenseIncomeBookingTable } from '../components/ExpenseIncomeBookingTable';
import { useListBookingMasters } from '../hooks/useListBookingMasters';

interface ExpenseIncomeBookingListViewProps {
  type: 'EXPENSE' | 'INCOME';
}

export const ExpenseIncomeBookingListView = ({ type }: ExpenseIncomeBookingListViewProps) => {
  const navigate = useNavigate();
  const basePath = type === 'EXPENSE' ? '/expense-booking' : '/income-booking';
  const { canAdd } = usePermission(basePath);
  
  const { data: masters = [], isLoading, error } = useListBookingMasters({ type });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Error loading {type.toLowerCase()} booking masters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {canAdd && (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() =>
              navigate(`${basePath}/create`)
            }
          >
            Create {type === 'EXPENSE' ? 'Expense' : 'Income'} Booking
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <ExpenseIncomeBookingTable masters={masters} type={type} />
      </section>
    </div>
  );
};

export default ExpenseIncomeBookingListView;
