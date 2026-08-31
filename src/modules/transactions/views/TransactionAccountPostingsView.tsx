import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { Button } from '@/components/ui';
import {
  buildSearchToolbarFilter,
  type TableToolbarFilter,
} from '@/components/ui/table';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import { TransactionListTable } from '../components';
import { TransactionStatusEnum } from '../types';
import { useTransactionAccountPostings } from '../hooks';

export const TransactionAccountPostingsView = () => {
  const { user } = useAuth();
  const canView = user?.isAdmin === true;
  const {
    search,
    setSearch,
    setPartyProfileId,
    setTransactionType,
    selectedPartyProfile,
    selectedTransactionType,
    loadPartyProfileOptions,
    loadTransactionTypeOptions,
    rows,
    isLoading,
    isFetching,
    error,
    isPartyProfilesLoading,
    activeTransactionId,
    isRebuildPending,
    resetFilters,
    queueAccountPostingRebuild,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useTransactionAccountPostings(canView);

  const toolbarFilters = useMemo<TableToolbarFilter[]>(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: setSearch,
        placeholder: 'Search transaction number',
      }),
      {
        id: 'partyProfile',
        type: 'asyncSelect',
        label: 'Party Profile',
        value: selectedPartyProfile,
        loadOptions: loadPartyProfileOptions,
        defaultOptions: true,
        pagination: false,
        isSearchable: true,
        isClearable: true,
        isDisabled: isPartyProfilesLoading,
        placeholder: 'All party profiles',
        className: 'w-56 shrink-0',
        onChange: option => {
          setPartyProfileId(option?.value ? String(option.value) : '');
        },
      },
      {
        id: 'transactionType',
        type: 'asyncSelect',
        label: 'Transaction Type',
        value: selectedTransactionType,
        loadOptions: loadTransactionTypeOptions,
        defaultOptions: true,
        pagination: false,
        isSearchable: true,
        isClearable: true,
        placeholder: 'All types',
        className: 'w-44 shrink-0',
        onChange: option => {
          setTransactionType(option?.value ? String(option.value) : '');
        },
      },
      {
        id: 'resetFilters',
        type: 'custom',
        className: 'ml-auto shrink-0',
        render: () => (
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        ),
      },
    ],
    [
      isPartyProfilesLoading,
      loadPartyProfileOptions,
      loadTransactionTypeOptions,
      resetFilters,
      search,
      selectedPartyProfile,
      selectedTransactionType,
      setPartyProfileId,
      setSearch,
      setTransactionType,
    ]
  );

  if (!canView) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
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
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">
          Transaction Account Postings
        </h1>
        <p className="text-sm text-text-secondary">
          Search transactions, filter by party profile or transaction type, then
          queue a manual account posting rebuild.
        </p>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <TransactionListTable
          rows={rows}
          loading={isLoading}
          isFetching={isFetching}
          toolbarFilters={toolbarFilters}
          manualPagination
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onActionClick={row => void queueAccountPostingRebuild(row.id)}
          actionLabel="Queue account posting rebuild"
          actionMode="custom"
          actionIcon={<ArrowPathIcon className="h-5 w-5" />}
          isActionDisabled={row =>
            row.status !== TransactionStatusEnum.APPROVED
          }
          isActionLoading={row =>
            activeTransactionId === row.id && isRebuildPending
          }
          emptyMessage="No transactions found."
        />
      </section>
    </div>
  );
};

export default TransactionAccountPostingsView;
