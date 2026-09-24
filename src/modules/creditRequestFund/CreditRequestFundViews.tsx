import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, CardSection, DatePicker, Modal, SurfacePanel, Table, type AsyncSelectOption, type TableColumnDef } from '@/components/ui';
import {
  buildBranchToolbarFilter,
  buildSearchToolbarFilter,
  buildStaticAsyncSelectToolbarFilter,
} from '@/components/ui/table';
import { Form, FormFieldTextarea } from '@/components/forms';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { formatDateTime } from '@/utils';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { transactionPoliciesApi } from '@/api/transactionPolicies/transactionPolicies.api';
import {
  useGetBranchProfile,
  useLoadBranchOptions,
} from '@/modules/branchProfile/hooks';
import { useListPartyProfiles } from '@/modules/partyProfiles/hooks';
import { PartyProfileTypeEnum } from '@/modules/partyProfiles/types/partyProfileTypes';
import { paymentMethodForVoucherAccountMode } from '@/modules/vouchers/utils';
import { creditRequestFundApi } from '@/api/creditRequestFund';
import {
  CREDIT_REQUEST_FUND_LABELS,
  CREDIT_REQUEST_FUND_PATHS,
  CREDIT_REQUEST_FUND_STATUS,
  CREDIT_REQUEST_FUND_STATUS_OPTIONS,
  type CreditRequestFundStatus,
} from './constants';
import {
  CreditRequestFundForm,
} from './CreditRequestFundForm';
import {
  useApproveCreditRequestFund,
  useCancelCreditRequestFund,
  useCreateCreditRequestFund,
  useCreditRequestFund,
  useRejectCreditRequestFund,
  useUpdateCreditRequestFund,
} from './hooks';
import type {
  CreditRequestFund,
  CreditRequestFundFormValues,
  CreditRequestFundListQuery,
} from './types';
import { createEmptyCreditRequestFundValues } from './utils';

const snapshotLabel = (
  snapshot?: CreditRequestFund['branchSnapshot'] | null,
  fallback = '-'
) =>
  snapshot?.name ??
  snapshot?.label ??
  snapshot?.code ??
  fallback;

const fromEntity = (
  record: CreditRequestFund
): CreditRequestFundFormValues => ({
  transactionDate: record.transactionDate?.slice(0, 10) ?? '',
  branchId: record.branchId,
  counterId: record.counterId,
  number: record.number,
  destinationBranchId: record.destinationBranchId,
  accountTypeOptionId: record.accountTypeOptionId,
  accountMode: record.accountMode ?? '',
  headerAccountId: record.headerAccountId,
  headerAccountName:
    record.headerAccountSnapshot?.name ??
    record.headerAccountSnapshot?.label ??
    '',
  entityTypeOptionId: record.entityTypeOptionId,
  partyProfileId: record.partyProfileId,
  partyName:
    record.partyProfileSnapshot?.name ??
    record.partyProfileSnapshot?.label ??
    '',
  paymentMethod:
    record.paymentMethod ||
    paymentMethodForVoucherAccountMode(
      record.accountMode as
        | 'CASH'
        | 'BANK_CHEQUE'
        | 'PETTY_CASH'
        | 'CREDIT_CARD'
        | ''
        | null
        | undefined
    ),
  chequeNumber: record.chequeNumber ?? '',
  chequeDate: record.chequeDate ?? '',
  chequeBranch: record.chequeBranch ?? '',
  drawnOn: record.drawnOn ?? '',
  remarkOptionId: record.remarkOptionId ?? '',
  narration: record.narration ?? '',
  paidByPanNumber: record.paidByPanNumber ?? '',
  paidByPanName: record.paidByPanName ?? '',
  paidByPanDob: record.paidByPanDob ?? '',
  panHolderRelationOptionId: record.panHolderRelationOptionId ?? '',
  travelerPanNumber: record.travelerPanNumber ?? '',
  travelerPanName: record.travelerPanName ?? '',
  travelerPanDob: record.travelerPanDob ?? '',
  idempotencyKey: `crf-update-${record.id}`,
  items: (record.items ?? []).map(item => ({
    itemTypeOptionId: item.itemTypeOptionId,
    itemTypeValue:
      item.itemTypeSnapshot?.value ??
      item.itemTypeSnapshot?.code ??
      'ACCOUNT',
    subledgerPartyProfileId: item.subledgerPartyProfileId ?? '',
    subledgerBranchId: item.subledgerBranchId ?? '',
    subledgerCode:
      item.subledgerPartyProfileSnapshot?.code ??
      item.subledgerBranchSnapshot?.code ??
      item.subledgerPartyProfileSnapshot?.name ??
      item.subledgerBranchSnapshot?.name ??
      '',
    accountId: item.accountId,
    accountCode: item.accountSnapshot?.code ?? '',
    accountName:
      item.accountSnapshot?.name ?? item.accountSnapshot?.label ?? '',
    direction: item.direction,
    amount: String(item.amount ?? ''),
  })),
});

