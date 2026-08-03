import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, CardSection, Checkbox, Input } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { transactionPoliciesApi } from '@/api/transactionPolicies/transactionPolicies.api';
import type { IPolicyChecklistItem } from '@/modules/auth/types';
import { formatDateTime } from '@/utils';

type ChecklistAnswers = Record<string, string | boolean>;
type DayEndAction = 'start' | 'end';

const createDefaultAnswers = (checklist: IPolicyChecklistItem[]): ChecklistAnswers =>
  checklist.reduce<ChecklistAnswers>((acc, item) => {
    acc[item.code] = item.valueType.trim().toLowerCase() === 'boolean' ? false : '';
    return acc;
  }, {});

const normalizeChecklistValue = (value: string | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value ?? '').trim();
};

const isChecklistItemComplete = (
  item: IPolicyChecklistItem,
  value: string | boolean | undefined
): boolean => {
  if (item.valueType.trim().toLowerCase() === 'boolean') {
    return value === true;
  }

  return Boolean(normalizeChecklistValue(value ?? ''));
};

const getStatusTone = (active: boolean) =>
  active
    ? 'border-success-200 bg-success-50 text-success-700'
    : 'border-border-secondary bg-surface-secondary text-text-secondary';

interface DayEndStartProcessFormProps {
  user: ReturnType<typeof useAuth>['user'];
  policyContext: ReturnType<typeof useAuth>['policyContext'];
  checkAuth: ReturnType<typeof useAuth>['checkAuth'];
}

