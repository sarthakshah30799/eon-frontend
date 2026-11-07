import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  BankReconciliationFiltersSection,
  BankReconciliationFooter,
  BankReconciliationTableSection,
} from '../components';
import { BANK_RECONCILIATION_TEXT } from '../constants';
import {
  useBankReconciliationQuery,
  useClearBankReconciliation,
} from '../hooks';
import {
  BankReconciliationBankAllValue,
  BankReconciliationTransactionTypeEnum,
  BankReconciliationUnclearedEnum,
  type IBankReconciliationEditableRow,
  type IBankReconciliationFilterForm,
  type IBankReconciliationQuery,
} from '../types';
import { rowKey, toEditableRow } from '../utils';

const buildDefaultFilters = (
  transactionDate: string | null | undefined
): IBankReconciliationFilterForm => ({
  branchId: '',
  bankAccountId: BankReconciliationBankAllValue,
  startDate: transactionDate || '',
  endDate: transactionDate || '',
  passengerName: '',
  transactionType: BankReconciliationTransactionTypeEnum.ALL,
  unclearedOnly: BankReconciliationUnclearedEnum.YES,
});

type AppliedQuery = IBankReconciliationQuery & { processNonce: number };
type RowEditPatch = Partial<
  Pick<
    IBankReconciliationEditableRow,
    | 'selected'
    | 'editBankDate'
    | 'editRemarks'
    | 'editDishonored'
    | 'editReversalNumber'
  >
>;

export const BankReconciliationView = () => {
  const { user, policyContext } = useAuth();
  const canView = Boolean(user);
  const transactionDate = policyContext?.transactionDate ?? null;

  const [formVersion, setFormVersion] = useState(0);
  const [overrideFilters, setOverrideFilters] =
    useState<IBankReconciliationFilterForm | null>(null);
  const [appliedQuery, setAppliedQuery] = useState<AppliedQuery | null>(null);
  const [rowEdits, setRowEdits] = useState<Record<string, RowEditPatch>>({});

  const defaultFilters =
    overrideFilters ?? buildDefaultFilters(transactionDate);
  const formKey = overrideFilters
    ? `user-${formVersion}`
    : `policy-${transactionDate ?? 'pending'}-${formVersion}`;

  const query = useBankReconciliationQuery(
    appliedQuery,
    Boolean(appliedQuery)
  );
  const clearMutation = useClearBankReconciliation();

  const receivedRows = useMemo(() => {
    if (!query.data) return [];
    return query.data.receivedNotDeposited.map(row => {
      const base = toEditableRow(row);
      return { ...base, ...rowEdits[rowKey(base)] };
    });
  }, [query.data, rowEdits]);

  const issuedRows = useMemo(() => {
    if (!query.data) return [];
    return query.data.issuedNotPresented.map(row => {
      const base = toEditableRow(row);
      return { ...base, ...rowEdits[rowKey(base)] };
    });
  }, [query.data, rowEdits]);

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : BANK_RECONCILIATION_TEXT.PROCESS_FAILED
    );
  }, [query.error, query.isError]);

  const handleProcess = (values: IBankReconciliationFilterForm) => {
    if (!values.startDate || !values.endDate) {
      toast.error('From and To dates are required');
      return;
    }
    if (values.startDate > values.endDate) {
      toast.error('From date cannot be after To date');
      return;
    }

    setOverrideFilters(values);
    setRowEdits({});
    setAppliedQuery({
      startDate: values.startDate,
      endDate: values.endDate,
      bankAccountId:
        !values.bankAccountId ||
        values.bankAccountId === BankReconciliationBankAllValue
          ? undefined
          : values.bankAccountId,
      branchId: values.branchId || undefined,
      passengerName: values.passengerName?.trim() || undefined,
      transactionType: values.transactionType,
      unclearedOnly:
        values.unclearedOnly !== BankReconciliationUnclearedEnum.NO,
      processNonce: Date.now(),
    });
  };

  const handleReset = () => {
    setOverrideFilters(null);
    setAppliedQuery(null);
    setRowEdits({});
    setFormVersion(version => version + 1);
  };

  const patchRow = (
    sourceType: string,
    sourceId: string,
    patch: RowEditPatch
  ) => {
    const key = rowKey({ sourceType, sourceId });
    setRowEdits(previous => ({
      ...previous,
      [key]: {
        ...previous[key],
        ...patch,
      },
    }));
  };

  const selectedRows = useMemo(
    () => [...receivedRows, ...issuedRows].filter(row => row.selected),
    [issuedRows, receivedRows]
  );

  const handleSave = async () => {
    if (!selectedRows.length) {
      toast.error(BANK_RECONCILIATION_TEXT.SELECT_REQUIRED);
      return;
    }

    for (const row of selectedRows) {
      if (!row.editBankDate) {
        toast.error(
          `${BANK_RECONCILIATION_TEXT.BANK_DATE_REQUIRED} (${row.docNumber})`
        );
        return;
      }
      if (row.editDishonored && !row.editReversalNumber.trim()) {
        toast.error(
          `${BANK_RECONCILIATION_TEXT.REVERSAL_REQUIRED} (${row.docNumber})`
        );
        return;
      }
    }

    const unique = new Map<string, (typeof selectedRows)[number]>();
    for (const row of selectedRows) {
      unique.set(rowKey(row), row);
    }

    await clearMutation.mutateAsync({
      items: [...unique.values()].map(row => ({
        sourceType: row.sourceType,
        sourceId: row.sourceId,
        bankDate: row.editBankDate,
        reconciliationRemarks: row.editRemarks.trim() || undefined,
        isDishonored: row.editDishonored || undefined,
        reversalNumber: row.editDishonored
          ? row.editReversalNumber.trim()
          : undefined,
      })),
    });
    setRowEdits({});
  };

  if (!canView) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  const hasProcessed = Boolean(appliedQuery);
  const hasRows = receivedRows.length > 0 || issuedRows.length > 0;

  return (
    <div className={`space-y-3 ${hasRows ? 'pb-20' : ''}`}>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {BANK_RECONCILIATION_TEXT.TITLE}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {BANK_RECONCILIATION_TEXT.DESCRIPTION}
        </p>
      </div>

      <BankReconciliationFiltersSection
        defaultValues={defaultFilters}
        formKey={formKey}
        onProcess={handleProcess}
        onReset={handleReset}
        isProcessing={query.isFetching}
      />

      {hasProcessed && !query.isFetching && !hasRows && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {BANK_RECONCILIATION_TEXT.EMPTY}
        </div>
      )}

      <BankReconciliationTableSection
        title={BANK_RECONCILIATION_TEXT.SECTION_RECEIVED}
        rows={receivedRows}
        onChange={patchRow}
      />
      <BankReconciliationTableSection
        title={BANK_RECONCILIATION_TEXT.SECTION_ISSUED}
        rows={issuedRows}
        onChange={patchRow}
      />

      {hasRows && (
        <BankReconciliationFooter
          onSave={() => {
            void handleSave();
          }}
          isSaving={clearMutation.isPending}
        />
      )}
    </div>
  );
};

export default BankReconciliationView;
