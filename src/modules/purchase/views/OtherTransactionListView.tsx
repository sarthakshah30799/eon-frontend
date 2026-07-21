import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button1';
import { AsyncSelect, type AsyncSelectOption, type AsyncSelectResponse } from '@/components/ui';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { NotFoundState } from '@/components/ui/not-found-state';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/lib/AuthContext';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { otherTransactionApi } from '@/api/otherTransaction/otherTransaction.api';
import { formatDateTime } from '@/utils';

interface OtherTransactionRow {
  id: string;
  number: string;
  docNo: string;
  remitterName: string;
  transactionType: string;
  currencyId: string;
  fcVolume: string;
  createdAt: string;
}

export const OtherTransactionListView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission('/other-transactions');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const canSeeAllBranches = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);

  const { data: branches = [] } = useListBranchProfiles({ activeOnly: true });
  const branchOptions = useMemo<AsyncSelectOption[]>(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [branches]
  );
  const selectedBranchOption = useMemo<AsyncSelectOption | null>(
    () => branchOptions.find(option => option.value === branchFilter) ?? null,
    [branchFilter, branchOptions]
  );
  const loadBranchOptions = useMemo(
    () => async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? branchOptions.filter(option =>
            option.label.toLowerCase().includes(normalizedInput)
          )
        : branchOptions;

      return { options: filteredOptions };
    },
    [branchOptions]
  );

  const { data = [], isLoading, isFetching, error } = useQuery({
    queryKey: ['other-transactions', search, branchFilter],
    queryFn: () =>
      otherTransactionApi.getAll({
        search: search.trim() || undefined,
        branchId: canSeeAllBranches ? branchFilter || undefined : undefined,
      }),
  });

  const rows = useMemo<OtherTransactionRow[]>(
    () =>
      data.map(t => ({
        id: t.id,
        number: t.number ?? '-',
        docNo: t.docNo ?? '-',
        remitterName: t.remitterName ?? '-',
        transactionType: t.transactionType ?? '-',
        currencyId: t.currencyId ?? '-',
        fcVolume: t.fcVolume ?? '-',
        createdAt: formatDateTime(t.createdAt),
      })),
    [data]
  );

  const columns: TableColumnDef<OtherTransactionRow>[] = useMemo(
    () => [
      { accessorKey: 'docNo', header: 'Doc No.' },
      { accessorKey: 'remitterName', header: 'Remitter Name' },
      { accessorKey: 'transactionType', header: 'Type' },
      { accessorKey: 'fcVolume', header: 'FC Volume' },
      { accessorKey: 'createdAt', header: 'Created At' },
      {
        id: 'actions',
        header: 'Actions',
        meta: {
          headerClassName: 'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
          cellClassName: 'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit transaction"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={e => {
                e.stopPropagation();
                navigate(`/other-transactions/edit/${row.original.id}`);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [navigate]
  );

  if (!hasAnyPermission) {
    return <NotFoundState message="You do not have access to this page." />;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-error-600">
        Failed to load transactions. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">Other Transactions</h1>
          <p className="text-sm text-text-secondary">
            Browse and manage other outward remittance transactions.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/other-transactions/create')}
        >
          Create Transaction
        </Button>
      </div>

      {canSeeAllBranches && (
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <AsyncSelect
              label="Branch Filter"
              placeholder="All Branches"
              value={selectedBranchOption}
              loadOptions={loadBranchOptions}
              defaultOptions={branchOptions}
              isClearable
              onChange={option => {
                const selectedOption = Array.isArray(option)
                  ? (option[0] ?? null)
                  : option;
                setBranchFilter(selectedOption?.value ? String(selectedOption.value) : '');
              }}
            />
          </div>
        </div>
      )}

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <Table
          columns={columns}
          data={rows}
          loading={isLoading || isFetching}
          enableFiltering={false}
          enablePagination={false}
          enableColumnVisibility={false}
          enableRowSelection={false}
          enableSorting={false}
          onSearch={setSearch}
          searchValue={search}
          searchPlaceholder="Search by number"
          onRowClick={row => navigate(`/other-transactions/edit/${row.id}`)}
          emptyMessage="No transactions found."
        />
      </section>
    </div>
  );
};
