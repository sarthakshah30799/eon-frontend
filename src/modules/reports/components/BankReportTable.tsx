import type {
  IBankReportColumn,
  IBankReportRow,
  IBankReportSection,
} from '../types';

interface BankReportTableProps {
  columns: IBankReportColumn[];
  sections: IBankReportSection[];
  loading?: boolean;
}

const NUMERIC_KEYS = new Set(['receipts', 'payments', 'runningBalance']);
const BALANCE_ROW_TYPES = new Set(['Opening balance', 'Closing balance']);

const getCellClassName = (key: string) =>
  [
    'whitespace-nowrap border-b border-slate-50 px-3 py-2 text-text-primary',
    NUMERIC_KEYS.has(key) ? 'text-right tabular-nums' : 'text-left',
  ].join(' ');

export const BankReportTable = ({
  columns,
  sections,
  loading = false,
}: BankReportTableProps) => {
  if (loading) {
    return (
      <div className="rounded-md border border-slate-100 px-3 py-8 text-center text-[11px] text-text-secondary">
        Loading bank report...
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="rounded-md border border-slate-100 px-3 py-8 text-center text-[11px] text-text-secondary">
        No bank ledger movements found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div
          key={`${section.branchId ?? 'all'}::${section.accountId}`}
          className="overflow-hidden rounded-lg border border-border-primary"
        >
          <div className="border-b border-border-primary bg-slate-50 px-3 py-2 text-xs font-semibold text-text-primary">
            {section.branchLabel} · {section.accountLabel}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px]">
              <thead className="bg-white text-text-secondary">
                <tr>
                  {columns.map(column => (
                    <th
                      key={column.key}
                      className={[
                        'whitespace-nowrap border-b border-slate-100 px-3 py-2 font-medium',
                        NUMERIC_KEYS.has(column.key)
                          ? 'text-right'
                          : 'text-left',
                      ].join(' ')}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, index) => (
                  <tr
                    key={`${section.accountId}-${index}-${row.transactionType}-${row.number}-${row.createdAt}`}
                    className={
                      BALANCE_ROW_TYPES.has(row.transactionType)
                        ? 'bg-slate-50 font-medium'
                        : 'bg-white'
                    }
                  >
                    {columns.map(column => {
                      const value =
                        row[column.key as keyof IBankReportRow] ?? '';
                      return (
                        <td
                          key={column.key}
                          className={getCellClassName(column.key)}
                        >
                          {value || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border-primary bg-slate-50 px-3 py-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Summary
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  Opening balance
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {section.openingBalance}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  Total receipts
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {section.totalReceipts}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  Total payments
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {section.totalPayments}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  Closing balance
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {section.closingBalance}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BankReportTable;