const LinkedVouchersSection = ({ record }: { record: CreditRequestFund }) => {
  const links: Array<{ label: string; id?: string | null; number?: string }> = [
    {
      label: CREDIT_REQUEST_FUND_LABELS.destinationReceipt,
      id: record.destinationReceiptVoucherId,
      number:
        record.destinationReceiptVoucherSnapshot?.code ??
        record.destinationReceiptVoucherSnapshot?.name ??
        record.destinationReceiptVoucherSnapshot?.label,
    },
    {
      label: CREDIT_REQUEST_FUND_LABELS.requestingReceipt,
      id: record.requestingReceiptVoucherId,
      number:
        record.requestingReceiptVoucherSnapshot?.code ??
        record.requestingReceiptVoucherSnapshot?.name ??
        record.requestingReceiptVoucherSnapshot?.label,
    },
    {
      label: CREDIT_REQUEST_FUND_LABELS.requestingPayment,
      id: record.requestingPaymentVoucherId,
      number:
        record.requestingPaymentVoucherSnapshot?.code ??
        record.requestingPaymentVoucherSnapshot?.name ??
        record.requestingPaymentVoucherSnapshot?.label,
    },
  ].filter(item => item.id);

  if (!links.length) return null;

  return (
    <CardSection heading={CREDIT_REQUEST_FUND_LABELS.linkedVouchers}>
      <ul className="space-y-2 text-sm">
        {links.map(link => {
          const isPayment =
            link.label === CREDIT_REQUEST_FUND_LABELS.requestingPayment;
          const href = isPayment
            ? `/payments/edit/${link.id}`
            : `/receipts/edit/${link.id}`;
          return (
            <li key={link.id} className="flex flex-wrap items-center gap-2">
              <span className="text-text-secondary">{link.label}:</span>
              <Link
                to={href}
                className="font-medium text-primary-600 underline-offset-2 hover:underline"
              >
                {link.number || link.id}
              </Link>
            </li>
          );
        })}
      </ul>
    </CardSection>
  );
};

const RejectRemarksModal = ({
  open,
  onOpenChange,
  rejecting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejecting: boolean;
  onConfirm: (remarks: string) => void;
}) => (
  <Form<{ rejectionRemarks: string }>
    id="crf-reject-form"
    defaultValues={{ rejectionRemarks: '' }}
    onSubmit={values => {
      const remarks = String(values.rejectionRemarks ?? '').trim();
      if (!remarks) {
        toast.error('Rejection remarks are required');
        return;
      }
      onConfirm(remarks);
    }}
  >
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={CREDIT_REQUEST_FUND_LABELS.rejectTitle}
      description={CREDIT_REQUEST_FUND_LABELS.rejectDescription}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={rejecting}
            onClick={() => onOpenChange(false)}
          >
            {CREDIT_REQUEST_FUND_LABELS.rejectCancel}
          </Button>
          <Button
            type="submit"
            form="crf-reject-form"
            disabled={rejecting}
          >
            {rejecting
              ? CREDIT_REQUEST_FUND_LABELS.rejecting
              : CREDIT_REQUEST_FUND_LABELS.rejectConfirm}
          </Button>
        </div>
      }
    >
      <FormFieldTextarea
        name="rejectionRemarks"
        label={CREDIT_REQUEST_FUND_LABELS.rejectionRemarks}
        rows={4}
        wrapperClassName="max-w-none"
      />
    </Modal>
  </Form>
);

