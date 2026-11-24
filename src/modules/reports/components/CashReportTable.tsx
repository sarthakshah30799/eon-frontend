import { toDisplayDate } from '@/utils';
import { formatReportDateValue } from '../utils';
import { CASH_REPORT_TEXT } from '../constants/cashReportConstants';
import type {
  ICashReportAccount,
  ICashReportBranch,
  ICashReportResponse,
  ICashReportRow,
} from '../types';
import { CashReportLayoutEnum } from '../types';

interface CashReportTableProps {
  report: ICashReportResponse | null;
  loading?: boolean;
}

type DisplayRow = {
  key: string;
  transactionType: string;
  date: string;
  type: string;
  number: string;
  party: string;
  narration: string;
  receipts: string;
  payments: string;
  runningBalance: string;
  emphasis: boolean;
  isHeader: boolean;
};

const amountClass = 'text-right tabular-nums';

const pushAccountRows = (
  rows: DisplayRow[],
  branchKey: string,
  account: ICashReportAccount
) => {
  rows.push({
    key: `${branchKey}-account-${account.accountId}`,
    transactionType: account.accountLabel,
    date: '',
    type: '',
    number: '',
    party: '',
    narration: '',
    receipts: '',
    payments: '',
    runningBalance: '',
    emphasis: true,
    isHeader: true,
  });

  account.rows.forEach((row: ICashReportRow, index) => {
    const isBalanceRow =
      row.type === 'OP' ||
      row.type === 'CL' ||
      row.transactionType === CASH_REPORT_TEXT.openingBalance ||
      row.transactionType === CASH_REPORT_TEXT.closingBalance;
    rows.push({
      key: `${branchKey}-${account.accountId}-${index}-${row.type}-${row.number}`,
      transactionType: row.transactionType,
      date: row.date,
      type: row.type,
      number: row.number,
      party: row.party,
      narration: row.narration,
      receipts: row.receipts,
      payments: row.payments,
      runningBalance: row.runningBalance,
      emphasis: isBalanceRow,
      isHeader: false,
    });
  });
};

const pushSummaryRows = (
  rows: DisplayRow[],
  branchKey: string,
  branch: ICashReportBranch
) => {
  rows.push({
    key: `${branchKey}-summary-header`,
    transactionType: CASH_REPORT_TEXT.summaryOfCash,
    date: '',
    type: '',
    number: '',
    party: '',
    narration: '',
    receipts: '',
    payments: '',
    runningBalance: '',
    emphasis: true,
    isHeader: true,
  });
  rows.push({
    key: `${branchKey}-summary-opening`,
    transactionType: CASH_REPORT_TEXT.openingBalance,
    date: '',
    type: '',
    number: '',
    party: '',
    narration: '',
    receipts: '',
    payments: '',
    runningBalance: branch.summary.openingBalance,
    emphasis: true,
    isHeader: false,
  });
  rows.push({
    key: `${branchKey}-summary-receipts`,
    transactionType: CASH_REPORT_TEXT.totalReceipts,
    date: '',
    type: '',
    number: '',
    party: '',
    narration: '',
    receipts: branch.summary.totalReceipts,
    payments: '',
    runningBalance: '',
    emphasis: true,
    isHeader: false,
  });
  rows.push({
    key: `${branchKey}-summary-payments`,
    transactionType: CASH_REPORT_TEXT.totalPayment,
    date: '',
    type: '',
    number: '',
    party: '',
    narration: '',
    receipts: '',
    payments: branch.summary.totalPayments,
    runningBalance: '',
    emphasis: true,
    isHeader: false,
  });
  rows.push({
    key: `${branchKey}-summary-closing`,
    transactionType: CASH_REPORT_TEXT.closingBalance,
    date: '',
    type: '',
    number: '',
    party: '',
    narration: '',
    receipts: '',
    payments: '',
    runningBalance: branch.summary.closingBalance,
    emphasis: true,
    isHeader: false,
  });
};

