import { OUTSTANDING_TRANSACTION_REPORT_TEXT } from '../constants/outstandingTransactionReportConstants';
import type { IOutstandingTransactionReportResponse } from '../types';

interface OutstandingTransactionReportTableProps {
  report: IOutstandingTransactionReportResponse | null;
  loading?: boolean;
}

const amountKeys = new Set(['inrAmount', 'toReceive', 'toGive', 'days']);

export const OutstandingTransactionReportTable = ({
  report,
  loading,
}: OutstandingTransactionReportTableProps) => {
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
        {report?.message || OUTSTANDING_TRANSACTION_REPORT_TEXT.empty}
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
        </thead>
        <tbody>
          {report.rows.map((row, index) => (
            <tr
              key={`${row.lineKey}-${index}`}
              className={
                row.rowType === 'BRANCH'
                  ? 'bg-slate-100 font-semibold'
                  : row.rowType === 'PARTY' || row.rowType === 'TOTAL'
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
                    amountKeys.has(column.key) ? 'text-right tabular-nums' : '',
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
