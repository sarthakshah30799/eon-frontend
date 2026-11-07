import { TRIAL_BALANCE_REPORT_TEXT } from '../constants/trialBalanceReportConstants';
import type { ITrialBalanceReportResponse } from '../types';

interface TrialBalanceReportTableProps {
  report: ITrialBalanceReportResponse | null;
  loading?: boolean;
}

const amountKeys = new Set([
  'openingDr',
  'openingCr',
  'transactionDebit',
  'transactionCredit',
  'closingDr',
  'closingCr',
]);

export const TrialBalanceReportTable = ({
  report,
  loading,
}: TrialBalanceReportTableProps) => {
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
        {report?.message || TRIAL_BALANCE_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            {report.columns.map(column => (
              <th
                key={column.key}
                className="whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row, index) => {
            const isHeader =
              row.rowType === 'BRANCH' ||
              row.rowType === 'TYPE' ||
              row.rowType === 'CODE' ||
              row.rowType === 'TOTAL';
            return (
              <tr
                key={`${row.rowType}-${row.code}-${row.name}-${index}`}
                className={
                  isHeader
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
                      amountKeys.has(column.key)
                        ? 'text-right tabular-nums'
                        : '',
                    ].join(' ')}
                  >
                    {row[column.key] ?? ''}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
