import { useMemo } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { ToggleSwitch } from '@/components/ui/toggleSwitch';
import {
  Table,
  type TableColumnDef,
  TABLE_ACTIONS_CELL_CLASSNAME,
  TABLE_ACTION_BUTTON_CLASSNAME,
  TABLE_ACTION_ICON_CLASSNAME,
} from '@/components/ui/table';
import type { IBranchCounter } from '../types';

interface BranchCounterTableProps {
  counters: IBranchCounter[];
  onEdit: (counter: IBranchCounter) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
}

interface BranchCounterTableRow {
  id: string;
  counterNo: string;
  name: string;
  isActive: boolean;
}

export const BranchCounterTable = ({
  counters,
  onEdit,
  onToggleStatus,
  isUpdatingStatus = false,
}: BranchCounterTableProps) => {
  const rows: BranchCounterTableRow[] = useMemo(
    () =>
      counters.map(counter => ({
        id: counter.id,
        counterNo: counter.counterNo,
        name: counter.name,
        isActive: counter.isActive,
      })),
    [counters]
  );

  const columns: TableColumnDef<BranchCounterTableRow>[] = [
    { accessorKey: 'counterNo', header: 'Counter No.' },
    { accessorKey: 'name', header: 'Counter Name' },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const counterId = row.original.id;
        const isActive = row.original.isActive;

        return (
          <div className="flex items-center gap-3">
            <ToggleSwitch
              checked={isActive}
              onCheckedChange={nextChecked => {
                onToggleStatus(counterId, nextChecked);
              }}
              disabled={isUpdatingStatus}
            />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const counter = counters.find(item => item.id === row.original.id);

        if (!counter) {
          return null;
        }

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label="Edit counter"
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                onEdit(counter);
              }}
            >
              <PencilSquareIcon className={TABLE_ACTION_ICON_CLASSNAME} />
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
        const counter = counters.find(item => item.id === row.id);

        if (counter) {
          onEdit(counter);
        }
      }}
      emptyMessage="There is no counter"
    />
  );
};
