import type {
  ISalePurchaseReportColumn,
  ISalePurchaseReportRow,
} from '../types';

interface SalePurchaseReportTableProps {
  columns: ISalePurchaseReportColumn[];
  rows: ISalePurchaseReportRow[];
  loading?: boolean;
  emptyMessage?: string;
}

const getCellClassName = (row: ISalePurchaseReportRow, key: string) => {
  if (row.rowType === 'GROUP') {
    return 'border-b border-slate-200 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-700';
  }

  const isNumeric =
    [
      'quantity',
      'rate',
      'amount',
      'taxAmount',
      'netAmount',
      'debit',
      'credit',
      'profit',
      'cost',
      'totalGp',
      'otherIncome',
      'otherExpense',
      'commissionRate',
      'commissionAmount',
      'netProfit',
    ].includes(key) || key.toLowerCase().includes('amount') || key.toLowerCase().includes('rate');

  return [
    'border-b border-slate-100 px-2 py-1.5 text-[11px] align-top',
    isNumeric ? 'text-right tabular-nums' : 'text-left',
    row.rowType === 'SUBTOTAL' ? 'font-semibold bg-slate-50' : '',
  ].join(' ');
};

export const SalePurchaseReportTable = ({
  columns,
  rows,
  loading = false,
  emptyMessage = 'No report data found for the selected filters.',
}: SalePurchaseReportTableProps) => {
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
                key={`${row.transactionId}-${row.rowType}-${rowIndex}`}
                className={[
                  row.rowType === 'GROUP'
                    ? 'bg-slate-100'
                    : row.rowType === 'SUBTOTAL'
                      ? 'bg-slate-50'
                      : rowIndex % 2 === 0
                        ? 'bg-white'
                        : 'bg-slate-50/30',
                ].join(' ')}
              >
                {row.rowType === 'GROUP' ? (
                  <td colSpan={columns.length} className={getCellClassName(row, 'partyProfileName')}>
                    {row.partyProfileName
                      ? `Party Profile: ${row.partyProfileName}`
                      : 'Party Profile'}
                  </td>
                ) : (
                  columns.map(column => {
                    const value = row[column.key] ?? '';
                    return (
                      <td key={column.key} className={getCellClassName(row, column.key)}>
                        {value || <span className="text-slate-300">-</span>}
                      </td>
                    );
                  })
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalePurchaseReportTable;
