import type { ICurrencyBalanceReportColumn, ICurrencyBalanceReportRow } from '../types';

interface CurrencyBalanceReportTableProps {
  columns: ICurrencyBalanceReportColumn[];
  rows: ICurrencyBalanceReportRow[];
  loading?: boolean;
  emptyMessage?: string;
}

const getCellClassName = (key: string) =>
  [
    'border-b border-slate-100 px-2 py-1.5 text-[11px] align-top',
    key === 'date' || key === 'branch' || key === 'counter'
      ? 'text-left'
      : 'text-right tabular-nums',
  ].join(' ');

export const CurrencyBalanceReportTable = ({
  columns,
  rows,
  loading = false,
  emptyMessage = 'No report data found for the selected filters.',
}: CurrencyBalanceReportTableProps) => {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="min-w-max w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-50">
          <tr>
            {columns.map(column => (
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
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-sm text-text-secondary"
              >
                Loading report...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-sm text-text-secondary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={`${row.date}-${row.branch}-${row.counter}-${rowIndex}`}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}
              >
                {columns.map(column => {
                  const value = row[column.key as keyof ICurrencyBalanceReportRow] ?? '';
                  return (
                    <td key={column.key} className={getCellClassName(column.key)}>
                      {value || <span className="text-slate-300">-</span>}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CurrencyBalanceReportTable;
