import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { transactionPoliciesApi } from '@/api/transactionPolicies/transactionPolicies.api';
import { VoucherForm } from './VoucherForm';
import { createVoucherIdempotencyKey, VOUCHER_LABELS, VOUCHER_PATHS } from './constants';
import { useCreateVoucher, useVoucher, useVoucherList } from './hooks';
import type { AccountingVoucher, VoucherFormValues, VoucherType } from './types';

const emptyValues = (date: string, branchId: string, counterId: string): VoucherFormValues => ({
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
  items: [{ itemTypeOptionId: '', subledgerPartyProfileId: '', accountId: '', accountName: '', direction: 'DEBIT', amount: '' }],
});

const displayDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const fromEntity = (voucher: AccountingVoucher): VoucherFormValues => ({
  transactionDate: voucher.transactionDate,
  branchId: voucher.branchId,
  counterId: voucher.counterId,
  number: voucher.number,
  accountTypeOptionId: voucher.accountTypeOptionId,
  accountTypeName: voucher.accountTypeSnapshot?.label ?? voucher.accountTypeSnapshot?.name ?? '',
  accountMode: voucher.accountMode ?? '',
  headerAccountId: voucher.headerAccountId,
  headerAccountCode: voucher.headerAccountSnapshot?.code ?? '',
  headerAccountName: voucher.headerAccountSnapshot?.name ?? voucher.headerAccountSnapshot?.label ?? '',
  entityTypeOptionId: voucher.entityTypeOptionId,
  entityTypeName: voucher.entityTypeSnapshot?.label ?? voucher.entityTypeSnapshot?.name ?? '',
  partyProfileId: voucher.partyProfileId,
  partyCode: voucher.partyProfileSnapshot?.code ?? '',
  panNumber: voucher.panNumber ?? '',
  panName: voucher.panName ?? '',
  panDob: voucher.panDob ?? '',
  partyName: voucher.partyProfileSnapshot?.name ?? voucher.partyProfileSnapshot?.label ?? '',
  chequeNumber: voucher.chequeNumber,
  chequeDate: voucher.chequeDate,
  chequeBranch: voucher.chequeBranch,
  drawnOn: voucher.drawnOn,
  remarkOptionId: voucher.remarkOptionId,
  remarkName: voucher.remarkSnapshot?.label ?? voucher.remarkSnapshot?.name ?? '',
  narration: voucher.narration,
  idempotencyKey: voucher.idempotencyKey,
  items: voucher.items.map(item => ({
    ...item,
    itemTypeName: item.itemTypeSnapshot?.label ?? item.itemTypeSnapshot?.name ?? '',
    subledgerCode: item.subledgerPartyProfileSnapshot?.code ?? '',
    accountCode: item.accountSnapshot?.code ?? '',
    accountName: item.accountSnapshot?.name ?? item.accountSnapshot?.label ?? '',
  })),
});

export const VoucherListView = ({ type }: { type: VoucherType }) => {
  const { data, isLoading, error } = useVoucherList(type);
  const label = VOUCHER_LABELS[type];
  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader /></div>;
  return <div className="space-y-5">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">{label}s</h1><p className="text-sm text-text-secondary">Immutable {label.toLowerCase()} records</p></div><Link to={`${VOUCHER_PATHS[type]}/create`}><Button>Add {label}</Button></Link></div>
    {error && <p className="text-error-600">{error instanceof Error ? error.message : 'Failed to load vouchers'}</p>}
    <div className="space-y-2">{(data?.data ?? []).map(voucher => <Link key={voucher.id} to={`${VOUCHER_PATHS[type]}/edit/${voucher.id}`} className="grid gap-2 rounded-lg border bg-white p-4 hover:border-primary-300 md:grid-cols-5">
      <span className="font-medium">{voucher.number}</span><span>{displayDate(voucher.transactionDate)}</span><span>{voucher.partyProfileSnapshot?.name ?? '-'}</span><span>{voucher.finalAmount}</span><span>{voucher.accountMode ?? '-'}</span>
    </Link>)}{!data?.data.length && <div className="rounded-lg border bg-white p-8 text-center text-text-secondary">No {label.toLowerCase()} records found.</div>}</div>
  </div>;
};

export const VoucherCreateView = ({ type }: { type: VoucherType }) => {
  const navigate = useNavigate();
  const { user, activeBranchId, activeCounterId, policyContext } = useAuth();
  const { createVoucher } = useCreateVoucher(type);
  const canSelectWorkplace = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);
  const [selectedBranchId, setSelectedBranchId] = useState(canSelectWorkplace ? '' : activeBranchId ?? '');
  const selectedBranchPolicy = useQuery({
    queryKey: ['vouchers', 'transaction-date-policy', selectedBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(selectedBranchId),
    enabled: canSelectWorkplace && Boolean(selectedBranchId),
  });
  const selectedPolicyContext = canSelectWorkplace
    ? selectedBranchPolicy.data ?? (selectedBranchId === activeBranchId ? policyContext : null)
    : policyContext;
  const policy = useMemo(() => getTransactionDatePolicy(selectedPolicyContext), [selectedPolicyContext]);
  const defaults = useMemo(() => emptyValues(policy.defaultTransactionDate, canSelectWorkplace ? '' : activeBranchId ?? '', canSelectWorkplace ? '' : activeCounterId ?? ''), [activeBranchId, activeCounterId, canSelectWorkplace, policy.defaultTransactionDate]);
  return <div className="space-y-5"><div><h1 className="text-2xl font-semibold">Create {VOUCHER_LABELS[type]}</h1>{policy.helperText && <p className="text-sm text-text-secondary">{policy.helperText}</p>}</div><VoucherForm type={type} defaultValues={defaults} minDate={policy.minDate} maxDate={policy.maxDate} policyTransactionDate={policy.defaultTransactionDate} onBranchChange={setSelectedBranchId} submitDisabled={!policy.canPunchTransactions || selectedBranchPolicy.isFetching || !selectedBranchId} onBack={() => navigate(VOUCHER_PATHS[type])} onSubmit={async values => { const saved = await createVoucher(values); navigate(`${VOUCHER_PATHS[type]}/edit/${saved.id}`); }} /></div>;
};

export const VoucherEditView = ({ type }: { type: VoucherType }) => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { data, isLoading, error } = useVoucher(type, id);
  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader /></div>;
  if (!data || error) return <div className="text-error-600">{error instanceof Error ? error.message : 'Voucher not found'}</div>;
  return <div className="space-y-5"><div><h1 className="text-2xl font-semibold">{VOUCHER_LABELS[type]} {data.number}</h1><p className="text-sm text-text-secondary">Read-only posted record</p></div><VoucherForm type={type} defaultValues={fromEntity(data)} readOnly onBack={() => navigate(VOUCHER_PATHS[type])} onSubmit={async () => undefined} /></div>;
};
