import { LRS_DAILY_REPORT_TEXT } from '../constants/lrsDailyReportConstants';
import {
  LrsDailyReportFormatEnum,
  type ILrsDailyReportResponse,
} from '../types';

interface LrsDailyReportTableProps {
  report: ILrsDailyReportResponse | null;
  loading?: boolean;
}

const NUMERIC_KEYS = new Set(['amountUsd', 'amountInr']);

export const LrsDailyReportTable = ({
  report,
  loading = false,
}: LrsDailyReportTableProps) => {
  if (loading) {
    return (
      <div className="rounded-md border border-slate-100 px-3 py-8 text-center text-[11px] text-text-secondary">
        {LRS_DAILY_REPORT_TEXT.loadingReport}
      </div>
    );
  }

  if (!report) {
    return null;
  }

  if (report.reportFormat === LrsDailyReportFormatEnum.CIMS_UPLOAD) {
    return (
      <div className="space-y-3">
        <div className="overflow-x-auto rounded-md border border-slate-100">
          <table className="min-w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 text-left text-[10px] uppercase tracking-wider text-text-tertiary">
                <th className="px-3 py-2 font-semibold">
                  {LRS_DAILY_REPORT_TEXT.columnHeading}
                </th>
              </tr>
            </thead>
            <tbody>
              {report.uploadLines.map((line, index) => (
                <tr key={`${index}-${line}`} className="border-t border-slate-50">
                  <td className="whitespace-nowrap px-3 py-1.5 font-mono text-text-primary">
                    {line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-md border border-slate-100">
        <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-left text-[10px] uppercase tracking-wider text-text-tertiary">
              {report.columns.map(column => (
                <th key={column.key} className="px-3 py-2 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={report.columns.length || 1}
                  className="px-3 py-8 text-center text-text-secondary"
                >
                  {LRS_DAILY_REPORT_TEXT.empty}
                </td>
              </tr>
            ) : (
              report.rows.map(row => (
                <tr
                  key={row.recordIdentifier}
                  className="border-t border-slate-50"
                >
                  {report.columns.map(column => (
                    <td
                      key={column.key}
                      className={[
                        'whitespace-nowrap px-3 py-1.5 text-text-primary',
                        NUMERIC_KEYS.has(column.key)
                          ? 'text-right tabular-nums'
                          : 'text-left',
                      ].join(' ')}
                    >
                      {row[column.key as keyof typeof row]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-4 px-1 text-[11px] text-text-secondary">
        <span>
          {LRS_DAILY_REPORT_TEXT.totalUsd}: {report.totalAmountUsd}
        </span>
        <span>
          {LRS_DAILY_REPORT_TEXT.totalInr}: {report.totalAmountInr}
        </span>
        <span>
          {LRS_DAILY_REPORT_TEXT.recordCount}: {report.recordCount}
        </span>
      </div>
    </div>
  );
};

export default LrsDailyReportTable;
