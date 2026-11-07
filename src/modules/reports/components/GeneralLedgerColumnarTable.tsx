import { GENERAL_LEDGER_REPORT_TEXT } from '../constants/generalLedgerReportConstants';
import type { IGeneralLedgerReportResponse } from '../types';

interface GeneralLedgerColumnarTableProps {
  report: IGeneralLedgerReportResponse | null;
  loading?: boolean;
}

export const GeneralLedgerColumnarTable = ({
  report,
  loading,
}: GeneralLedgerColumnarTableProps) => {
  if (loading) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!report?.columnarRows.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {report?.message || GENERAL_LEDGER_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            {report.columnarColumns.map(column => (
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
          {report.columnarRows.map((row, index) => (
            <tr
              key={`${row.accountId}-${index}`}
              className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}
            >
              {report.columnarColumns.map(column => (
                <td
                  key={column.key}
                  className={[
                    'whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top',
                    column.key === 'code' ? '' : 'text-right tabular-nums',
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
