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
import type { IAccountProfile } from '../types/accountProfileTypes';

interface AccountProfileTableProps extends PaginationControlsProps {
  accounts: IAccountProfile[];
  loading?: boolean;
  isFetching?: boolean;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
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
      cell: ({ row }) => {
        const accountId = row.original.id;

        if (!canModify && !canView) return null;

        return (
          <div className={TABLE_ACTIONS_CELL_CLASSNAME}>
            <Button
              type="button"
              aria-label={
                canModify ? 'Edit account profile' : 'View account profile'
              }
              variant="ghost"
              size="icon"
              className={TABLE_ACTION_BUTTON_CLASSNAME}
              onClick={event => {
                event.stopPropagation();
                navigate(`/admin/accounts-profile/edit/${accountId}`);
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
          ? row => navigate(`/admin/accounts-profile/edit/${row.id}`)
          : undefined
      }
      emptyMessage="No account profiles found. Create your first account profile."
    />
  );
};
export default AccountProfileTable;
