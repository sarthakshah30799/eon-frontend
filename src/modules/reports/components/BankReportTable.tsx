import { toDisplayDate } from '@/utils';
import { formatReportCellValue } from '../utils';
import {
  BANK_REPORT_TEXT,
  BankReportViewLayoutEnum,
  type BankReportViewLayout,
} from '../constants/bankReportConstants';
import type {
  IBankReportColumn,
  IBankReportRow,
  IBankReportSection,
} from '../types';

interface BankReportTableProps {
  columns: IBankReportColumn[];
  sections: IBankReportSection[];
  viewLayout?: BankReportViewLayout;
  startDate?: string;
  endDate?: string;
  loading?: boolean;
}

const NUMERIC_KEYS = new Set(['receipts', 'payments', 'runningBalance']);
const BALANCE_ROW_TYPES = new Set(['Opening balance', 'Closing balance']);
const amountClass = 'text-right tabular-nums';

const getCellClassName = (key: string) =>
  [
    'whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top text-text-primary',
    NUMERIC_KEYS.has(key) ? amountClass : 'text-left',
  ].join(' ');

const extractAccountCode = (accountLabel: string, accountId: string) => {
  const code = accountLabel.split(' - ')[0]?.trim();
  return code || accountId;
};

const BankReportColumnarTable = ({
  sections,
  startDate,
  endDate,
}: {
  sections: IBankReportSection[];
  startDate?: string;
  endDate?: string;
}) => {
  const branchColumns = Array.from(
    new Map(
      sections
        .filter(section => section.branchId)
        .map(section => [
          section.branchId as string,
          {
            key: section.branchId as string,
            label: section.branchLabel,
          },
        ])
    ).values()
  );

  const accountRows = Array.from(
    sections
      .reduce((map, section) => {
        const existing = map.get(section.accountId) ?? {
          accountId: section.accountId,
          code: extractAccountCode(section.accountLabel, section.accountId),
          values: {} as Record<string, string>,
        };
        if (section.branchId) {
          existing.values[section.branchId] = section.closingBalance || '0.00';
        }
        map.set(section.accountId, existing);
        return map;
      }, new Map<
        string,
        {
          accountId: string;
          code: string;
          values: Record<string, string>;
        }
      >())
      .values()
  );

  const periodLabel =
    startDate && endDate
      ? `${toDisplayDate(startDate)} - ${toDisplayDate(endDate)}`
      : '';

  if (!accountRows.length || !branchColumns.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {BANK_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {periodLabel ? (
        <div className="text-center text-[12px] font-medium text-text-primary">
          {BANK_REPORT_TEXT.forPeriod}: {periodLabel}
        </div>
      ) : null}
      <div className="text-center text-[13px] font-semibold text-text-primary">
        {BANK_REPORT_TEXT.bankBookTitle}
      </div>
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="min-w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                Code
              </th>
              {branchColumns.map(column => (
                <th
                  key={column.key}
                  className="whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accountRows.map((row, index) => (
              <tr
                key={row.accountId}
                className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}
              >
                <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top">
                  {row.code}
                </td>
                {branchColumns.map(column => (
                  <td
                    key={`${row.accountId}-${column.key}`}
                    className={`whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top ${amountClass}`}
                  >
                    {row.values[column.key] ?? '0.00'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BankReportLedgerTable = ({
  columns,
  sections,
}: {
  columns: IBankReportColumn[];
  sections: IBankReportSection[];
}) => {
  if (!sections.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {BANK_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map(section => (
        <div
          key={`${section.branchId ?? 'all'}::${section.accountId}`}
          className="overflow-hidden rounded-md border border-slate-200"
        >
          <div className="border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-text-primary">
            {section.branchLabel} · {section.accountLabel}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th
                      key={column.key}
                      className={[
                        'whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary',
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
                        ? 'bg-slate-50 font-semibold'
                        : index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                    }
                  >
                    {columns.map(column => {
                      const value = formatReportCellValue(
                        column.key,
                        row[column.key as keyof IBankReportRow] ?? ''
                      );
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

          <div className="border-t border-slate-200 bg-slate-50 px-3 py-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              {BANK_REPORT_TEXT.summaryOfBank}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  {BANK_REPORT_TEXT.openingBalance}
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {section.openingBalance}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  {BANK_REPORT_TEXT.totalReceipts}
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {section.totalReceipts}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  {BANK_REPORT_TEXT.totalPayment}
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
                  {section.totalPayments}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-text-secondary">
                  {BANK_REPORT_TEXT.closingBalance}
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

export const BankReportTable = ({
  columns,
  sections,
  viewLayout = BankReportViewLayoutEnum.LEDGER,
  startDate,
  endDate,
  loading = false,
}: BankReportTableProps) => {
  if (loading) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (viewLayout === BankReportViewLayoutEnum.COLUMNAR) {
    return (
      <BankReportColumnarTable
        sections={sections}
        startDate={startDate}
        endDate={endDate}
      />
    );
  }

  return <BankReportLedgerTable columns={columns} sections={sections} />;
};

export default BankReportTable;
