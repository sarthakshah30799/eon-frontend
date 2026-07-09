import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button1';
import { NotFoundState } from '@/components/ui/not-found-state';
import { Table, type TableColumnDef } from '@/components/ui/table';
import { useAuth } from '@/lib/AuthContext';
import { transactionsApi } from '@/api/transactions';
import { TransactionStatusEnum, type ITransactionEntity } from '@/modules/transactions';
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

interface TransactionRow {
  id: string;
  number: string;
  branch: string;
  partyProfile: string;
  transactionType: string;
  tradeMode: string;
  status: string;
  createdAt: string;
}

const formatReference = (value?: { code?: string | null; name?: string | null; label?: string | null } | null) => {
  if (!value) return '-';
  if (value.label) return value.label;
  if (value.code && value.name) return `${value.code} - ${value.name}`;
  return value.name || value.code || '-';
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

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

  const rows = useMemo<TransactionRow[]>(
    () =>
      (transactions as ITransactionEntity[]).map(transaction => ({
        id: transaction.id,
        number: transaction.number ?? '-',
        branch: formatReference(transaction.branchSnapshot),
        partyProfile: formatReference(transaction.partyProfileSnapshot),
        transactionType: transaction.transactionType,
        tradeMode: transaction.tradeMode,
        status: transaction.status,
        createdAt: formatDateTime(transaction.createdAt),
      })),
    [transactions]
  );

  const columns: TableColumnDef<TransactionRow>[] = useMemo(
    () => [
      {
        accessorKey: 'number',
        header: 'Number',
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary">{row.original.number}</span>
        ),
      },
      { accessorKey: 'branch', header: 'Branch' },
      { accessorKey: 'partyProfile', header: 'Party Profile' },
      { accessorKey: 'transactionType', header: 'Type' },
      { accessorKey: 'tradeMode', header: 'Trade Mode' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={[
              'inline-flex rounded px-2 py-0.5 text-[10px] font-semibold',
              row.original.status === TransactionStatusEnum.APPROVED
                ? 'bg-emerald-100 text-emerald-800'
                : row.original.status === TransactionStatusEnum.REJECTED
                  ? 'bg-rose-100 text-rose-800'
                  : row.original.status === TransactionStatusEnum.PENDING
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700',
            ].join(' ')}
          >
            {row.original.status}
          </span>
        ),
      },
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
              aria-label="Edit transaction"
              variant="ghost"
              size="icon"
              className="rounded-sm bg-transparent text-black! hover:bg-surface-secondary hover:text-text-primary"
              onClick={event => {
                event.stopPropagation();
                navigate({
                  pathname: `/${basePath}/${routeSlug}/edit/${row.original.id}`,
                });
              }}
            >
              {canCreate ? (
                <PencilSquareIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [basePath, canCreate, navigate, routeSlug]
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
          searchPlaceholder="Search transaction number"
          onRowClick={row =>
            navigate({
              pathname: `/${basePath}/${routeSlug}/edit/${row.id}`,
            })
          }
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

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this purchase page." />
    );
  }

  return <PurchasePageView purchasePageType={purchasePageType} />;
};

export default PurchasePage;
