import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import type { PaginationControlsProps } from '@/components/ui';
import { usePermission } from '@/hooks';
import type { IFinancialCode } from '../types/financialCodeTypes';

interface FinancialCodeTableProps extends PaginationControlsProps {
  financialCodes: IFinancialCode[];
  loading?: boolean;
  isFetching?: boolean;
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
  isFetching = false,
  onSearch,
  searchValue,
  searchPlaceholder,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
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
      cell: ({ row }) => {
        const codeId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label={
                canModify ? 'Edit financial code' : 'View financial code'
              }
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(`/financial-profile/edit/${codeId}`);
              }}
            >
              {canModify ? (
                <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
              ) : (
                <EyeIcon className={TABLE_ACTION_ICON_CLASSNAME} />
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
      enablePagination
      manualPagination
      enableRowSelection={false}
      enableColumnVisibility={false}
      loading={loading}
      isFetching={isFetching}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
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
