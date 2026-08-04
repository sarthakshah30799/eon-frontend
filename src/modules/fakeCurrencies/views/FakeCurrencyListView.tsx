import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AsyncSelect, Button, type AsyncSelectOption, type AsyncSelectResponse } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { TransactionListTable, type TransactionListRow } from '@/modules/transactions';
import { formatDateTime, formatReferenceLabel } from '@/utils';
import { useListFakeCurrencies } from '../hooks';

export const FakeCurrencyListView = () => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const canChooseBranch = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const effectiveBranchId = canChooseBranch ? branchId : activeBranchId ?? '';
  const { data: branches = [] } = useListBranchProfiles({ activeOnly: true });
  const { data: transactions = [], isLoading, isFetching, error } = useListFakeCurrencies({
    search,
    branchId: effectiveBranchId,
  });

  const branchOptions = useMemo<AsyncSelectOption[]>(
    () => branches.map(branch => ({ value: branch.id, label: `${branch.code} - ${branch.name}` })),
    [branches]
  );
  const loadBranchOptions = async (inputValue: string): Promise<AsyncSelectResponse> => {
    const value = inputValue.trim().toLowerCase();
    return {
      options: value
        ? branchOptions.filter(option => option.label.toLowerCase().includes(value))
        : branchOptions,
    };
  };
  const selectedBranch = branchOptions.find(option => option.value === branchId) ?? null;
  const rows = useMemo<TransactionListRow[]>(
    () => transactions.map(transaction => ({
      id: transaction.id,
      number: transaction.number ?? '-',
      branch: formatReferenceLabel(transaction.branchSnapshot),
      partyProfile: formatReferenceLabel(transaction.reasonSnapshot) || 'Fake Currency',
      transactionType: transaction.transactionType,
      tradeMode: transaction.tradeMode,
      status: transaction.status,
      createdAt: formatDateTime(transaction.createdAt),
    })),
    [transactions]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Fake Currencies</h1>
          <p className="text-sm text-text-secondary">View fake-currency stock removal transactions.</p>
        </div>
        <Button type="button" onClick={() => navigate('/fake-currencies/create')}>Create Fake Currency</Button>
      </div>
      {canChooseBranch ? (
        <div className="max-w-sm">
          <AsyncSelect
            label="Branch Filter"
            placeholder="All Branches"
            value={selectedBranch}
            defaultOptions={branchOptions}
            loadOptions={loadBranchOptions}
            isClearable
            onChange={option => setBranchId(String((Array.isArray(option) ? option[0] : option)?.value ?? ''))}
          />
        </div>
      ) : null}
      {error ? <p className="text-sm text-error-600">Failed to load fake-currency transactions.</p> : null}
      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <TransactionListTable
          rows={rows}
          loading={isLoading || isFetching}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search transaction number"
          onRowClick={row => navigate(`/fake-currencies/edit/${row.id}`)}
          onActionClick={row => navigate(`/fake-currencies/edit/${row.id}`)}
          actionLabel="View fake currency transaction"
          actionMode="view"
          emptyMessage="No fake-currency transactions found."
        />
      </section>
    </div>
  );
};

export default FakeCurrencyListView;
