import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { AsyncSelect, Button, Input } from '@/components/ui';
import { NotFoundState } from '@/components/ui/not-found-state';
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
  } = useTransactionAccountPostings(canView);

  const handlePartyProfileChange = (selectedOption: unknown) => {
    if (
      !selectedOption ||
      Array.isArray(selectedOption) ||
      typeof selectedOption !== 'object' ||
      !('value' in selectedOption)
    ) {
      setPartyProfileId('');
      return;
    }

    setPartyProfileId(String(selectedOption.value));
  };

  const handleTransactionTypeChange = (selectedOption: unknown) => {
    if (
      !selectedOption ||
      Array.isArray(selectedOption) ||
      typeof selectedOption !== 'object' ||
      !('value' in selectedOption)
    ) {
      setTransactionType('');
      return;
    }

    setTransactionType(String(selectedOption.value));
  };

  if (!canView) {
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
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">
          Transaction Account Postings
        </h1>
        <p className="text-sm text-text-secondary">
          Search transactions, filter by party profile or transaction type, then queue a manual account posting rebuild.
        </p>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Search"
            placeholder="Search transaction number"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />

          <AsyncSelect
            label="Party Profile"
            value={selectedPartyProfile}
            loadOptions={loadPartyProfileOptions}
            defaultOptions={true}
            isSearchable
            isClearable
            isDisabled={isPartyProfilesLoading}
            placeholder="All party profiles"
            onChange={handlePartyProfileChange}
          />

          <AsyncSelect
            label="Transaction Type"
            value={selectedTransactionType}
            loadOptions={loadTransactionTypeOptions}
            defaultOptions={true}
            isSearchable={false}
            isClearable
            placeholder="All types"
            onChange={handleTransactionTypeChange}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            {isLoading || isFetching
              ? 'Loading transactions...'
              : `${rows.length} transaction(s) found`}
          </p>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm"
            onClick={resetFilters}
          >
            Reset Filters
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <TransactionListTable
          rows={rows}
          loading={isLoading || isFetching}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search transaction number"
          onActionClick={row => void queueAccountPostingRebuild(row.id)}
          actionLabel="Queue account posting rebuild"
          actionMode="custom"
          actionIcon={<ArrowPathIcon className="h-5 w-5" />}
          isActionDisabled={row => row.status !== TransactionStatusEnum.APPROVED}
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
