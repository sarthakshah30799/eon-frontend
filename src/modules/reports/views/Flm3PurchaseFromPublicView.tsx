import { useMemo } from 'react';
import { Button } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { PAGE_STATUS_TEXTS } from '@/constants';
import { useAuth } from '@/lib/AuthContext';
import {
  Flm3PurchaseFromPublicFiltersSection,
  Flm3PurchaseFromPublicTable,
  FlmReportLayoutToggle,
} from '../components';
import {
  FLM3_PURCHASE_FROM_PUBLIC_TEXT,
  Flm3ReportViewEnum,
} from '../constants/flm3PurchaseFromPublicConstants';
import { useFlm3PurchaseFromPublic } from '../hooks';
import { ReportExportFormatEnum } from '../types';
import { summarizeReportSelection } from '../utils';

export const Flm3PurchaseFromPublicView = () => {
  const { user } = useAuth();
  const reportState = useFlm3PurchaseFromPublic();
  const canView = Boolean(user);

  const currentSummary = useMemo(() => {
    const branchLabels = summarizeReportSelection(
      reportState.filters.branchIds,
      reportState.filters.branchOptions,
    );
    const productLabel =
      reportState.filters.productOptions.find(
        option => option.id === reportState.filters.productId,
      )?.label ?? FLM3_PURCHASE_FROM_PUBLIC_TEXT.all;

    return {
      branches: branchLabels,
      product: productLabel,
    };
  }, [
    reportState.filters.branchIds,
    reportState.filters.branchOptions,
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
          {FLM3_PURCHASE_FROM_PUBLIC_TEXT.title}
        </h1>
        <p className="max-w-3xl text-[11px] text-text-secondary">
          {FLM3_PURCHASE_FROM_PUBLIC_TEXT.description}
        </p>
      </div>

      <Flm3PurchaseFromPublicFiltersSection filters={reportState.filters} />

      {reportState.filters.appliedFilters && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-text-secondary">
          {FLM3_PURCHASE_FROM_PUBLIC_TEXT.appliedPrefix}: {reportState.appliedDateRangeLabel} |{' '}
          {FLM3_PURCHASE_FROM_PUBLIC_TEXT.branchHeading}{' '}
          {currentSummary.branches.length
            ? currentSummary.branches.join(', ')
            : FLM3_PURCHASE_FROM_PUBLIC_TEXT.all}{' '}
          | {FLM3_PURCHASE_FROM_PUBLIC_TEXT.productHeading} {currentSummary.product}
        </div>
      )}

      {reportState.filters.appliedFilters && (
        <section className="space-y-3 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-text-primary">
                {FLM3_PURCHASE_FROM_PUBLIC_TEXT.reportViewTitle}
              </h2>
              <p className="text-[11px] text-text-secondary">
                {FLM3_PURCHASE_FROM_PUBLIC_TEXT.reportViewDescription}
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
                    reportState.filters.view === Flm3ReportViewEnum.NORMAL
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => reportState.filters.setView(Flm3ReportViewEnum.NORMAL)}
                >
                  {FLM3_PURCHASE_FROM_PUBLIC_TEXT.normalView}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    reportState.filters.view === Flm3ReportViewEnum.EXTENDED
                      ? 'default'
                      : 'outline'
                  }
                  className="h-7 rounded-full px-3 text-[11px]"
                  onClick={() => reportState.filters.setView(Flm3ReportViewEnum.EXTENDED)}
                >
                  {FLM3_PURCHASE_FROM_PUBLIC_TEXT.extendedView}
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
                  {FLM3_PURCHASE_FROM_PUBLIC_TEXT.xlsx}
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
                  {FLM3_PURCHASE_FROM_PUBLIC_TEXT.csv}
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
                {FLM3_PURCHASE_FROM_PUBLIC_TEXT.download}
              </Button>
            </div>
          </div>

          {reportState.reportError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {FLM3_PURCHASE_FROM_PUBLIC_TEXT.loadError}
            </div>
          )}

          <Flm3PurchaseFromPublicTable
            report={reportState.report}
            loading={reportState.isLoadingReport || reportState.isFetchingReport}
          />
        </section>
      )}
    </div>
  );
};

export default Flm3PurchaseFromPublicView;
