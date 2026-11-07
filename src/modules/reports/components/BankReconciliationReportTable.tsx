import { formatDateTime } from '@/utils';
import {
  BANK_RECONCILIATION_REPORT_TEXT,
  getBankReconciliationSectionLabels,
} from '../constants/bankReconciliationReportConstants';
import type {
  IBankReconciliationReportDetailRow,
  IBankReconciliationReportSection,
  IBankReportColumn,
} from '../types';

interface BankReconciliationReportTableProps {
  columns: IBankReportColumn[];
  sections: IBankReconciliationReportSection[];
  unclearedOnly?: boolean;
  isLoading?: boolean;
}

const NUMERIC_KEYS = new Set(['chequeAmount', 'amount']);

const DateCell = ({ value }: { value: string }) => (
  <span>{value ? formatDateTime(value) : '-'}</span>
);

const SummaryRow = ({
  label,
  amount,
  colSpan,
}: {
  label: string;
  amount: string;
  colSpan: number;
}) => (
  <tr className="bg-slate-50 font-medium text-text-primary">
    <td className="whitespace-nowrap border-b border-slate-50 px-3 py-2" colSpan={Math.max(colSpan - 1, 1)}>
      {label}
    </td>
    <td className="whitespace-nowrap border-b border-slate-50 px-3 py-2 text-right tabular-nums">
      {amount}
    </td>
  </tr>
);

const DetailRows = ({
  rows,
  columns,
}: {
  rows: IBankReconciliationReportDetailRow[];
  columns: IBankReportColumn[];
}) => (
  <>
    {rows.map(row => (
      <tr
        key={`${row.srNo}-${row.voucherNo}-${row.chequeNo}-${row.amount}`}
        className="bg-white"
      >
        {columns.map(column => {
          const value =
            row[column.key as keyof IBankReconciliationReportDetailRow];
          const isDate = column.key === 'date' || column.key === 'chequeDate';
          return (
            <td
              key={column.key}
              className={[
                'whitespace-nowrap border-b border-slate-50 px-3 py-2 text-text-primary',
                NUMERIC_KEYS.has(column.key)
                  ? 'text-right tabular-nums'
                  : 'text-left',
              ].join(' ')}
            >
              {isDate ? (
                <DateCell value={String(value ?? '')} />
              ) : (
                value || '-'
              )}
            </td>
          );
        })}
      </tr>
    ))}
  </>
);

export const BankReconciliationReportTable = ({
  columns,
  sections,
  unclearedOnly = true,
  isLoading = false,
}: BankReconciliationReportTableProps) => {
  const sectionLabels = getBankReconciliationSectionLabels(unclearedOnly);

  if (isLoading) {
    return (
      <div className="rounded-md border border-slate-100 px-3 py-8 text-center text-[11px] text-text-secondary">
        Loading bank reconciliation report...
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="rounded-md border border-slate-100 px-3 py-8 text-center text-[11px] text-text-secondary">
        No bank reconciliation rows found for the selected filters.
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
                <SummaryRow
                  label={BANK_RECONCILIATION_REPORT_TEXT.BOOK_BALANCE}
                  amount={section.bookBalance}
                  colSpan={columns.length}
                />
                <SummaryRow
                  label={sectionLabels.issued}
                  amount={section.issuedTotal}
                  colSpan={columns.length}
                />
                <DetailRows rows={section.issuedRows} columns={columns} />
                <SummaryRow
                  label={sectionLabels.deposited}
                  amount={section.depositedTotal}
                  colSpan={columns.length}
                />
                <DetailRows rows={section.depositedRows} columns={columns} />
                <SummaryRow
                  label={BANK_RECONCILIATION_REPORT_TEXT.BANK_BALANCE}
                  amount={section.bankBalance}
                  colSpan={columns.length}
                />
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BankReconciliationReportTable;
