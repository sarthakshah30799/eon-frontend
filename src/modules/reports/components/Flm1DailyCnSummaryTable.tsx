import { FLM1_DAILY_CN_SUMMARY_TEXT } from '../constants/flm1DailyCnSummaryConstants';
import type { IFlm1DailyCnSummaryResponse, IFlm1ReportRow } from '../types';

interface Flm1DailyCnSummaryTableProps {
  report: IFlm1DailyCnSummaryResponse | null;
  loading?: boolean;
}

const getRowClassName = (row: IFlm1ReportRow, rowIndex: number) => {
  if (row.rowType === 'TOTAL') {
    return 'bg-slate-50 font-semibold';
  }
  if (row.rowType === 'HEADER') {
    return 'bg-white font-medium text-text-secondary';
  }
  return rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
};

export const Flm1DailyCnSummaryTable = ({
  report,
  loading = false,
}: Flm1DailyCnSummaryTableProps) => {
  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        Loading report...
      </div>
    );
  }

  if (!report || report.groups.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        {FLM1_DAILY_CN_SUMMARY_TEXT.emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {report.groups.map(group => (
        <div key={group.branchId} className="space-y-2">
          <h3 className="text-sm font-semibold text-text-primary">
            {group.branchLabel}
          </h3>
          {group.empty ? (
            <div className="rounded-md border border-slate-200 bg-white px-3 py-4 text-[11px] text-text-secondary">
              {group.emptyMessage || FLM1_DAILY_CN_SUMMARY_TEXT.emptyMessage}
            </div>
          ) : (
            group.blocks.map((block, blockIndex) => (
              <div
                key={`${group.branchId}-${blockIndex}`}
                className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm"
              >
                <table className="min-w-max w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr>
                      {block.columns.map(column => (
                        <th
                          key={column.key}
                          className="border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-tertiary"
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr
                        key={`${group.branchId}-${blockIndex}-${row.lineKey}`}
                        className={getRowClassName(row, rowIndex)}
                      >
                        {block.columns.map(column => {
                          const value = row[column.key] ?? '';
                          const isParticulars = column.key === 'particulars';
                          return (
                            <td
                              key={column.key}
                              className={[
                                'border-b border-slate-100 px-2 py-1.5 text-[11px] align-top',
                                isParticulars
                                  ? 'text-left whitespace-pre'
                                  : 'text-right tabular-nums',
                                row.rowType === 'TOTAL' ? 'font-semibold' : '',
                              ].join(' ')}
                            >
                              {value ||
                                (isParticulars ? (
                                  ''
                                ) : (
                                  <span className="text-slate-300">-</span>
                                ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
};

export default Flm1DailyCnSummaryTable;
