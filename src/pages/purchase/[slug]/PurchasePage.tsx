import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button1';
import { NotFoundState } from '@/components/ui/not-found-state';
import { useAuth } from '@/lib/AuthContext';
import { transactionsApi } from '@/api/transactions';
import type { ITransactionEntity } from '@/modules/transactions';
import { AD1ListView } from '@/modules/purchase';
import {
  TransactionListTable,
  type TransactionListRow,
} from '@/modules/transactions';
import { formatDateTime, formatReferenceLabel } from '@/utils';
import {
  getPurchasePageBasePath,
  getPurchasePageTitle,
  getPurchasePageTypeFromPath,
  getPurchasePageSlugFromType,
  type PurchasePageType,
} from './purchasePage.enum';

interface PurchasePageViewProps {
  purchasePageType: PurchasePageType | null;
}

const PurchasePageView = ({ purchasePageType }: PurchasePageViewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const selectedSlug = useMemo(
    () => getPurchasePageSlugFromType(purchasePageType) ?? routeSlug ?? '',
    [purchasePageType, routeSlug]
  );
  const basePath = useMemo(
    () => getPurchasePageBasePath(purchasePageType),
    [purchasePageType]
  );

  const canCreate = Boolean(user);

  const {
    data: transactions = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['transactions', purchasePageType, selectedSlug, search],
    queryFn: () =>
      transactionsApi.getTransactions({
        slug: purchasePageType ?? undefined,
        search: search.trim() || undefined,
      }),
    enabled: Boolean(purchasePageType),
  });

  useEffect(() => {
    const resolvedType = getPurchasePageTypeFromPath(location.pathname, routeSlug);
    if (!resolvedType || resolvedType === purchasePageType) {
      return;
    }

    navigate(`/${getPurchasePageBasePath(resolvedType)}/${routeSlug}`, {
      replace: true,
    });
  }, [location.pathname, navigate, purchasePageType, routeSlug]);

  const rows = useMemo<TransactionListRow[]>(
    () =>
      (transactions as ITransactionEntity[]).map(transaction => ({
        id: transaction.id,
        number: transaction.number ?? '-',
        branch: formatReferenceLabel(transaction.branchSnapshot),
        partyProfile: formatReferenceLabel(transaction.partyProfileSnapshot),
        transactionType: transaction.transactionType,
        tradeMode: transaction.tradeMode,
        status: transaction.status,
        createdAt: formatDateTime(transaction.createdAt, true),
      })),
    [transactions]
  );

  useEffect(() => {
    if (!routeSlug && selectedSlug) {
      navigate(`/${basePath}/${selectedSlug}`, { replace: true });
    }
  }, [basePath, navigate, routeSlug, selectedSlug]);

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this transaction page." />
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
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            {getPurchasePageTitle(purchasePageType)}
          </h1>
          <p className="text-sm text-text-secondary">
            Browse transactions for the selected slug, then create or edit records from here.
          </p>
        </div>

        {canCreate ? (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate(`/${basePath}/${routeSlug}/create`)}
          >
            Create Transaction
          </Button>
        ) : null}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <TransactionListTable
          rows={rows}
          loading={isLoading || isFetching}
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search transaction number"
          onRowClick={row =>
            navigate({
              pathname: `/${basePath}/${routeSlug}/edit/${row.id}`,
            })
          }
          onActionClick={row =>
            navigate({
              pathname: `/${basePath}/${routeSlug}/edit/${row.id}`,
            })
          }
          actionLabel={canCreate ? 'Edit transaction' : 'View transaction'}
          actionMode={canCreate ? 'edit' : 'view'}
          emptyMessage="No transactions found."
        />
      </section>
    </div>
  );
};

const PurchasePage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const purchasePageType = getPurchasePageTypeFromPath(location.pathname, slug);

  if (slug === 'ad1') {
    return <AD1ListView />;
  }

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this purchase page." />
    );
  }

  return <PurchasePageView purchasePageType={purchasePageType} />;
};

export default PurchasePage;
