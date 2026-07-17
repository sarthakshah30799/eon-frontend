import { useMemo, useState } from 'react';
import { Checkbox, SelectEntity, type TableColumnDef } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { useListUserProfiles } from '../hooks';
import type { IUserProfile } from '../types';

type SelectUserProfilesProps = {
  open: boolean;
  selectable?: boolean;
  multiple?: boolean;
  branchId?: string;
  roleFilter?: 'CASHIER' | 'DELIVERY_BOY';
  title?: string;
  description?: string;
  onContinue: (users: IUserProfile[]) => void;
  onClose: () => void;
};

type SelectableUserProfileRow = IUserProfile & {
  rowKey: string;
};

const buildColumns = (
  selectable: boolean,
  multiple: boolean
): TableColumnDef<SelectableUserProfileRow>[] => {
  const columns: TableColumnDef<SelectableUserProfileRow>[] = [
    {
      id: 'code',
      accessorKey: 'code',
      header: 'Code',
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'designation',
      accessorKey: 'designation',
      header: 'Designation',
      cell: ({ row }) => row.original.designation || '-',
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => row.original.roleName || '-',
    },
    {
      id: 'branch',
      header: 'Branch',
      cell: ({ row }) => row.original.branchName || '-',
    },
    {
      id: 'contactNo',
      accessorKey: 'contactNo',
      header: 'Contact',
      cell: ({ row }) => row.original.contactNo || '-',
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive'),
    },
  ];

  if (!selectable) {
    return columns;
  }

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onChange={checked => {
              table.toggleAllRowsSelected(checked);
            }}
            disabled={!multiple}
            aria-label="Select all users"
            className="shrink-0"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onChange={checked => row.toggleSelected(checked)}
            aria-label={`Select ${row.original.code}`}
            className="shrink-0"
          />
        </div>
      ),
      enableSorting: false,
      meta: {
        headerClassName: 'w-14',
        cellClassName: 'w-14',
      },
    },
    ...columns,
  ];
};

export const SelectUserProfiles = ({
  open,
  selectable = true,
  multiple = false,
  branchId,
  roleFilter,
  title = 'Select Users',
  description = 'Search and choose users from the list.',
  onContinue,
  onClose,
}: SelectUserProfilesProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const { data: users = [], isLoading, isFetching } = useListUserProfiles({
    activeOnly: true,
    search: debouncedSearch.trim() || undefined,
    branchId: branchId?.trim() || undefined,
    roleFilter,
  });

  const rows = useMemo<SelectableUserProfileRow[]>(
    () =>
      users.map(user => ({
        ...user,
        rowKey: user.id,
      })),
    [users]
  );

  const columns = useMemo(
    () => buildColumns(selectable, multiple),
    [multiple, selectable]
  );

  return (
    <SelectEntity<SelectableUserProfileRow>
      open={open}
      title={title}
      description={description}
      columns={columns}
      data={rows}
      loading={isLoading || isFetching}
      selectable={selectable}
      multiple={multiple}
      searchValue={search}
      onSearch={value => setSearch(value)}
      searchPlaceholder="Search code, name, designation, email"
      emptyMessage="No users found."
      onContinue={selectedRows =>
        onContinue(
          selectedRows.map(row => {
            const { rowKey, ...user } = row;
            void rowKey;
            return user;
          })
        )
      }
      onClose={onClose}
      getRowId={row => row.rowKey}
    />
  );
};

export default SelectUserProfiles;