const buildBranchRows = (branch: ICashReportBranch): DisplayRow[] => {
  const key = branch.branchId ?? 'all';
  const rows: DisplayRow[] = [];

  if (branch.branchLabel && branch.branchLabel !== 'ALL') {
    rows.push({
      key: `${key}-branch`,
      transactionType: branch.branchLabel,
      date: '',
      type: '',
      number: '',
      party: '',
      narration: '',
      receipts: '',
      payments: '',
      runningBalance: '',
      emphasis: true,
      isHeader: true,
    });
  }

  branch.accounts.forEach(account => pushAccountRows(rows, key, account));
  pushSummaryRows(rows, key, branch);
  return rows;
};

const CashReportColumnarTable = ({
  report,
}: {
  report: ICashReportResponse;
}) => {
  const branchColumns = report.columns.filter(column => column.key !== 'code');
  const periodLabel = `${toDisplayDate(report.startDate)} - ${toDisplayDate(report.endDate)}`;

  if (!report.rows.length || !branchColumns.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {report.message || CASH_REPORT_TEXT.empty}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-center text-[12px] font-medium text-text-primary">
        {CASH_REPORT_TEXT.forPeriod}: {periodLabel}
      </div>
      <div className="text-center text-[13px] font-semibold text-text-primary">
        {CASH_REPORT_TEXT.cashBookTitle}
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
            {report.rows.map((row, index) => (
              <tr
                key={`${row.accountId}-${row.code}`}
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

const CashReportDetailTable = ({
  report,
}: {
  report: ICashReportResponse;
}) => {
  if (!report.branches.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {report.message || CASH_REPORT_TEXT.empty}
      </div>
    );
  }

  const columns = report.columns.length
    ? report.columns
    : [
        { key: 'transactionType', label: 'Transaction' },
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type' },
        { key: 'number', label: 'No' },
        { key: 'party', label: 'Party' },
        { key: 'narration', label: 'Narration' },
        { key: 'receipts', label: 'Receipts' },
        { key: 'payments', label: 'Payments' },
        { key: 'runningBalance', label: 'Running Bal.' },
      ];

  const rows = report.branches.flatMap(buildBranchRows);

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            {columns.map(column => (
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
          {rows.map((row, index) => (
            <tr
              key={row.key}
              className={
                row.emphasis
                  ? 'bg-slate-50 font-semibold'
                  : index % 2 === 0
                    ? 'bg-white'
                    : 'bg-slate-50/40'
              }
            >
              <td
                className={`border border-slate-100 px-2 py-1.5 text-[11px] align-top ${
                  row.isHeader ? 'whitespace-nowrap' : ''
                }`}
                colSpan={row.isHeader ? columns.length : undefined}
              >
                {row.transactionType}
              </td>
              {!row.isHeader && (
                <>
                  <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top">
                    {formatReportDateValue(row.date)}
                  </td>
                  <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top">
                    {row.type}
                  </td>
                  <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top">
                    {row.number}
                  </td>
                  <td className="border border-slate-100 px-2 py-1.5 text-[11px] align-top">
                    {row.party}
                  </td>
                  <td className="border border-slate-100 px-2 py-1.5 text-[11px] align-top">
                    {row.narration}
                  </td>
                  <td
                    className={`whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top ${amountClass}`}
                  >
                    {row.receipts}
                  </td>
                  <td
                    className={`whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top ${amountClass}`}
                  >
                    {row.payments}
                  </td>
                  <td
                    className={`whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top ${amountClass}`}
                  >
                    {row.runningBalance}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CashReportTable = ({
  report,
  loading,
}: CashReportTableProps) => {
  if (loading) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {CASH_REPORT_TEXT.empty}
      </div>
    );
  }

  if (report.layout === CashReportLayoutEnum.COLUMNAR) {
    return <CashReportColumnarTable report={report} />;
  }

  return <CashReportDetailTable report={report} />;
};

export default CashReportTable;
