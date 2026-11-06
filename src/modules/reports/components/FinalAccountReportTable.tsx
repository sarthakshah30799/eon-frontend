import { FINAL_ACCOUNT_REPORT_TEXT } from '../constants/finalAccountReportConstants';
import type { IFinalAccountReportResponse } from '../types';

interface FinalAccountReportTableProps {
  report: IFinalAccountReportResponse | null;
  loading?: boolean;
}

export const FinalAccountReportTable = ({
  report,
  loading,
}: FinalAccountReportTableProps) => {
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
        {report?.message || FINAL_ACCOUNT_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {report.sections.map(section => (
        <div
          key={`${section.branchId ?? 'all'}-${section.branchLabel}`}
          className="overflow-hidden rounded-md border border-slate-200"
        >
          {section.branchLabel && (
            <div className="bg-slate-100 px-3 py-2 text-[12px] font-semibold text-text-primary">
              {section.branchLabel}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr>
                  {report.debitColumns.map(column => (
                    <th
                      key={`debit-${column.key}`}
                      className="whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary"
                    >
                      {column.label}
                    </th>
                  ))}
                  {report.creditColumns.map(column => (
                    <th
                      key={`credit-${column.key}`}
                      className="whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.debitRows.map((debitRow, index) => {
                  const creditRow = section.creditRows[index] ?? {
                    code: '',
                    name: '',
                    amount: '',
                  };
                  return (
                    <tr
                      key={`${section.branchLabel}-${index}-${debitRow.code}-${creditRow.code}`}
                      className={
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }
                    >
                      <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px]">
                        {debitRow.code}
                      </td>
                      <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px]">
                        {debitRow.name}
                      </td>
                      <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-right text-[11px] tabular-nums">
                        {debitRow.amount}
                      </td>
                      <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px]">
                        {creditRow.code}
                      </td>
                      <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px]">
                        {creditRow.name}
                      </td>
                      <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-right text-[11px] tabular-nums">
                        {creditRow.amount}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-semibold">
                  <td className="border border-slate-100 px-2 py-1.5 text-[11px]" />
                  <td className="border border-slate-100 px-2 py-1.5 text-[11px]">
                    {FINAL_ACCOUNT_REPORT_TEXT.total}
                  </td>
                  <td className="border border-slate-100 px-2 py-1.5 text-right text-[11px] tabular-nums">
                    {section.debitTotal}
                  </td>
                  <td className="border border-slate-100 px-2 py-1.5 text-[11px]" />
                  <td className="border border-slate-100 px-2 py-1.5 text-[11px]">
                    {FINAL_ACCOUNT_REPORT_TEXT.total}
                  </td>
                  <td className="border border-slate-100 px-2 py-1.5 text-right text-[11px] tabular-nums">
                    {section.creditTotal}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
