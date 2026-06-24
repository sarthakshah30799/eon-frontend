import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { usePermission } from '@/hooks';
import type { IExpenseIncomeBookingMaster } from '../types/expenseIncomeBookingTypes';

interface ExpenseIncomeBookingTableProps {
  masters: IExpenseIncomeBookingMaster[];
  type: 'EXPENSE' | 'INCOME';
}

interface ExpenseIncomeBookingTableRow {
  id: string;
  code: string;
  description: string;
  totalGst: string;
  tdsApplicable: string;
  tdsValue: string;
  active: string;
  validity: string;
}

export const ExpenseIncomeBookingTable = ({ masters, type }: ExpenseIncomeBookingTableProps) => {
  const navigate = useNavigate();
  const basePath = type === 'EXPENSE' ? '/expense-booking' : '/income-booking';
  const { canModify, canView } = usePermission(basePath);

  const rows: ExpenseIncomeBookingTableRow[] = masters.map(m => {
    let validity = '-';
    if (m.from || m.to) {
      const fromStr = m.from ? new Date(m.from).toLocaleDateString() : 'Always';
      const toStr = m.to ? new Date(m.to).toLocaleDateString() : 'Forever';
      validity = `${fromStr} - ${toStr}`;
    }

    return {
      id: m.id,
      code: m.code,
      description: m.description || '-',
      totalGst: `${m.totalGst}%`,
      tdsApplicable: m.tdsApplicable ? 'Yes' : 'No',
      tdsValue: m.tdsApplicable ? `${m.tdsValue}%` : '-',
      active: m.active ? 'Yes' : 'No',
      validity,
    };
  });

  const columns: TableColumnDef<ExpenseIncomeBookingTableRow>[] = [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'totalGst', header: 'Total GST' },
    { accessorKey: 'tdsApplicable', header: 'TDS Applicable' },
    { accessorKey: 'tdsValue', header: 'TDS Value' },
    { accessorKey: 'active', header: 'Active' },
    { accessorKey: 'validity', header: 'Validity Period' },
    {
      id: 'actions',
      header: 'Actions',
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => {
        const id = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={canModify ? 'Edit master' : 'View master'}
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`${basePath}/edit/${id}`);
              }}
            >
              {canModify ? (
                <PencilSquareIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      enableFiltering={false}
      enablePagination={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      onRowClick={
        canModify || canView
          ? row => navigate(`${basePath}/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No records found. Create your first master."
    />
  );
};
