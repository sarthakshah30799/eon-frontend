import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { usePermission } from '@/hooks';
import type { IFinancialCode } from '../types/financialCodeTypes';

interface FinancialCodeTableProps {
  financialCodes: IFinancialCode[];
  loading?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface FinancialCodeTableRow {
  id: string;
  financialType: string;
  financialCode: string;
  financialName: string;
  defaultSign: string;
  priority: number;
}

export const FinancialCodeTable = ({
  financialCodes,
  loading = false,
  onSearch,
  searchValue,
  searchPlaceholder,
}: FinancialCodeTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission('/financial-profile');

  const rows: FinancialCodeTableRow[] = financialCodes.map(code => ({
    id: code.id,
    financialType: code.financialType?.label ?? '',
    financialCode: code.financialCode,
    financialName: code.financialName,
    defaultSign: code.defaultSign?.label ?? '',
    priority: code.priority,
  }));

  const columns: TableColumnDef<FinancialCodeTableRow>[] = [
    { accessorKey: 'financialType', header: 'Financial Type' },
    { accessorKey: 'financialCode', header: 'Financial Code' },
    { accessorKey: 'financialName', header: 'Financial Name' },
    { accessorKey: 'defaultSign', header: 'Default Sign' },
    { accessorKey: 'priority', header: 'Priority' },
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
        const codeId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={canModify ? 'Edit financial code' : 'View financial code'}
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/financial-profile/edit/${codeId}`);
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
      enableRowSelection={false}
      enableColumnVisibility={false}
      loading={loading}
      onSearch={onSearch}
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      onRowClick={
        canModify || canView
          ? row => navigate(`/financial-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No financial codes found. Create your first code."
    />
  );
};
export default FinancialCodeTable;
