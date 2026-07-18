import { Table, type TableColumnDef } from './Table';

// Example data type
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin: string;
}

// Example data
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-03-10',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-20',
    lastLogin: '2024-03-09',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'moderator',
    status: 'inactive',
    createdAt: '2024-02-01',
    lastLogin: '2024-02-28',
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'user',
    status: 'pending',
    createdAt: '2024-02-15',
    lastLogin: '2024-03-08',
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-20',
    lastLogin: '2024-03-10',
  },
];

// Example usage component
export const TableExample = () => {
  const columns: TableColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-border-secondary text-primary-600 focus:ring-primary-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-border-secondary text-primary-600 focus:ring-primary-500"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('id')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-primary-600">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as string;
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              role === 'admin'
                ? 'bg-error-50 text-error-600'
                : role === 'moderator'
                  ? 'bg-warning-50 text-warning-600'
                  : 'bg-success-50 text-success-600'
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              status === 'active'
                ? 'bg-success-50 text-success-600'
                : status === 'inactive'
                  ? 'bg-surface-secondary text-text-secondary'
                  : 'bg-warning-50 text-warning-600'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div>{new Date(row.getValue('createdAt')).toLocaleDateString('en-GB')}</div>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => (
        <div>{new Date(row.getValue('lastLogin')).toLocaleDateString('en-GB')}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex gap-2">
          <button className="text-primary-600 hover:text-primary-700 text-sm">
            Edit
          </button>
          <button className="text-error-600 hover:text-error-500 text-sm">
            Delete
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Table Example</h1>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Full-Featured Table</h2>
          <Table
            columns={columns}
            data={sampleUsers}
            enableSorting={true}
            enableFiltering={true}
            enablePagination={true}
            enableRowSelection={true}
            enableColumnVisibility={true}
            pageSize={3}
            onRowSelectionChange={selectedRows => {
              console.log('Selected rows:', selectedRows);
            }}
            onSortingChange={sorting => {
              console.log('Sorting changed:', sorting);
            }}
            onColumnFiltersChange={filters => {
              console.log('Filters changed:', filters);
            }}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Simple Table</h2>
          <Table
            columns={columns.slice(1, -1)} // Remove select and actions columns
            data={sampleUsers}
            enableSorting={false}
            enableFiltering={false}
            enablePagination={false}
            enableRowSelection={false}
            enableColumnVisibility={false}
            variant="striped"
          />
        </div>
      </div>
    </div>
  );
};
