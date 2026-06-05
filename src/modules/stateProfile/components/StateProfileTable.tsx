import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { usePermission } from '@/hooks';
import type { IStateProfile } from '../types';

interface StateProfileTableProps {
  states: IStateProfile[];
}

interface StateProfileTableRow {
  id: string;
  countryName: string;
  code: string;
  name: string;
  gstStateCode: string;
  ctrStateCode: string;
}

export const StateProfileTable = ({ states }: StateProfileTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission(
    '/master/system-setups/state-profile'
  );

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
      meta: {
        headerClassName:
          'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
        cellClassName:
          'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
      },
      cell: ({ row }) => {
        const stateId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={canModify ? 'Edit state' : 'View state'}
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/state-profile/edit/${stateId}`);
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
          ? row => navigate(`/master/system-setups/state-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No states found. Create your first state."
    />
  );
};
