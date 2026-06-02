import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
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

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit state"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/master/system-setups/state-profile/edit/${stateId}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
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
      onRowClick={row => {
        navigate(`/master/system-setups/state-profile/edit/${row.id}`);
      }}
      emptyMessage="No states found. Create your first state."
    />
  );
};
