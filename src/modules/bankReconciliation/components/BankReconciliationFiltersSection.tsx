import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { accountProfileApi, branchProfileApi } from '@/api';
import { Button } from '@/components/ui';
import {
  Form,
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { AccountProfileLedgerLabelEnum } from '@/modules/accountProfile';
import { PAGINATION_MAX_LIMIT } from '@/constants/paginationConstants';
import {
  BANK_RECONCILIATION_ALL_BANKS_OPTION,
  BANK_RECONCILIATION_TEXT,
  BANK_RECONCILIATION_TXN_TYPE_OPTIONS,
  BANK_RECONCILIATION_UNCLEARED_OPTIONS,
} from '../constants';
import type { IBankReconciliationFilterForm } from '../types';

interface BankReconciliationFiltersSectionProps {
  defaultValues: IBankReconciliationFilterForm;
  formKey: string;
  onProcess: (values: IBankReconciliationFilterForm) => void;
  onReset: () => void;
  isProcessing?: boolean;
}

const filterOptions =
  (options: Array<{ value: string; label: string }>) =>
  async (input: string) => {
    const q = input.trim().toLowerCase();
    const filtered = !q
      ? options
      : options.filter(
          option =>
            option.label.toLowerCase().includes(q) ||
            option.value.toLowerCase().includes(q)
        );
    return { options: filtered };
  };

export const BankReconciliationFiltersSection = ({
  defaultValues,
  formKey,
  onProcess,
  onReset,
  isProcessing = false,
}: BankReconciliationFiltersSectionProps) => {
  const { user } = useAuth();
  const isRestrictedUser = !user?.isAdmin && !user?.isHo && !user?.isHoStaff;
  const userAssignments = useMemo(
    () => user?.assignments ?? [],
    [user?.assignments]
  );

  const branchesQuery = useQuery({
    queryKey: ['bank-reconciliation-branches'],
    queryFn: () => branchProfileApi.getAllBranchProfiles({ activeOnly: true }),
  });

  const accountsQuery = useInfiniteQuery({
    queryKey: [
      'bank-reconciliation-accounts',
      AccountProfileLedgerLabelEnum.BankLedger,
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      accountProfileApi.getAccountProfiles({
        active: true,
        accountType: AccountProfileLedgerLabelEnum.BankLedger,
        offset: Number(pageParam) || 0,
        limit: PAGINATION_MAX_LIMIT,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore
        ? (Number(lastPageParam) || 0) + lastPage.limit
        : undefined,
  });

  const branchOptions = useMemo(() => {
    const rows = branchesQuery.data ?? [];
    return rows
      .filter(branch => {
        if (!isRestrictedUser) return true;
        return userAssignments.some(
          assignment => assignment.branchId === branch.id
        );
      })
      .map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      }));
  }, [branchesQuery.data, isRestrictedUser, userAssignments]);

  const bankOptions = useMemo(() => {
    const rows =
      accountsQuery.data?.pages.flatMap(page => page.data ?? []) ?? [];
    return [
      { ...BANK_RECONCILIATION_ALL_BANKS_OPTION },
      ...rows.map(account => ({
        value: account.id,
        label: `${account.accountCode} - ${account.accountName}`,
      })),
    ];
  }, [accountsQuery.data]);

  return (
    <Form
      key={formKey}
      defaultValues={defaultValues}
      onSubmit={onProcess}
      className="space-y-3"
    >
      <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FormFieldSelect
            name="branchId"
            label={BANK_RECONCILIATION_TEXT.FILTER_BRANCH}
            placeholder={BANK_RECONCILIATION_TEXT.SELECT_BRANCH}
            loadOptions={filterOptions(branchOptions)}
            defaultOptions={branchOptions}
            isLoading={branchesQuery.isLoading}
          />
          <FormFieldSelect
            name="bankAccountId"
            label={BANK_RECONCILIATION_TEXT.FILTER_BANK}
            placeholder={BANK_RECONCILIATION_TEXT.SELECT_BANK}
            loadOptions={filterOptions(bankOptions)}
            defaultOptions={bankOptions}
            isLoading={accountsQuery.isLoading || accountsQuery.isFetching}
          />
          <FormFieldDatePicker
            name="startDate"
            label={BANK_RECONCILIATION_TEXT.FILTER_FROM}
            placeholder="DD/MM/YYYY"
          />
          <FormFieldDatePicker
            name="endDate"
            label={BANK_RECONCILIATION_TEXT.FILTER_TO}
            placeholder="DD/MM/YYYY"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FormFieldInput
            name="passengerName"
            label={BANK_RECONCILIATION_TEXT.FILTER_PASSENGER}
            placeholder="Search passenger / party"
          />
          <FormFieldSelect
            name="transactionType"
            label={BANK_RECONCILIATION_TEXT.FILTER_TXN_TYPE}
            loadOptions={filterOptions([
              ...BANK_RECONCILIATION_TXN_TYPE_OPTIONS,
            ])}
            defaultOptions={[...BANK_RECONCILIATION_TXN_TYPE_OPTIONS]}
          />
          <FormFieldSelect
            name="unclearedOnly"
            label={BANK_RECONCILIATION_TEXT.FILTER_UNCLEARED}
            loadOptions={filterOptions([
              ...BANK_RECONCILIATION_UNCLEARED_OPTIONS,
            ])}
            defaultOptions={[...BANK_RECONCILIATION_UNCLEARED_OPTIONS]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2">
          <Button type="button" variant="outline" onClick={onReset}>
            {BANK_RECONCILIATION_TEXT.RESET}
          </Button>
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : BANK_RECONCILIATION_TEXT.PROCESS}
          </Button>
        </div>
      </section>
    </Form>
  );
};

export default BankReconciliationFiltersSection;