export const CreditRequestFundListView = () => {
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const { user, activeBranchId } = useAuth();
  const canChooseBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });

  const [statusOption, setStatusOption] = useState<AsyncSelectOption | null>(
    null
  );
  const [branchOption, setBranchOption] = useState<AsyncSelectOption | null>(
    null
  );
  const [partyOption, setPartyOption] = useState<AsyncSelectOption | null>(
    null
  );
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const branchId = canChooseBranch
    ? branchOption?.value
      ? String(branchOption.value)
      : undefined
    : (activeBranchId ?? undefined);

  const { data: partyResponse, isLoading: partiesLoading } =
    useListPartyProfiles(
      {
        limit: 100,
        activeOnly: true,
        status: 'APPROVE',
      },
      Object.values(PartyProfileTypeEnum)
    );
  const partyOptions = useMemo(
    () =>
      (partyResponse?.data ?? []).map(party => ({
        value: party.id,
        label: `${party.code} - ${party.name}`,
      })),
    [partyResponse]
  );

  const filters = useMemo<CreditRequestFundListQuery>(
    () => ({
      status: statusOption?.value
        ? (String(statusOption.value) as CreditRequestFundStatus)
        : undefined,
      branchId,
      partyProfileId: partyOption?.value
        ? String(partyOption.value)
        : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [
      branchId,
      dateFrom,
      dateTo,
      debouncedSearch,
      partyOption,
      statusOption,
    ]
  );

  const resetOffset = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!next.has('limit')) {
        next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return next;
    });
  }, [setSearchParams]);

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
    queryKey: ['credit-request-fund'],
    queryFn: params => creditRequestFundApi.list(params),
    filters,
  });

  const columns = useMemo<TableColumnDef<CreditRequestFund>[]>(
    () => [
      {
        accessorKey: 'number',
        header: CREDIT_REQUEST_FUND_LABELS.number,
        cell: ({ row }) => (
          <span className="font-semibold text-text-primary">
            {row.original.number}
          </span>
        ),
      },
      {
        accessorKey: 'transactionDate',
        header: CREDIT_REQUEST_FUND_LABELS.transactionDate,
        cell: ({ row }) =>
          formatDateTime(
            `${row.original.transactionDate?.slice(0, 10)}T00:00:00`,
            'DD/MM/YYYY'
          ),
      },
      {
        id: 'branch',
        header: CREDIT_REQUEST_FUND_LABELS.branch,
        cell: ({ row }) => snapshotLabel(row.original.branchSnapshot),
      },
      {
        id: 'destination',
        header: CREDIT_REQUEST_FUND_LABELS.destinationBranch,
        cell: ({ row }) =>
          snapshotLabel(row.original.destinationBranchSnapshot),
      },
      {
        id: 'party',
        header: CREDIT_REQUEST_FUND_LABELS.party,
        cell: ({ row }) => snapshotLabel(row.original.partyProfileSnapshot),
      },
      {
        accessorKey: 'finalAmount',
        header: CREDIT_REQUEST_FUND_LABELS.amount,
      },
      {
        accessorKey: 'status',
        header: CREDIT_REQUEST_FUND_LABELS.status,
        cell: ({ row }) =>
          CREDIT_REQUEST_FUND_STATUS_OPTIONS.find(
            option => option.value === row.original.status
          )?.label ?? row.original.status,
      },
      {
        id: 'actions',
        header: CREDIT_REQUEST_FUND_LABELS.actions,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(CREDIT_REQUEST_FUND_PATHS.edit(row.original.id))
            }
          >
            {CREDIT_REQUEST_FUND_LABELS.viewAction}
          </Button>
        ),
      },
    ],
    [navigate]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: value => {
          setSearch(value);
          resetOffset();
        },
        placeholder: CREDIT_REQUEST_FUND_LABELS.searchPlaceholder,
      }),
      buildStaticAsyncSelectToolbarFilter({
        id: 'status',
        label: CREDIT_REQUEST_FUND_LABELS.status,
        options: CREDIT_REQUEST_FUND_STATUS_OPTIONS.map(option => ({
          value: option.value,
          label: option.label,
        })),
        value: statusOption,
        onChange: option => {
          setStatusOption(option);
          resetOffset();
        },
        placeholder: CREDIT_REQUEST_FUND_LABELS.allStatuses,
      }),
      buildBranchToolbarFilter({
        visible: canChooseBranch,
        value: branchOption,
        loadOptions: loadBranchOptions,
        onChange: option => {
          setBranchOption(option);
          resetOffset();
        },
        placeholder: CREDIT_REQUEST_FUND_LABELS.allBranches,
      }),
      {
        id: 'party',
        type: 'asyncSelect' as const,
        label: CREDIT_REQUEST_FUND_LABELS.party,
        value: partyOption,
        loadOptions: async (inputValue: string) => {
          const normalized = inputValue.trim().toLowerCase();
          return {
            options: partyOptions.filter(option => {
              if (!normalized) return true;
              return option.label.toLowerCase().includes(normalized);
            }),
          };
        },
        onChange: (option: AsyncSelectOption | null) => {
          setPartyOption(option);
          resetOffset();
        },
        placeholder: CREDIT_REQUEST_FUND_LABELS.allParties,
        defaultOptions: true,
        pagination: false,
        isSearchable: true,
        isClearable: true,
        isDisabled: partiesLoading,
        className: 'w-56 shrink-0',
      },
      {
        id: 'dates',
        type: 'custom' as const,
        className: 'flex shrink-0 flex-wrap items-end gap-2',
        render: () => (
          <>
            <div className="w-40">
              <DatePicker
                label={CREDIT_REQUEST_FUND_LABELS.dateFrom}
                dateFormat="dd/MM/yyyy"
                selected={dateFrom ? new Date(`${dateFrom}T00:00:00`) : null}
                onChange={date => {
                  setDateFrom(
                    date
                      ? `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
                      : ''
                  );
                  resetOffset();
                }}
              />
            </div>
            <div className="w-40">
              <DatePicker
                label={CREDIT_REQUEST_FUND_LABELS.dateTo}
                dateFormat="dd/MM/yyyy"
                selected={dateTo ? new Date(`${dateTo}T00:00:00`) : null}
                onChange={date => {
                  setDateTo(
                    date
                      ? `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
                      : ''
                  );
                  resetOffset();
                }}
              />
            </div>
          </>
        ),
      },
    ],
    [
      branchOption,
      canChooseBranch,
      dateFrom,
      dateTo,
      loadBranchOptions,
      partiesLoading,
      partyOption,
      partyOptions,
      resetOffset,
      search,
      statusOption,
    ]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            {CREDIT_REQUEST_FUND_LABELS.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {CREDIT_REQUEST_FUND_LABELS.description}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate(CREDIT_REQUEST_FUND_PATHS.create)}
        >
          {CREDIT_REQUEST_FUND_LABELS.add}
        </Button>
      </div>
      <SurfacePanel>
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
          toolbarFilters={toolbarFilters}
          emptyMessage={
            error instanceof Error
              ? error.message
              : CREDIT_REQUEST_FUND_LABELS.empty
          }
        />
      </SurfacePanel>
    </div>
  );
};

