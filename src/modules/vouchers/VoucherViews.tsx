import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Table, type TableColumnDef } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { useOffsetPaginatedList } from '@/hooks';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { transactionPoliciesApi } from '@/api/transactionPolicies/transactionPolicies.api';
import { useQuery } from '@tanstack/react-query';
import { formatDateTime } from '@/utils';
import { VoucherForm } from './VoucherForm';
import {
  createVoucherIdempotencyKey,
  VOUCHER_LABELS,
  VOUCHER_LIST_TEXT,
  VOUCHER_PATHS,
} from './constants';
import { useCreateVoucher, useVoucher } from './hooks';
import { vouchersApi } from '@/api/vouchers';
import type {
  AccountingVoucher,
  VoucherFormValues,
  VoucherType,
} from './types';

const emptyItem = (
  direction: 'DEBIT' | 'CREDIT' = 'DEBIT'
): VoucherFormValues['items'][number] => ({
  itemTypeOptionId: '',
  itemTypeName: '',
  itemTypeValue: '',
  subledgerPartyProfileId: '',
  subledgerCode: '',
  accountId: '',
  accountCode: '',
  accountName: '',
  direction,
  amount: '',
  settledTransactionId: '',
  settledTransactionNumber: '',
});

const emptyValues = (
  date: string,
  branchId: string,
  counterId: string,
  type: VoucherType = 'JOURNAL'
): VoucherFormValues => ({
  transactionDate: date,
  branchId,
  counterId,
  number: '',
  accountTypeOptionId: '',
  accountTypeName: '',
  accountMode: '',
  headerAccountId: '',
  headerAccountCode: '',
  headerAccountName: '',
  entityTypeOptionId: '',
  entityTypeName: '',
  partyProfileId: '',
  partyCode: '',
  panNumber: '',
  panName: '',
  panDob: '',
  partyName: '',
  chequeNumber: '',
  chequeDate: '',
  chequeBranch: '',
  drawnOn: '',
  remarkOptionId: '',
  remarkName: '',
  narration: '',
  idempotencyKey: createVoucherIdempotencyKey(),
  items:
    type === 'DEPOSIT_WITHDRAWAL'
      ? [emptyItem('DEBIT'), emptyItem('CREDIT'), emptyItem('DEBIT')]
      : [emptyItem('DEBIT')],
});

const fromEntity = (voucher: AccountingVoucher): VoucherFormValues => ({
  transactionDate: voucher.transactionDate,
  branchId: voucher.branchId,
  counterId: voucher.counterId,
  number: voucher.number,
  accountTypeOptionId: voucher.accountTypeOptionId,
  accountTypeName:
    voucher.accountTypeSnapshot?.label ??
    voucher.accountTypeSnapshot?.name ??
    '',
  accountMode: voucher.accountMode ?? '',
  headerAccountId: voucher.headerAccountId,
  headerAccountCode: voucher.headerAccountSnapshot?.code ?? '',
  headerAccountName:
    voucher.headerAccountSnapshot?.name ??
    voucher.headerAccountSnapshot?.label ??
    '',
  entityTypeOptionId: voucher.entityTypeOptionId,
  entityTypeName:
    voucher.entityTypeSnapshot?.label ?? voucher.entityTypeSnapshot?.name ?? '',
  partyProfileId: voucher.partyProfileId,
  partyCode: voucher.partyProfileSnapshot?.code ?? '',
  panNumber: voucher.panNumber ?? '',
  panName: voucher.panName ?? '',
  panDob: voucher.panDob ?? '',
  partyName:
    voucher.partyProfileSnapshot?.name ??
    voucher.partyProfileSnapshot?.label ??
    '',
  chequeNumber: voucher.chequeNumber,
  chequeDate: voucher.chequeDate,
  chequeBranch: voucher.chequeBranch,
  drawnOn: voucher.drawnOn,
  remarkOptionId: voucher.remarkOptionId,
  remarkName:
    voucher.remarkSnapshot?.label ?? voucher.remarkSnapshot?.name ?? '',
  narration: voucher.narration,
  idempotencyKey: voucher.idempotencyKey,
  items: (() => {
    const mapped: VoucherFormValues['items'] = voucher.items.map(item => ({
      ...item,
      itemTypeName:
        item.itemTypeSnapshot?.label ?? item.itemTypeSnapshot?.name ?? '',
      itemTypeValue:
        (item.itemTypeSnapshot as { value?: string } | null | undefined)
          ?.value ??
        item.itemTypeSnapshot?.code ??
        '',
      subledgerCode: item.subledgerPartyProfileSnapshot?.code ?? '',
      accountCode: item.accountSnapshot?.code ?? '',
      accountName:
        item.accountSnapshot?.name ?? item.accountSnapshot?.label ?? '',
      settledTransactionNumber:
        (
          item.settledTransactionSnapshot as
            | { number?: string }
            | null
            | undefined
        )?.number ??
        item.settledTransactionSnapshot?.code ??
        item.settledTransactionSnapshot?.name ??
        item.settledTransactionSnapshot?.label ??
        '',
    }));
    if (
      voucher.voucherType === 'DEPOSIT_WITHDRAWAL' &&
      mapped.length === 2
    ) {
      mapped.push({
        ...emptyItem('DEBIT'),
        itemTypeName: 'Handling fees',
        itemTypeValue: 'ACCOUNT',
        amount: '',
      });
    }
    return mapped;
  })(),
});

