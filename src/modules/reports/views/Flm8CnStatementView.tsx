import { useMemo, useState } from 'react';
import { Button, ConfirmModal } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import { toDisplayDate } from '@/utils';
import {
  Flm8CnStatementFiltersSection,
  Flm8CnStatementTable,
} from '../components';
import CheckboxFilterGroup from '../components/CheckboxFilterGroup';
import {
  FLM8_CN_STATEMENT_TEXT,
  Flm8ProfileTypeEnum,
  Flm8ReportViewEnum,
} from '../constants/flm8CnStatementConstants';
import { useFlm8CnStatement, useFlm8CnStatementLockData } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const Flm8CnStatementView = () => {
  const { user } = useAuth();
  const reportState = useFlm8CnStatement();
  const lockData = useFlm8CnStatementLockData({ filters: reportState.filters });
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      reportState.filters.branchIds,
      reportState.filters.branchOptions
    );
    const productLabel =
      reportState.filters.productOptions.find(
        option => option.id === reportState.filters.productId
      )?.label ?? FLM8_CN_STATEMENT_TEXT.all;
    const profileTypeLabel =
      reportState.filters.profileType === Flm8ProfileTypeEnum.AD
        ? FLM8_CN_STATEMENT_TEXT.ad
        : reportState.filters.profileType === Flm8ProfileTypeEnum.FFMC
          ? FLM8_CN_STATEMENT_TEXT.ffmc
          : FLM8_CN_STATEMENT_TEXT.selectProfileType;
    const apConnectLabel = reportState.filters.appliedFilters?.apConnect
      ? FLM8_CN_STATEMENT_TEXT.enabled
      : FLM8_CN_STATEMENT_TEXT.disabled;

    return {
      branches: branchLabels,
      product: productLabel,
      profileType: profileTypeLabel,
      apConnect: apConnectLabel,
      showApConnect:
        reportState.filters.appliedFilters?.profileType ===
        Flm8ProfileTypeEnum.AD,
    };
  }, [
    reportState.filters.appliedFilters,
    reportState.filters.branchIds,
    reportState.filters.branchOptions,
    reportState.filters.productId,
    reportState.filters.productOptions,
    reportState.filters.profileType,
  ]);

  if (!canView) {
    return (
      <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {FLM8_CN_STATEMENT_TEXT.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {FLM8_CN_STATEMENT_TEXT.description}
        </p>
      </div>

      <Flm8CnStatementFiltersSection filters={reportState.filters} />

      {reportState.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {FLM8_CN_STATEMENT_TEXT.appliedPrefix}:{' '}
          {reportState.appliedDateRangeLabel} |{' '}
          {FLM8_CN_STATEMENT_TEXT.branchHeading}{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : FLM8_CN_STATEMENT_TEXT.all}{' '}
          | {FLM8_CN_STATEMENT_TEXT.productHeading} {currentSummary.product} |{' '}
          {FLM8_CN_STATEMENT_TEXT.profileTypeHeading}{' '}
          {currentSummary.profileType}
          {currentSummary.showApConnect
            ? ` | ${FLM8_CN_STATEMENT_TEXT.apConnectHeading} ${currentSummary.apConnect}`
            : ''}
        </div>
      )}

      {reportState.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">
                {FLM8_CN_STATEMENT_TEXT.reportViewTitle}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {FLM8_CN_STATEMENT_TEXT.reportViewDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.filters.view === Flm8ReportViewEnum.VERTICAL
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() =>
                    reportState.filters.setView(Flm8ReportViewEnum.VERTICAL)
                  }
                >
                  {FLM8_CN_STATEMENT_TEXT.verticalView}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.filters.view === Flm8ReportViewEnum.HORIZONTAL
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() =>
                    reportState.filters.setView(Flm8ReportViewEnum.HORIZONTAL)
                  }
                >
                  {FLM8_CN_STATEMENT_TEXT.horizontalView}
                </Button>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.exportFormat === ReportExportFormatEnum.XLSX
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() =>
                    reportState.setExportFormat(ReportExportFormatEnum.XLSX)
                  }
                >
                  {FLM8_CN_STATEMENT_TEXT.xlsx}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.exportFormat === ReportExportFormatEnum.CSV
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() =>
                    reportState.setExportFormat(ReportExportFormatEnum.CSV)
                  }
                >
                  {FLM8_CN_STATEMENT_TEXT.csv}
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  setConfirmError(null);
                  lockData.openLockModal();
                }}
                disabled={!lockData.canOpen || lockData.isLocking}
              >
                {FLM8_CN_STATEMENT_TEXT.lockData}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void reportState.downloadReport();
                }}
                disabled={!reportState.isReady || reportState.isLoadingReport}
              >
                {FLM8_CN_STATEMENT_TEXT.download}
              </Button>
            </div>
          </div>

          {reportState.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {FLM8_CN_STATEMENT_TEXT.loadError}
            </div>
          )}

          <Flm8CnStatementTable
            report={reportState.report}
            loading={
              reportState.isLoadingReport || reportState.isFetchingReport
            }
          />
        </section>
      )}

      <ConfirmModal
        open={lockData.isOpen}
        onOpenChange={open => {
          if (!open) {
            setConfirmError(null);
            lockData.closeLockModal();
          }
        }}
        title={FLM8_CN_STATEMENT_TEXT.lockDataTitle}
        description={FLM8_CN_STATEMENT_TEXT.lockDataDescription}
        confirmLabel={FLM8_CN_STATEMENT_TEXT.lockDataConfirm}
        cancelLabel={FLM8_CN_STATEMENT_TEXT.lockDataCancel}
        confirmVariant="destructive"
        isConfirming={lockData.isLocking}
        confirmDisabled={lockData.branchOptions.length === 0}
        onConfirm={async () => {
          setConfirmError(null);
          try {
            await lockData.confirmLock();
          } catch (error) {
            const message =
              error instanceof Error && error.message
                ? error.message
                : FLM8_CN_STATEMENT_TEXT.lockDataError;
            setConfirmError(message);
          }
        }}
        size="lg"
      >
        <div className="space-y-3">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            <p>
              {FLM8_CN_STATEMENT_TEXT.lockDataThroughPrefix}{' '}
              <span className="font-semibold">
                {toDisplayDate(lockData.lockedThroughDate) ||
                  lockData.lockedThroughDate}
              </span>
              . {FLM8_CN_STATEMENT_TEXT.lockDataThroughSuffix}
            </p>
            <p className="mt-1">{FLM8_CN_STATEMENT_TEXT.lockDataWarning}</p>
          </div>

          <CheckboxFilterGroup
            heading={FLM8_CN_STATEMENT_TEXT.lockDataBranchHeading}
            options={lockData.branchOptions}
            selectedIds={lockData.selectedBranchIds}
            allSelected={lockData.allSelected}
            onToggle={lockData.toggleBranch}
            onToggleAll={lockData.toggleAllBranches}
            emptyMessage={FLM8_CN_STATEMENT_TEXT.lockDataNoBranches}
            compact={false}
          />

          {confirmError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {confirmError}
            </div>
          ) : null}
        </div>
      </ConfirmModal>
    </div>
  );
};

export default Flm8CnStatementView;