export const CreditRequestFundCreateView = () => {
  const navigate = useNavigate();
  const { user, activeBranchId, activeCounterId, policyContext } = useAuth();
  const createMutation = useCreateCreditRequestFund();
  const canSelectWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const [selectedBranchId, setSelectedBranchId] = useState(
    canSelectWorkplace ? '' : (activeBranchId ?? '')
  );
  const selectedBranchPolicy = useQuery({
    queryKey: [
      'credit-request-fund',
      'transaction-date-policy',
      selectedBranchId,
    ],
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
      createEmptyCreditRequestFundValues(
        policy.defaultTransactionDate,
        canSelectWorkplace ? '' : (activeBranchId ?? ''),
        canSelectWorkplace ? '' : (activeCounterId ?? '')
      ),
    [
      activeBranchId,
      activeCounterId,
      canSelectWorkplace,
      policy.defaultTransactionDate,
    ]
  );

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold">
          {CREDIT_REQUEST_FUND_LABELS.create}
        </h1>
        {policy.helperText ? (
          <p className="text-sm text-text-secondary">{policy.helperText}</p>
        ) : null}
      </div>
      <CreditRequestFundForm
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
        onBack={() => navigate(CREDIT_REQUEST_FUND_PATHS.list)}
        onSubmit={async values => {
          const saved = await createMutation.mutateAsync(values);
          navigate(CREDIT_REQUEST_FUND_PATHS.edit(saved.id));
        }}
      />
    </div>
  );
};

