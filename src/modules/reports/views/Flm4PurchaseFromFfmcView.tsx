import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  Flm4PurchaseFromFfmcFiltersSection,
  Flm4PurchaseFromFfmcTable,
  FlmReportLayoutToggle,
} from '../components';
import {
  FLM4_PURCHASE_FROM_FFMC_TEXT,
  Flm4ReportViewEnum,
} from '../constants/flm4PurchaseFromFfmcConstants';
import { useFlm4PurchaseFromFfmc } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const Flm4PurchaseFromFfmcView = () => {
  const { user } = useAuth();
  const reportState = useFlm4PurchaseFromFfmc();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      reportState.filters.branchIds,
      reportState.filters.branchOptions,
    );
    const profileLabels = summarizeReportSelection(
      reportState.filters.profileTypes,
      reportState.filters.profileOptions,
    );
    const productLabel =
      reportState.filters.productOptions.find(
        option => option.id === reportState.filters.productId,
      )?.label ?? FLM4_PURCHASE_FROM_FFMC_TEXT.all;

    return {
      branches: branchLabels,
      profiles: profileLabels,
      product: productLabel,
    };
  }, [
    reportState.filters.branchIds,
    reportState.filters.branchOptions,
    reportState.filters.profileTypes,
    reportState.filters.profileOptions,
    reportState.filters.productId,
    reportState.filters.productOptions,
  ]);

  if (!canView) {
    return <AccessDeniedState message={PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE} />;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          {FLM4_PURCHASE_FROM_FFMC_TEXT.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {FLM4_PURCHASE_FROM_FFMC_TEXT.description}
        </p>
      </div>

      <Flm4PurchaseFromFfmcFiltersSection filters={reportState.filters} />

      {reportState.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {FLM4_PURCHASE_FROM_FFMC_TEXT.appliedPrefix}: {reportState.appliedDateRangeLabel} |{' '}
          {FLM4_PURCHASE_FROM_FFMC_TEXT.branchHeading}{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : FLM4_PURCHASE_FROM_FFMC_TEXT.all}{' '}
          | {FLM4_PURCHASE_FROM_FFMC_TEXT.profileHeading}{' '}
          {currentSummary.profiles.length ===
          reportState.filters.profileOptions.length
            ? FLM4_PURCHASE_FROM_FFMC_TEXT.all
            : currentSummary.profiles.join(', ')}{' '}
          | {FLM4_PURCHASE_FROM_FFMC_TEXT.productHeading} {currentSummary.product}
        </div>
      )}

      {reportState.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">
                {FLM4_PURCHASE_FROM_FFMC_TEXT.reportViewTitle}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {FLM4_PURCHASE_FROM_FFMC_TEXT.reportViewDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FlmReportLayoutToggle
                layout={reportState.filters.layout}
                onChange={reportState.filters.setLayout}
              />

              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.filters.view === Flm4ReportViewEnum.NORMAL
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => reportState.filters.setView(Flm4ReportViewEnum.NORMAL)}
                >
                  {FLM4_PURCHASE_FROM_FFMC_TEXT.normalView}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.filters.view === Flm4ReportViewEnum.EXTENDED
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => reportState.filters.setView(Flm4ReportViewEnum.EXTENDED)}
                >
                  {FLM4_PURCHASE_FROM_FFMC_TEXT.extendedView}
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
                  onClick={() => reportState.setExportFormat(ReportExportFormatEnum.XLSX)}
                >
                  {FLM4_PURCHASE_FROM_FFMC_TEXT.xlsx}
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
                  onClick={() => reportState.setExportFormat(ReportExportFormatEnum.CSV)}
                >
                  {FLM4_PURCHASE_FROM_FFMC_TEXT.csv}
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  void reportState.downloadReport();
                }}
                disabled={!reportState.isReady || reportState.isLoadingReport}
              >
                {FLM4_PURCHASE_FROM_FFMC_TEXT.download}
              </Button>
            </div>
          </div>

          {reportState.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {FLM4_PURCHASE_FROM_FFMC_TEXT.loadError}
            </div>
          )}

          <Flm4PurchaseFromFfmcTable
            report={reportState.report}
            loading={reportState.isLoadingReport || reportState.isFetchingReport}
          />
        </section>
      )}
    </div>
  );
};

export default Flm4PurchaseFromFfmcView;
