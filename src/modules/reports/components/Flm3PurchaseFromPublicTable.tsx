import { FLM3_PURCHASE_FROM_PUBLIC_TEXT } from '../constants/flm3PurchaseFromPublicConstants';
import type { IFlm3PurchaseFromPublicResponse } from '../types';

interface Flm3PurchaseFromPublicTableProps {
  report: IFlm3PurchaseFromPublicResponse | null;
  loading?: boolean;
}

const NUMERIC_KEYS = new Set([
  'feAmount',
  'rate',
  'rupeeEquivalent',
  'netAmount',
  'commissionAmount',
  'byCash',
  'byCheque',
  'byOther',
  'srNo',
]);

export const Flm3PurchaseFromPublicTable = ({
  report,
  loading = false,
}: Flm3PurchaseFromPublicTableProps) => {
  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        {FLM3_PURCHASE_FROM_PUBLIC_TEXT.loadingMessage}
      </div>
    );
  }

  if (!report || report.rows.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        {FLM3_PURCHASE_FROM_PUBLIC_TEXT.emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="min-w-max w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-50">
          <tr>
            {report.columns.map(column => (
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
          {report.rows.map((row, rowIndex) => (
            <tr
              key={`${row.transactionId}-${row.srNo}-${rowIndex}`}
              className={
                row.rowType === 'TOTAL'
                  ? 'bg-slate-50 font-semibold'
                  : rowIndex % 2 === 0
                    ? 'bg-white'
                    : 'bg-slate-50/40'
              }
            >
              {report.columns.map(column => {
                const value = row[column.key] ?? '';
                const isNumeric = NUMERIC_KEYS.has(column.key);
                return (
                  <td
                    key={column.key}
                    className={[
                      'border-b border-slate-100 px-2 py-1.5 text-[11px] align-top',
                      isNumeric ? 'text-right tabular-nums' : 'text-left',
                    ].join(' ')}
                  >
                    {value || <span className="text-slate-300">-</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Flm3PurchaseFromPublicTable;
