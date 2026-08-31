import { useMemo, useState } from 'react';
import {
  AsyncSelect,
  Button,
  DatePicker,
  Table,
  type TableColumnDef,
  type AsyncSelectOption,
} from '@/components/ui';
import { SelectUserProfiles } from '@/modules/userProfile/components';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import type { IUserProfile } from '@/modules/userProfile/types';

export interface BranchUserAccessRuleRow {
  id: string;
  branchId: string;
  branchName: string | null;
  userId: string;
  userName: string | null;
  fromDate?: string;
  toDate?: string;
  isActive: boolean;
}

interface BranchUserAccessRulesManagerProps {
  title: string;
  description?: string;
  rules: BranchUserAccessRuleRow[];
  loading?: boolean;
  isSubmitting?: boolean;
  showDateRange?: boolean;
  onCreateRules: (
    rules: Array<{
      branchId: string;
      userId: string;
      fromDate?: string;
      toDate?: string;
    }>
  ) => Promise<unknown>;
  onRevokeRule: (ruleId: string) => Promise<unknown>;
  emptyMessage?: string;
}

export const BranchUserAccessRulesManager = ({
  title,
  description,
  rules,
  loading = false,
  isSubmitting = false,
  showDateRange = false,
  onCreateRules,
  onRevokeRule,
  emptyMessage = 'No records found.',
}: BranchUserAccessRulesManagerProps) => {
  const [selectedBranch, setSelectedBranch] =
    useState<AsyncSelectOption | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<IUserProfile[]>([]);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [formError, setFormError] = useState('');

  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });

  const columns = useMemo<TableColumnDef<BranchUserAccessRuleRow>[]>(() => {
    const nextColumns: TableColumnDef<BranchUserAccessRuleRow>[] = [
      { accessorKey: 'branchName', header: 'Branch' },
      { accessorKey: 'userName', header: 'User' },
    ];

    if (showDateRange) {
      nextColumns.push(
        { accessorKey: 'fromDate', header: 'From Date' },
        { accessorKey: 'toDate', header: 'To Date' }
      );
    }

    nextColumns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="border-0! bg-transparent! text-red-700!"
          onClick={() => {
            void onRevokeRule(row.original.id);
          }}
        >
          Revoke
        </Button>
      ),
    });

    return nextColumns;
  }, [onRevokeRule, showDateRange]);

  const handleAddRules = async () => {
    const branchId = String(selectedBranch?.value ?? '').trim();

    if (!branchId) {
      setFormError('Please select a branch first.');
      return;
    }

    if (selectedUsers.length === 0) {
      setFormError('Please select at least one user.');
      return;
    }

    if (showDateRange && (!fromDate || !toDate)) {
      setFormError('Please select both from and to dates.');
      return;
    }

    setFormError('');

    await onCreateRules(
      selectedUsers.map(user => ({
        branchId,
        userId: user.id,
        fromDate: showDateRange ? fromDate : undefined,
        toDate: showDateRange ? toDate : undefined,
      }))
    );

    setSelectedUsers([]);
    setUsersModalOpen(false);
    setFromDate('');
    setToDate('');
  };

  const selectedUserSummary = selectedUsers.map(
    user => `${user.code} - ${user.name}`
  );

  return (
    <section className="space-y-4 rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-tertiary">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary">
                Branch
              </label>
              <AsyncSelect
                loadOptions={loadBranchOptions}
                value={selectedBranch}
                defaultOptions={true}
                pagination
                onChange={option => {
                  setSelectedBranch(option as AsyncSelectOption | null);
                  setSelectedUsers([]);
                  setFormError('');
                }}
                placeholder="Select branch"
                isSearchable
                isClearable
                isDisabled={isSubmitting}
              />
            </div>

            {showDateRange ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <DatePicker
                  label="From Date"
                  disabled={isSubmitting}
                  selected={fromDate ? new Date(`${fromDate}T00:00:00`) : null}
                  onChange={date => {
                    const nextValue = date
                      ? date.toISOString().slice(0, 10)
                      : '';
                    setFromDate(nextValue);
                  }}
                />
                <DatePicker
                  label="To Date"
                  disabled={isSubmitting}
                  selected={toDate ? new Date(`${toDate}T00:00:00`) : null}
                  onChange={date => {
                    const nextValue = date
                      ? date.toISOString().slice(0, 10)
                      : '';
                    setToDate(nextValue);
                  }}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={!selectedBranch || isSubmitting}
                onClick={() => setUsersModalOpen(true)}
              >
                Select Users
              </Button>
              <Button
                type="button"
                disabled={
                  !selectedBranch || selectedUsers.length === 0 || isSubmitting
                }
                onClick={() => void handleAddRules()}
              >
                Add Access Rules
              </Button>
            </div>

            {formError ? (
              <p className="text-sm text-error-600">{formError}</p>
            ) : null}

            {selectedUserSummary.length > 0 ? (
              <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                  Selected Users
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUserSummary.map(label => (
                    <span
                      key={label}
                      className="rounded-full border border-border-primary bg-surface-secondary px-3 py-1 text-xs text-text-primary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
          <Table
            columns={columns}
            data={rules}
            loading={loading}
            enableFiltering={false}
            enablePagination={true}
            enableRowSelection={false}
            enableColumnVisibility={false}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>

      <SelectUserProfiles
        open={usersModalOpen}
        multiple
        branchId={String(selectedBranch?.value ?? '') || undefined}
        title="Select Users"
        description="Choose one or more users for the selected branch."
        onContinue={users => {
          setSelectedUsers(users);
          setUsersModalOpen(false);
        }}
        onClose={() => setUsersModalOpen(false)}
      />
    </section>
  );
};
