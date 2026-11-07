import { GENERAL_LEDGER_REPORT_TEXT } from '../constants/generalLedgerReportConstants';
import type { IGeneralLedgerReportResponse } from '../types';
import { formatDateTime } from '@/utils';

interface GeneralLedgerReportTableProps {
  report: IGeneralLedgerReportResponse | null;
  loading?: boolean;
}

const amountKeys = new Set(['debit', 'credit', 'runningTotal']);

export const GeneralLedgerReportTable = ({
  report,
  loading,
}: GeneralLedgerReportTableProps) => {
  if (loading) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!report?.sections.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {report?.message || GENERAL_LEDGER_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {report.sections.map(section => (
        <div
          key={`${section.branchId ?? 'all'}-${section.accountId}`}
          className="overflow-hidden rounded-md border border-slate-200"
        >
          <div className="bg-slate-100 px-3 py-2 text-[12px] font-semibold text-text-primary">
            {section.branchLabel && section.branchLabel !== 'All'
              ? `${section.branchLabel} | ${section.accountCode}`
              : section.accountCode}
          </div>
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
                {section.rows.map((row, index) => (
                  <tr
                    key={`${section.accountId}-${row.rowType}-${index}`}
                    className={
                      row.rowType === 'OPENING' ||
                      row.rowType === 'CLOSING' ||
                      row.rowType === 'TOTAL'
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
                        {column.key === 'date' && row.date
                          ? formatDateTime(row.date)
                          : (row[column.key] ?? '')}
                      </td>
                    ))}
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
