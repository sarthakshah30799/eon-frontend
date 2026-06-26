import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button1';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { usePermission } from '@/hooks';
import type { IAccountProfile } from '../types/accountProfileTypes';

interface AccountProfileTableProps {
  accounts: IAccountProfile[];
  loading?: boolean;
}

interface AccountProfileTableRow {
  id: string;
  accountCode: string;
  accountName: string;
  divisionDept: string;
  accountType: string;
  currencyCode: string;
  financialCode: string;
  active: string;
}

export const AccountProfileTable = ({
  accounts,
  loading = false,
}: AccountProfileTableProps) => {
  const navigate = useNavigate();
  const { canModify, canView } = usePermission('/admin/accounts-profile');

  const rows: AccountProfileTableRow[] = accounts.map(account => ({
    id: account.id,
    accountCode: account.accountCode,
    accountName: account.accountName,
    divisionDept: account.divisionDept?.label ?? '',
    accountType: account.accountType?.label ?? '',
    currencyCode: account.currencyCode || '',
    financialCode: account.financialCode ?? '',
    active: account.active ? 'Active' : 'Inactive',
  }));

  const columns: TableColumnDef<AccountProfileTableRow>[] = [
    { accessorKey: 'accountCode', header: 'A/c Code' },
    { accessorKey: 'accountName', header: 'A/c Name' },
    { accessorKey: 'divisionDept', header: 'Division/Dept' },
    { accessorKey: 'accountType', header: 'A/c Type' },
    { accessorKey: 'currencyCode', header: 'Currency' },
    { accessorKey: 'financialCode', header: 'Financial Code' },
    { accessorKey: 'active', header: 'Status' },
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
        const accountId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label={
                canModify ? 'Edit account profile' : 'View account profile'
              }
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/accounts-profile/edit/${accountId}`);
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
      onRowClick={
        canModify || canView
          ? row => navigate(`/admin/accounts-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No account profiles found. Create your first account profile."
    />
  );
};
export default AccountProfileTable;
