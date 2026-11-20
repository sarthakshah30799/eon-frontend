import { TRADING_SUMMARY_REPORT_TEXT } from '../constants/tradingSummaryReportConstants';
import type {
  ITradingSummaryReportResponse,
  ITradingSummaryReportRow,
} from '../types';

interface TradingSummaryReportTableProps {
  report: ITradingSummaryReportResponse | null;
  loading?: boolean;
}

const NUMERIC_KEYS = new Set([
  'opening',
  'purchase',
  'sales',
  'closing',
  'diff',
]);

const amountClass = 'text-right tabular-nums';

export const TradingSummaryReportTable = ({
  report,
  loading = false,
}: TradingSummaryReportTableProps) => {
  if (loading) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!report || !report.sections.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {report?.message || TRADING_SUMMARY_REPORT_TEXT.empty}
      </div>
    );
  }

  const columns = report.columns.length
    ? report.columns
    : [
        { key: 'product', label: TRADING_SUMMARY_REPORT_TEXT.product },
        { key: 'opening', label: TRADING_SUMMARY_REPORT_TEXT.opening },
        { key: 'purchase', label: TRADING_SUMMARY_REPORT_TEXT.purchase },
        { key: 'sales', label: TRADING_SUMMARY_REPORT_TEXT.sales },
        { key: 'closing', label: TRADING_SUMMARY_REPORT_TEXT.closing },
        { key: 'diff', label: TRADING_SUMMARY_REPORT_TEXT.diff },
      ];

  return (
    <div className="space-y-4">
      {report.sections.map(section => (
        <div
          key={section.branchId ?? 'all'}
          className="overflow-hidden rounded-md border border-slate-200"
        >
          <div className="border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-text-primary">
            {section.branchLabel}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th
                      key={column.key}
                      className={[
                        'whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary',
                        NUMERIC_KEYS.has(column.key)
                          ? 'text-right'
                          : 'text-left',
                      ].join(' ')}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, index) => (
                  <tr
                    key={`${section.branchId ?? 'all'}-${row.product}-${index}`}
                    className={
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }
                  >
                    {columns.map(column => {
                      const value =
                        row[column.key as keyof ITradingSummaryReportRow] ??
                        '';
                      return (
                        <td
                          key={column.key}
                          className={[
                            'whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top text-text-primary',
                            NUMERIC_KEYS.has(column.key)
                              ? amountClass
                              : 'text-left',
                          ].join(' ')}
                        >
                          {value || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TradingSummaryReportTable;
