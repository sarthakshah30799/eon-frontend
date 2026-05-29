import { Checkbox } from '@/components/ui/checkbox';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { USER_RIGHTS_PERMISSION_COLUMNS } from '../constants';
import type {
  UserRightsPermissionState,
  UserRightsRow,
  UserRightsRowState,
} from '../types';

interface UserRightsTableRow extends UserRightsRow {
  selected: boolean;
  permissions: UserRightsPermissionState;
}

interface UserRightsTableProps {
  rows: UserRightsRow[];
  rowStateById: Record<string, UserRightsRowState>;
  onToggleAllRowsSelected: (checked: boolean) => void;
  onToggleRowSelected: (rowId: string, checked: boolean) => void;
  onToggleColumnPermission: (
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => void;
  onTogglePermission: (
    rowId: string,
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => void;
}

const getAllRowsSelected = (
  rows: UserRightsTableRow[]
): boolean => rows.length > 0 && rows.every(row => row.selected);

export const UserRightsTable = ({
  rows,
  rowStateById,
  onToggleAllRowsSelected,
  onToggleRowSelected,
  onToggleColumnPermission,
  onTogglePermission,
}: UserRightsTableProps) => {
  const tableRows: UserRightsTableRow[] = rows.map(row => {
    const rowState = rowStateById[row.id];

    return {
      ...row,
      selected: rowState?.selected ?? false,
      permissions:
        rowState?.permissions ?? {
          add: false,
          modify: false,
          delete: false,
          view: false,
          export: false,
          authorized: false,
          rejected: false,
        },
    };
  });

  const allRowsSelected = getAllRowsSelected(tableRows);

  const columns: TableColumnDef<UserRightsTableRow>[] = [
    {
      accessorKey: 'label',
      header: () => (
        <Checkbox
          id="user-rights-select-all"
          checked={allRowsSelected}
          onChange={onToggleAllRowsSelected}
        >
          Available Options
        </Checkbox>
      ),
      cell: ({ row }) => {
        const isSelected = row.original.selected;

        return (
          <Checkbox
            id={`user-rights-row-${row.original.id}`}
            checked={isSelected}
            onChange={checked => {
              onToggleRowSelected(row.original.id, checked);
            }}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">
                {row.original.label}
              </p>
              {row.original.trail && (
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  {row.original.trail}
                </p>
              )}
            </div>
          </Checkbox>
        );
      },
    },
    ...USER_RIGHTS_PERMISSION_COLUMNS.map(permission => ({
      accessorKey: permission.key,
      header: () => (
        <Checkbox
          id={`user-rights-header-${permission.key}`}
          checked={
            tableRows.length > 0 &&
            tableRows.every(row => row.permissions[permission.key])
          }
          onChange={checked => {
            onToggleColumnPermission(permission.key, checked);
          }}
        >
          {permission.label}
        </Checkbox>
      ),
      cell: ({ row }: { row: UserRightsTableRow }) => (
        <Checkbox
          id={`user-rights-${permission.key}-${row.original.id}`}
          checked={row.original.permissions[permission.key]}
          onChange={checked => {
            onTogglePermission(row.original.id, permission.key, checked);
          }}
        />
      ),
    })),
  ];

  return (
    <Table
      columns={columns}
      data={tableRows}
      enableFiltering={false}
      enablePagination={false}
      enableRowSelection={false}
      enableColumnVisibility={false}
      emptyMessage="No available options found."
    />
  );
};
