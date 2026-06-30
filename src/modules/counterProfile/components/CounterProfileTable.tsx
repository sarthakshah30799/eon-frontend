import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { ToggleSwitch } from '@/components/ui/toggleSwitch';
import { Table, type TableColumnDef } from '@/components/ui/table';
import type { ICounterProfile } from '../types';

interface CounterProfileTableProps {
  counters: ICounterProfile[];
  onToggleStatus: (id: string, isActive: boolean) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
  loading?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

interface CounterProfileTableRow {
  id: string;
  counterNo: string;
  name: string;
  isActive: boolean;
}

export const CounterProfileTable = ({
  counters,
  onToggleStatus,
  isUpdatingStatus = false,
  loading = false,
  onSearch,
  searchValue,
  searchPlaceholder,
}: CounterProfileTableProps) => {
  const navigate = useNavigate();

  const rows: CounterProfileTableRow[] = counters.map(counter => ({
    id: counter.id,
    counterNo: counter.counterNo,
    name: counter.name,
    isActive: counter.isActive,
  }));

  const columns: TableColumnDef<CounterProfileTableRow>[] = [
    { accessorKey: 'counterNo', header: 'Counter No.' },
    { accessorKey: 'name', header: 'Counter Name' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const counterId = row.original.id;
        const isActive = row.original.isActive;

        return (
          <ToggleSwitch
            checked={isActive}
            onCheckedChange={nextChecked => {
              onToggleStatus(counterId, nextChecked);
            }}
            disabled={isUpdatingStatus}
          />
        );
      },
    },
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
        const counterId = row.original.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit counter"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/counter-profile/edit/${counterId}`);
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
      loading={loading}
      onSearch={onSearch}
      searchValue={searchValue}
      searchPlaceholder={searchPlaceholder}
      onRowClick={row => {
        navigate(`/admin/counter-profile/edit/${row.id}`);
      }}
      emptyMessage="No counters found. Create your first counter."
    />
  );
};
