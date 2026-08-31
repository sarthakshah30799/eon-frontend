import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import {
  Button,
  type AsyncSelectOption,
} from '@/components/ui';
import {
  Table,
  type TableColumnDef,
  buildBranchToolbarFilter,
  buildSearchToolbarFilter,
} from '@/components/ui/table';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { useAuth } from '@/lib/AuthContext';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { transactionAd1Api } from '@/api/transactionAd1/transactionAd1.api';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';

interface Ad1Row {
  id: string;
  number: string;
  docNo: string;
  remitterName: string;
  transactionType: string;
  currencyId: string;
  fcVolume: string;
  createdAt: string;
}

export const AD1ListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission('/ad1');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const [branchFilter, setBranchFilter] = useState('');
  const canSeeAllBranches = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const [selectedBranchOption, setSelectedBranchOption] =
    useState<AsyncSelectOption | null>(null);

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      branchId: canSeeAllBranches ? branchFilter || undefined : undefined,
    }),
    [branchFilter, canSeeAllBranches, debouncedSearch]
  );

  const {
    rows,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['transactions-ad1'],
    queryFn: params => transactionAd1Api.getAll(params),
    filters,
    enabled: hasAnyPermission,
  });

  const resetOffset = useCallback(() => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!nextParams.get('limit')) {
        nextParams.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return nextParams;
    });
  }, [setSearchParams]);

  const tableRows = useMemo<Ad1Row[]>(
    () =>
      rows.map(t => ({
        id: t.id,
        number: t.number ?? '-',
        docNo: t.docNo ?? '-',
        remitterName: t.remitterName ?? '-',
        transactionType: t.transactionType ?? '-',
        currencyId: t.currencyId ?? '-',
        fcVolume: t.fcVolume ?? '-',
        createdAt: formatDateTime(t.createdAt),
      })),
    [rows]
  );

  const columns: TableColumnDef<Ad1Row>[] = useMemo(
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
          headerClassName:
            'sticky right-0 z-20 border-l border-border-primary bg-surface-secondary',
          cellClassName:
            'sticky right-0 z-10 border-l border-border-primary bg-surface-primary',
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              aria-label="Edit AD1 transaction"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={e => {
                e.stopPropagation();
                navigate(`/ad1/edit/${row.original.id}`);
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

  const handleSearch = useCallback((value: string) => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);
      if (value.trim()) {
        nextParams.set('search', value.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!nextParams.get('limit')) {
        nextParams.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return nextParams;
    });
  }, [setSearchParams]);

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: handleSearch,
        placeholder: 'Search by number',
      }),
      buildBranchToolbarFilter({
        visible: canSeeAllBranches,
        value: selectedBranchOption,
        loadOptions: loadBranchOptions,
        onChange: option => {
          setSelectedBranchOption(option);
          setBranchFilter(option?.value ? String(option.value) : '');
          resetOffset();
        },
      }),
    ],
    [
      canSeeAllBranches,
      handleSearch,
      loadBranchOptions,
      resetOffset,
      search,
      selectedBranchOption,
    ]
  );

  if (!hasAnyPermission) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-error-600">
        Failed to load AD1 transactions. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            AD1 Transactions
          </h1>
          <p className="text-sm text-text-secondary">
            Browse and manage AD1 outward remittance transactions.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/ad1/create')}
        >
          Create AD1
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <Table
          columns={columns}
          data={tableRows}
          loading={isLoading}
          isFetching={isFetching}
          enableFiltering={false}
          enablePagination
          manualPagination
          enableColumnVisibility={false}
          enableRowSelection={false}
          enableSorting={false}
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          toolbarFilters={toolbarFilters}
          onRowClick={row => navigate(`/ad1/edit/${row.id}`)}
          emptyMessage="No AD1 transactions found."
        />
      </section>
    </div>
  );
};