export const CreditRequestFundEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { user, activeBranchId, policyContext } = useAuth();
  const { data, isLoading, error } = useCreditRequestFund(id);
  const { data: activeBranch } = useGetBranchProfile(activeBranchId ?? '');
  const updateMutation = useUpdateCreditRequestFund(id);
  const approveMutation = useApproveCreditRequestFund();
  const rejectMutation = useRejectCreditRequestFund();
  const cancelMutation = useCancelCreditRequestFund();
  const [rejectOpen, setRejectOpen] = useState(false);

  const isPrivileged = Boolean(
    user?.isAdmin ||
      user?.isHo ||
      user?.isHoStaff ||
      activeBranch?.isHeadOffice
  );
  const isPending =
    data?.status === CREDIT_REQUEST_FUND_STATUS.PENDING;
  const isRequestingBranch =
    Boolean(data?.branchId) && data?.branchId === activeBranchId;
  const canEdit = Boolean(
    isPending && (isPrivileged || isRequestingBranch)
  );
  const canCancel = Boolean(
    isPending && (isPrivileged || isRequestingBranch)
  );
  const canApproveReject = Boolean(isPending && isPrivileged);

  const policy = useMemo(
    () => getTransactionDatePolicy(policyContext),
    [policyContext]
  );

  const statusNote = useMemo(() => {
    if (!data) return '';
    if (data.status === CREDIT_REQUEST_FUND_STATUS.APPROVE) {
      return CREDIT_REQUEST_FUND_LABELS.approvedReadonly;
    }
    if (data.status === CREDIT_REQUEST_FUND_STATUS.REJECT) {
      return data.rejectionRemarks
        ? `${CREDIT_REQUEST_FUND_LABELS.rejectedReadonly}: ${data.rejectionRemarks}`
        : CREDIT_REQUEST_FUND_LABELS.rejectedReadonly;
    }
    if (data.status === CREDIT_REQUEST_FUND_STATUS.CANCELLED) {
      return CREDIT_REQUEST_FUND_LABELS.cancelledReadonly;
    }
    return canEdit
      ? CREDIT_REQUEST_FUND_LABELS.pendingEditable
      : CREDIT_REQUEST_FUND_LABELS.pendingReadonly;
  }, [canEdit, data]);

  const statusActions = useMemo(() => {
    if (!data || !isPending) return null;
    const actions: ReactNode[] = [];
    if (canApproveReject) {
      actions.push(
        <Button
          key="approve"
          type="button"
          disabled={approveMutation.isPending || rejectMutation.isPending}
          onClick={() => {
            void approveMutation
              .mutateAsync({
                id: data.id,
                transactionDate: policy.defaultTransactionDate,
              })
              .then(() => undefined);
          }}
        >
          {approveMutation.isPending
            ? CREDIT_REQUEST_FUND_LABELS.approving
            : CREDIT_REQUEST_FUND_LABELS.approve}
        </Button>
      );
      actions.push(
        <Button
          key="reject"
          type="button"
          variant="outline"
          disabled={approveMutation.isPending || rejectMutation.isPending}
          onClick={() => setRejectOpen(true)}
        >
          {CREDIT_REQUEST_FUND_LABELS.reject}
        </Button>
      );
    }
    if (canCancel) {
      actions.push(
        <Button
          key="cancel"
          type="button"
          variant="outline"
          disabled={cancelMutation.isPending}
          onClick={() => {
            void cancelMutation.mutateAsync(data.id);
          }}
        >
          {cancelMutation.isPending
            ? CREDIT_REQUEST_FUND_LABELS.cancelling
            : CREDIT_REQUEST_FUND_LABELS.cancel}
        </Button>
      );
    }
    return actions.length ? (
      <div className="flex flex-wrap gap-2">{actions}</div>
    ) : null;
  }, [
    approveMutation,
    canApproveReject,
    canCancel,
    cancelMutation,
    data,
    isPending,
    policy.defaultTransactionDate,
    rejectMutation.isPending,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="text-error-600">
        {error instanceof Error
          ? error.message
          : 'Credit Request Fund not found'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-semibold">
          {CREDIT_REQUEST_FUND_LABELS.title} {data.number}
        </h1>
        <p className="text-sm text-text-secondary">{statusNote}</p>
      </div>
      <CreditRequestFundForm
        defaultValues={fromEntity(data)}
        readOnly={!canEdit}
        showSubmit={canEdit}
        minDate={policy.minDate}
        maxDate={policy.maxDate}
        submitDisabled={canEdit && !policy.canPunchTransactions}
        statusActions={statusActions}
        linkedVouchers={
          data.status === CREDIT_REQUEST_FUND_STATUS.APPROVE ? (
            <LinkedVouchersSection record={data} />
          ) : null
        }
        onBack={() => navigate(CREDIT_REQUEST_FUND_PATHS.list)}
        onSubmit={async values => {
          await updateMutation.mutateAsync(values);
        }}
      />
      <RejectRemarksModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        rejecting={rejectMutation.isPending}
        onConfirm={remarks => {
          void rejectMutation
            .mutateAsync({ id: data.id, remarks })
            .then(() => setRejectOpen(false));
        }}
      />
    </div>
  );
};
