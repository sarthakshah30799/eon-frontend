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
import type { IStateProfile } from '../types';

interface StateProfileTableProps extends PaginationControlsProps {
  states: IStateProfile[];
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface StateProfileTableRow {
  id: string;
  countryName: string;
  code: string;
  name: string;
  gstStateCode: string;
  ctrStateCode: string;
}

export const StateProfileTable = ({
  states,
  loading = false,
  isFetching = false,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: StateProfileTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission('/admin/state-profile');

  const rows: StateProfileTableRow[] = states.map(state => ({
    id: state.id,
    countryName: state.countryName,
    code: state.code,
    name: state.name,
    gstStateCode: state.gstStateCode,
    ctrStateCode: state.ctrStateCode,
  }));

  const columns: TableColumnDef<StateProfileTableRow>[] = [
    { accessorKey: 'countryName', header: 'Country' },
    { accessorKey: 'name', header: 'State Name' },
    { accessorKey: 'code', header: 'State Code' },
    { accessorKey: 'gstStateCode', header: 'GST State Code' },
    { accessorKey: 'ctrStateCode', header: 'CTR State Code' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const stateId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label={canModify ? 'Edit state' : 'View state'}
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/state-profile/edit/${stateId}`);
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
          ? row => navigate(`/admin/state-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No states found. Create your first state."
    />
  );
};