const DayEndStartProcessForm = ({
  user,
  policyContext,
  checkAuth,
}: DayEndStartProcessFormProps) => {
  const checklist = useMemo(() => policyContext?.checklist ?? [], [policyContext?.checklist]);
  const [answers, setAnswers] = useState<ChecklistAnswers>(() =>
    createDefaultAnswers(checklist)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasBodCompleted = Boolean(policyContext?.bodCompleted);
  const hasEodPending = Boolean(policyContext?.eodIncomplete);
  const canStartDay = Boolean(policyContext?.canStartDay ?? !hasBodCompleted);
  const canCompleteDayEnd = Boolean(policyContext?.canCompleteDayEnd ?? hasEodPending);
  const workflowState = policyContext?.workflowState ?? (
    hasEodPending ? 'PENDING_EOD' : hasBodCompleted ? 'READY_TO_START' : 'PENDING_BOD'
  );
  const currentBusinessDate = policyContext?.currentBusinessDate ?? '';
  const transactionDate = policyContext?.transactionDate ?? '';
  const openBusinessDate = policyContext?.openBusinessDate ?? currentBusinessDate;
  const activeMonthlyLock = policyContext?.activeMonthlyLock ?? null;
  const isPendingBod = workflowState === 'PENDING_BOD';
  const isPendingEod = workflowState === 'PENDING_EOD';
  const isClosedToday = workflowState === 'CLOSED_TODAY';

  const validationErrors = useMemo(
    () =>
      checklist
        .filter(item => item.required)
        .filter(item => !isChecklistItemComplete(item, answers[item.code]))
        .map(item => item.label || item.code),
    [answers, checklist]
  );

  const renderChecklistValue = (item: IPolicyChecklistItem) => {
    const value = answers[item.code];
    const isBoolean = item.valueType.trim().toLowerCase() === 'boolean';

    if (isBoolean) {
      return (
        <Checkbox
          id={`checklist-${item.code}`}
          checked={value === true}
          onChange={checked => {
            setAnswers(prev => ({
              ...prev,
              [item.code]: checked,
            }));
          }}
        >
          Mark as completed
        </Checkbox>
      );
    }

    return (
      <Input
        id={`checklist-${item.code}`}
        type="text"
        value={String(value ?? '')}
        valueTransform="none"
        placeholder={item.valueType.toLowerCase() === 'select' ? 'Enter selected value' : 'Enter answer'}
        onChange={event => {
          setAnswers(prev => ({
            ...prev,
            [item.code]: event.target.value,
          }));
        }}
      />
    );
  };

  const submitAction = async (action: DayEndAction) => {
    if (validationErrors.length > 0) {
      toast.error('Please complete all required checklist items.');
      return;
    }

    if (action === 'start' && !canStartDay) {
      toast.error(
        isPendingEod
          ? 'Complete the pending EOD before starting a new day.'
          : isClosedToday
            ? `Day end is already completed for ${openBusinessDate || currentBusinessDate || 'today'}.`
          : 'Day start is already completed for the open business date.'
      );
      return;
    }

    if (action === 'end' && !canCompleteDayEnd) {
      toast.error(
        isPendingBod
          ? 'Start the day before completing EOD.'
          : 'No open day is available to complete.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { answers };
      if (action === 'start') {
        await transactionPoliciesApi.startDay(payload);
        toast.success('Day started successfully');
      } else {
        await transactionPoliciesApi.completeDayEnd(payload);
        toast.success('Day end completed successfully');
      }

      await checkAuth();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save day process');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
              Day End / Start Process
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Complete your working day before punching transactions
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-text-secondary">
              This screen is for the logged-in user. Advanced settings define the checklist,
              and this workflow records BOD and EOD for the current branch and user.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
            <div className="rounded-xl border border-border-primary bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                User
              </div>
              <div className="mt-2 text-sm font-medium text-text-primary">
                {user?.name || user?.email || user?.id || 'Unknown user'}
              </div>
            </div>
            <div className="rounded-xl border border-border-primary bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                Branch
              </div>
              <div className="mt-2 text-sm font-medium text-text-primary">
                {user?.branchName?.trim() || 'No active branch'}
              </div>
            </div>
            <div className="rounded-xl border border-border-primary bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                Counter
              </div>
              <div className="mt-2 text-sm font-medium text-text-primary">
                {user?.counterName?.trim() || 'No active counter'}
              </div>
            </div>
            <div className="rounded-xl border border-border-primary bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                Business Date
              </div>
              <div className="mt-2 text-sm font-medium text-text-primary">
                {currentBusinessDate ? formatDateTime(currentBusinessDate, 'DD/MM/YYYY') : 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CardSection heading="Current Status" className="space-y-3">
          <div className={`rounded-lg border px-4 py-3 text-sm ${getStatusTone(hasBodCompleted && !isPendingBod)}`}>
            <div className="font-semibold">BOD Status</div>
            <div>
              {isPendingBod
                ? `Day start pending for ${openBusinessDate || 'the current business date'}`
                : isClosedToday
                  ? `Day closed for ${openBusinessDate || currentBusinessDate || 'today'}`
                : hasBodCompleted
                  ? 'Day started'
                  : 'Day start pending'}
            </div>
          </div>
          <div className={`rounded-lg border px-4 py-3 text-sm ${getStatusTone(!hasEodPending && !isPendingEod)}`}>
            <div className="font-semibold">EOD Status</div>
            <div>
              {isPendingEod
                ? `Previous day ${openBusinessDate || 'the current business date'} is still open`
                : hasEodPending
                  ? 'Previous day is still open'
                  : 'No pending EOD'}
            </div>
          </div>
            <div className="rounded-lg border border-border-primary bg-surface-secondary px-4 py-3 text-sm text-text-secondary">
              <div className="font-semibold text-text-primary">Transaction Date</div>
            <div>
              {transactionDate
                ? formatDateTime(transactionDate, 'DD/MM/YYYY')
                : openBusinessDate
                  ? formatDateTime(openBusinessDate, 'DD/MM/YYYY')
                  : currentBusinessDate
                    ? formatDateTime(currentBusinessDate, 'DD/MM/YYYY')
                    : 'Not available'}
            </div>
          </div>
          {activeMonthlyLock ? (
            <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">
              <div className="font-semibold">Monthly Lock Active</div>
              <div>
                {formatDateTime(activeMonthlyLock.fromDate, 'DD/MM/YYYY')} to {formatDateTime(activeMonthlyLock.toDate, 'DD/MM/YYYY')}
              </div>
            </div>
          ) : null}
        </CardSection>

        <CardSection heading="Checklist" className="space-y-4 lg:col-span-2">
          {checklist.length > 0 ? (
            checklist.map(item => {
              const isBoolean = item.valueType.trim().toLowerCase() === 'boolean';
              const isSelect = item.valueType.trim().toLowerCase() === 'select';

              return (
                <div
                  key={item.code}
                  className="rounded-xl border border-border-primary bg-surface-primary p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">
                        {item.label}
                      </div>
                      <div className="text-xs text-text-secondary">
                        Code: {item.code} {item.required ? '(required)' : '(optional)'}
                        {' · '}
                        Type: {item.valueType}
                      </div>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${item.required ? 'border-error-200 bg-error-50 text-error-700' : 'border-border-primary bg-surface-secondary text-text-tertiary'}`}>
                      {item.required ? 'Required' : 'Optional'}
                    </span>
                  </div>

                  <div className="mt-4">
                    {isSelect ? (
                      <Input
                        id={`checklist-${item.code}`}
                        type="text"
                        value={String(answers[item.code] ?? '')}
                        valueTransform="none"
                        placeholder="Enter selected option value"
                        onChange={event => {
                          setAnswers(prev => ({
                            ...prev,
                            [item.code]: event.target.value,
                          }));
                        }}
                      />
                    ) : (
                      renderChecklistValue(item)
                    )}
                    {isBoolean ? (
                      <p className="mt-2 text-xs text-text-tertiary">
                        Use the checkbox to acknowledge this item.
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-border-primary bg-surface-secondary p-6 text-sm text-text-secondary">
              No checklist items are configured yet in additional settings.
            </div>
          )}

          {validationErrors.length > 0 ? (
            <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
              Please complete: {validationErrors.join(', ')}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void submitAction('start')}
                loading={isSubmitting}
                disabled={isSubmitting || !canStartDay}
              >
              {isPendingBod
                ? 'Start Pending Day'
                : isClosedToday
                  ? 'Day Already Completed'
                  : hasBodCompleted
                    ? 'Day Already Started'
                    : 'Start Day'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void submitAction('end')}
                loading={isSubmitting}
                disabled={isSubmitting || !canCompleteDayEnd}
              >
              {isPendingEod ? 'Complete Pending EOD' : isClosedToday ? 'Day End Completed' : 'Complete Day End'}
              </Button>
            </div>
          {(isPendingBod || isPendingEod) ? (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              {isPendingBod ? (
                <p>Day start is pending for {openBusinessDate || 'the current business date'}. Please start the day before using transactions.</p>
              ) : (
                <p>EOD is pending for {openBusinessDate || 'the current business date'}. Please complete this day before starting the next day.</p>
              )}
            </div>
          ) : isClosedToday ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <p>
                Day end is already completed for {openBusinessDate || currentBusinessDate || 'today'}.
                You can start again on the next working day.
              </p>
            </div>
          ) : null}
        </CardSection>
      </div>
    </section>
  );
};

export const DayEndStartProcessView = () => {
  const { user, policyContext, checkAuth, isLoading } = useAuth();
  const checklist = policyContext?.checklist ?? [];
  const checklistSignature = checklist
    .map(item => `${item.code}:${item.valueType}:${item.required}:${item.label}`)
    .join('|');

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <DayEndStartProcessForm
      key={checklistSignature}
      user={user}
      policyContext={policyContext}
      checkAuth={checkAuth}
    />
  );
};

export default DayEndStartProcessView;