export const VoucherListView = ({ type }: { type: VoucherType }) => {
  const navigate = useNavigate();
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
    queryKey: ['vouchers', type],
    queryFn: params => vouchersApi.list(type, params),
  });
  const label = VOUCHER_LABELS[type];

  const columns = useMemo<TableColumnDef<AccountingVoucher>[]>(
    () => [
      {
        accessorKey: 'number',
        header: VOUCHER_LIST_TEXT.number,
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary">
            {row.original.number}
          </span>
        ),
      },
      {
        accessorKey: 'transactionDate',
        header: VOUCHER_LIST_TEXT.transactionDate,
        cell: ({ row }) =>
          formatDateTime(
            `${row.original.transactionDate?.slice(0, 10)}T00:00:00`,
            'DD/MM/YYYY'
          ),
      },
      {
        id: 'party',
        header: VOUCHER_LIST_TEXT.party,
        cell: ({ row }) =>
          row.original.partyProfileSnapshot?.name ??
          row.original.partyProfileSnapshot?.label ??
          '-',
      },
      {
        accessorKey: 'finalAmount',
        header: VOUCHER_LIST_TEXT.amount,
      },
      {
        accessorKey: 'accountMode',
        header: VOUCHER_LIST_TEXT.accountMode,
        cell: ({ row }) => row.original.accountMode ?? '-',
      },
      {
        id: 'actions',
        header: VOUCHER_LIST_TEXT.actions,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`${VOUCHER_PATHS[type]}/edit/${row.original.id}`)
            }
          >
            {VOUCHER_LIST_TEXT.view}
          </Button>
        ),
      },
    ],
    [navigate, type]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {label}s
          </h1>
          <p className="text-sm text-text-secondary">
            {VOUCHER_LIST_TEXT.description(label)}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate(`${VOUCHER_PATHS[type]}/create`)}
        >
          {VOUCHER_LIST_TEXT.add(label)}
        </Button>
      </div>
      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <Table
          columns={columns}
          data={rows}
          loading={isLoading}
          isFetching={isFetching}
          enableSorting={false}
          enableFiltering={false}
          enablePagination
          manualPagination
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage={
            error instanceof Error
              ? error.message
              : VOUCHER_LIST_TEXT.empty(label)
          }
        />
      </section>
    </div>
  );
};

export const VoucherCreateView = ({ type }: { type: VoucherType }) => {
  const navigate = useNavigate();
  const { user, activeBranchId, activeCounterId, policyContext } = useAuth();
  const { createVoucher } = useCreateVoucher(type);
  const canSelectWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const [selectedBranchId, setSelectedBranchId] = useState(
    canSelectWorkplace ? '' : (activeBranchId ?? '')
  );
  const selectedBranchPolicy = useQuery({
    queryKey: ['vouchers', 'transaction-date-policy', selectedBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(selectedBranchId),
    enabled: canSelectWorkplace && Boolean(selectedBranchId),
  });
  const selectedPolicyContext = canSelectWorkplace
    ? (selectedBranchPolicy.data ??
      (selectedBranchId === activeBranchId ? policyContext : null))
    : policyContext;
  const policy = useMemo(
    () => getTransactionDatePolicy(selectedPolicyContext),
    [selectedPolicyContext]
  );
  const defaults = useMemo(
    () =>
      emptyValues(
        policy.defaultTransactionDate,
        canSelectWorkplace ? '' : (activeBranchId ?? ''),
        canSelectWorkplace ? '' : (activeCounterId ?? ''),
        type
      ),
    [
      activeBranchId,
      activeCounterId,
      canSelectWorkplace,
      policy.defaultTransactionDate,
      type,
    ]
  );
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">
          Create {VOUCHER_LABELS[type]}
        </h1>
        {policy.helperText && (
          <p className="text-sm text-text-secondary">{policy.helperText}</p>
        )}
      </div>
      <VoucherForm
        type={type}
        defaultValues={defaults}
        minDate={policy.minDate}
        maxDate={policy.maxDate}
        policyTransactionDate={policy.defaultTransactionDate}
        onBranchChange={setSelectedBranchId}
        submitDisabled={
          !policy.canPunchTransactions ||
          selectedBranchPolicy.isFetching ||
          !selectedBranchId
        }
        onBack={() => navigate(VOUCHER_PATHS[type])}
        onSubmit={async values => {
          const saved = await createVoucher(values);
          navigate(`${VOUCHER_PATHS[type]}/edit/${saved.id}`);
        }}
      />
    </div>
  );
};

export const VoucherEditView = ({ type }: { type: VoucherType }) => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { data, isLoading, error } = useVoucher(type, id);
  if (isLoading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  if (!data || error)
    return (
      <div className="text-error-600">
        {error instanceof Error ? error.message : 'Voucher not found'}
      </div>
    );
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">
          {VOUCHER_LABELS[type]} {data.number}
        </h1>
        <p className="text-sm text-text-secondary">Read-only posted record</p>
      </div>
      <VoucherForm
        type={type}
        defaultValues={fromEntity(data)}
        readOnly
        onBack={() => navigate(VOUCHER_PATHS[type])}
        onSubmit={async () => undefined}
      />
    </div>
  );
};
