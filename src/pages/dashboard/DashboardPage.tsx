import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { usePendingPartyProfileReviews } from '@/modules/partyProfiles/hooks';
import { PartyProfileReviewQueue } from '@/modules/partyProfiles/components';
import { useListChequeBooks } from '@/modules/chequebooks/hooks';
import { ChequeBookStatusEnum } from '@/modules/chequebooks/types';
import { useListManualBillBooks } from '@/modules/manual-bill-books/hooks';
import { ManualBillBookStatusEnum } from '@/modules/manual-bill-books/types';
import { transactionsApi } from '@/api/transactions';
import { Button } from '@/components/ui';
import type { ITransactionEntity } from '@/modules/transactions';
import {
  getPurchasePageBasePath,
  getPurchasePageSlugFromType,
  type PurchasePageType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import { formatDateTime } from '@/utils';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeBranchId } = useAuth();
  const isReviewer = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const queryClient = useQueryClient();

  const { data: pendingReviews = [], isLoading } =
    usePendingPartyProfileReviews();

  const { data: pendingChequeBooks = [], isLoading: isLoadingChequebooks } =
    useListChequeBooks({
      status: ChequeBookStatusEnum.PENDING,
    });

  const {
    data: pendingManualBillBooks = [],
    isLoading: isLoadingManualBillBooks,
  } = useListManualBillBooks({
    status: ManualBillBookStatusEnum.PENDING,
  });

  const {
    data: pendingTransactions = [],
    isLoading: isLoadingPendingTransactions,
  } = useQuery({
    queryKey: ['transactions', 'draft-reviews', activeBranchId],
    queryFn: () =>
      transactionsApi.getTransactions({
        status: 'DRAFT',
        branchId: activeBranchId ?? undefined,
      }),
    enabled: isReviewer && Boolean(activeBranchId),
  });

  const approveTransactionMutation = useMutation({
    mutationFn: (transactionId: string) =>
      transactionsApi.approveTransaction(transactionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction approved successfully');
    },
    onError: error => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to approve transaction'
      );
    },
  });

  const myPendingChequeBooks = useMemo(() => {
    return pendingChequeBooks.filter(book => {
      const assignedId =
        typeof book.assignedTo === 'object' && book.assignedTo !== null
          ? book.assignedTo.id
          : book.assignedTo;
      return assignedId === user?.id;
    });
  }, [pendingChequeBooks, user?.id]);

  const myPendingManualBillBooks = useMemo(() => {
    return pendingManualBillBooks.filter(book => {
      const assignedId =
        typeof book.assignedTo === 'object' && book.assignedTo !== null
          ? book.assignedTo.id
          : book.assignedTo;
      return assignedId === user?.id;
    });
  }, [pendingManualBillBooks, user?.id]);

  const myPendingTransactions = useMemo(
    () =>
      (pendingTransactions as ITransactionEntity[]).filter(transaction => {
        const branchId = transaction.branchId;
        return !activeBranchId || branchId === activeBranchId;
      }),
    [activeBranchId, pendingTransactions]
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-sm border border-border-primary bg-surface-primary shadow-sm">
        <div className="grid gap-6 bg-gradient-to-br from-primary-50 via-surface-primary to-primary-100 px-6 py-8 text-text-primary sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10">
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                Review pending party profiles, manage master data, and keep the
                approval flow moving from one place.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-sm border border-border-primary bg-surface-primary p-4">
            {[
              ['Master', 'Profiles and setups'],
              ['Transactions', 'Receipt and stock flows'],
              ['Access', 'Admin profile controls'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-sm border border-border-primary bg-gradient-to-br from-surface-primary to-surface-secondary px-4 py-3"
              >
                <p className="text-xs uppercase text-text-tertiary">{label}</p>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isReviewer && (
        <PartyProfileReviewQueue
          profiles={pendingReviews}
          isLoading={isLoading}
          onReviewProfile={profile => {
            navigate(`/party-profiles/${profile.type}/edit/${profile.id}`);
          }}
        />
      )}

      {isReviewer && myPendingTransactions.length > 0 && (
        <section className="rounded-sm border border-border-primary bg-surface-primary p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-tertiary">
                Transactions
              </p>
              <h3 className="text-lg font-semibold text-text-primary">
                Pending Transaction Reviews
              </h3>
            </div>
            <p className="text-sm text-text-secondary">
              {isLoadingPendingTransactions
                ? 'Loading...'
                : `${myPendingTransactions.length} item(s) pending`}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {myPendingTransactions.map(transaction => (
              <article
                key={transaction.id}
                className="flex flex-col gap-3 rounded-sm border border-border-primary bg-surface-secondary px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {transaction.number || 'Transaction'}
                    </p>
                    <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                      Draft
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Party:{' '}
                    {transaction.partyProfileSnapshot?.label ||
                      transaction.partyProfileSnapshot?.name ||
                      transaction.partyProfileId}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Branch:{' '}
                    {transaction.branchSnapshot?.label ||
                      transaction.branchSnapshot?.name ||
                      transaction.branchId}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-sm"
                    onClick={() => {
                      const transactionPageType =
                        transaction.slug as PurchasePageType | null;
                      const routeSlug =
                        getPurchasePageSlugFromType(transactionPageType) ??
                        transaction.slug ??
                        '';

                      navigate(
                        `/${getPurchasePageBasePath(transactionPageType)}/${routeSlug}/edit/${transaction.id}`
                      );
                    }}
                  >
                    Review
                  </Button>
                  <Button
                    type="button"
                    className="rounded-sm"
                    onClick={() =>
                      void approveTransactionMutation.mutateAsync(
                        transaction.id
                      )
                    }
                    disabled={approveTransactionMutation.isPending}
                  >
                    Approve
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Pending Chequebook dispatches */}
      {myPendingChequeBooks.length > 0 && (
        <section className="rounded-sm border border-border-primary bg-surface-primary p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-tertiary">
                Chequebooks
              </p>
              <h3 className="text-lg font-semibold text-text-primary">
                Pending Chequebook Dispatches
              </h3>
            </div>
            <p className="text-sm text-text-secondary">
              {isLoadingChequebooks
                ? 'Loading...'
                : `${myPendingChequeBooks.length} item(s) pending`}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {myPendingChequeBooks.map(book => (
              <article
                key={book.id}
                className="flex flex-col gap-3 rounded-sm border border-border-primary bg-surface-secondary px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {book.no || 'Chequebook'}
                    </p>
                    <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                      Pending Approval
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Branch: {book.branchName || book.branchCode || 'N/A'} ·
                    Range: {book.bookNoFrom} - {book.bookNoTo}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Dispatch Date: {formatDateTime(book.dispatchDate, true)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-sm"
                  onClick={() => navigate(`/checkbooks?reviewId=${book.id}`)}
                >
                  Review
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Pending Manual Bill Book dispatches */}
      {myPendingManualBillBooks.length > 0 && (
        <section className="rounded-sm border border-border-primary bg-surface-primary p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-tertiary">
                Manual Bill Books
              </p>
              <h3 className="text-lg font-semibold text-text-primary">
                Pending Manual Bill Book Dispatches
              </h3>
            </div>
            <p className="text-sm text-text-secondary">
              {isLoadingManualBillBooks
                ? 'Loading...'
                : `${myPendingManualBillBooks.length} item(s) pending`}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {myPendingManualBillBooks.map(book => (
              <article
                key={book.id}
                className="flex flex-col gap-3 rounded-sm border border-border-primary bg-surface-secondary px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {book.no || 'Manual Bill Book'}
                    </p>
                    <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                      Pending Approval
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Branch: {book.branchName || book.branchCode || 'N/A'} ·
                    Range: {book.bookNoFrom} - {book.bookNoTo}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Dispatch Date: {formatDateTime(book.dispatchDate, true)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-sm"
                  onClick={() =>
                    navigate(`/manual-bill-books?reviewId=${book.id}`)
                  }
                >
                  Review
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Currency Profiles',
            description: 'Maintain the supported currency records.',
          },
          {
            title: 'Company Profile',
            description: 'Keep organization details in one place.',
          },
          {
            title: 'Receipt',
            description: 'Record accounting transaction inflows.',
          },
          {
            title: 'Stock Transaction',
            description: 'Manage stock receipt and returns.',
          },
        ].map(card => (
          <article
            key={card.title}
            className="rounded-sm bg-surface-primary p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-text-primary">
              {card.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {card.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;
