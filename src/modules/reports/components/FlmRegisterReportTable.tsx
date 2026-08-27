import {
  FlmReportLayoutEnum,
  type FlmReportLayout,
} from '../constants/flmReportLayoutConstants';
import type { IFlm3PurchaseFromPublicResponse } from '../types';

interface FlmRegisterReportTableProps {
  report: IFlm3PurchaseFromPublicResponse | null;
  loading?: boolean;
  loadingMessage: string;
  emptyMessage: string;
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

const renderTable = (
  columns: IFlm3PurchaseFromPublicResponse['columns'],
  rows: IFlm3PurchaseFromPublicResponse['rows'],
  keyPrefix: string,
) => (
  <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
    <table className="min-w-max w-full border-collapse">
      <thead className="sticky top-0 z-10 bg-slate-50">
        <tr>
          {columns.map(column => (
            <th
              key={`${keyPrefix}-${column.key}`}
              className="border-b border-slate-200 px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-tertiary"
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={`${keyPrefix}-${row.transactionId}-${row.srNo}-${rowIndex}`}
            className={
              row.rowType === 'TOTAL'
                ? 'bg-slate-50 font-semibold'
                : rowIndex % 2 === 0
                  ? 'bg-white'
                  : 'bg-slate-50/40'
            }
          >
            {columns.map(column => {
              const value = row[column.key] ?? '';
              const isNumeric = NUMERIC_KEYS.has(column.key);
              return (
                <td
                  key={`${keyPrefix}-${column.key}-${rowIndex}`}
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

export const FlmRegisterReportTable = ({
  report,
  loading = false,
  loadingMessage,
  emptyMessage,
}: FlmRegisterReportTableProps) => {
  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        {loadingMessage}
      </div>
    );
  }

  const layout: FlmReportLayout =
    report?.layout ?? FlmReportLayoutEnum.BRANCH_WISE;

  if (!report) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  if (layout === FlmReportLayoutEnum.BRANCH_WISE) {
    if (!report.groups?.length) {
      return (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
          {emptyMessage}
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
                {group.emptyMessage || emptyMessage}
              </div>
            ) : (
              renderTable(group.columns, group.rows, group.branchId)
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!report.rows.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return renderTable(report.columns, report.rows, 'consolidated');
};

export default FlmRegisterReportTable;
