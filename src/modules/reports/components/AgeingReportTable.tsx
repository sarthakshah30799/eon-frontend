import { AGEING_REPORT_TEXT } from '../constants/ageingReportConstants';
import type { IAgeingReportResponse } from '../types';

interface AgeingReportTableProps {
  report: IAgeingReportResponse | null;
  loading?: boolean;
}

const textKeys = new Set([
  'docNo',
  'code',
  'name',
  'broker',
  'passport',
  'branch',
  'category',
]);

export const AgeingReportTable = ({
  report,
  loading,
}: AgeingReportTableProps) => {
  if (loading) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!report?.rows.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {report?.message || AGEING_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            {report.columns.map(column => (
              <th
                key={column.key}
                className="whitespace-nowrap border border-slate-200 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary"
              >
                {column.label}
              </th>
            ))}
          </tr>
          <tr>
            {report.columns.map(column => (
              <th
                key={`${column.key}-range`}
                className="whitespace-nowrap border border-slate-200 px-2 py-1 text-[10px] font-medium text-text-secondary"
              >
                {column.rangeLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row, index) => (
            <tr
              key={`${row.lineKey}-${index}`}
              className={
                row.rowType === 'BRANCH' ||
                row.rowType === 'BRANCH_TOTAL' ||
                row.rowType === 'GRAND_TOTAL'
                  ? 'bg-slate-100 font-semibold'
                  : row.rowType === 'PARTY'
                    ? 'bg-slate-50 font-semibold'
                    : index % 2 === 0
                      ? 'bg-white'
                      : 'bg-slate-50/40'
              }
            >
              {report.columns.map(column => (
                <td
                  key={column.key}
                  className={[
                    'whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top',
                    textKeys.has(column.key) ? '' : 'text-right tabular-nums',
                  ].join(' ')}
                >
                  {row[column.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
