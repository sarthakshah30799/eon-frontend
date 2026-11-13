import { CASH_FLOW_REPORT_TEXT } from '../constants/cashFlowReportConstants';
import type {
  ICashFlowReportLine,
  ICashFlowReportResponse,
  ICashFlowReportSection,
} from '../types';

interface CashFlowReportTableProps {
  report: ICashFlowReportResponse | null;
  loading?: boolean;
}

type DisplayRow = {
  key: string;
  description: string;
  bank: string;
  cash: string;
  total: string;
  emphasis: boolean;
};

const amountClass = 'text-right tabular-nums';

const pushLineRows = (
  rows: DisplayRow[],
  sectionKey: string,
  lines: ICashFlowReportLine[],
  prefix: string
) => {
  lines.forEach((line, index) => {
    rows.push({
      key: `${sectionKey}-${prefix}-${index}-${line.description}`,
      description: line.description,
      bank: line.bank,
      cash: line.cash,
      total: line.total,
      emphasis: false,
    });
  });
};

const buildSectionRows = (section: ICashFlowReportSection): DisplayRow[] => {
  const key = section.branchId ?? 'all';
  const rows: DisplayRow[] = [];

  if (section.branchLabel && section.branchLabel !== 'ALL') {
    rows.push({
      key: `${key}-branch`,
      description: section.branchLabel,
      bank: '',
      cash: '',
      total: '',
      emphasis: true,
    });
  }

  rows.push({
    key: `${key}-opening`,
    description: CASH_FLOW_REPORT_TEXT.opening,
    bank: section.opening.bank,
    cash: section.opening.cash,
    total: section.opening.total,
    emphasis: true,
  });

  rows.push({
    key: `${key}-additions-header`,
    description: CASH_FLOW_REPORT_TEXT.additions,
    bank: '',
    cash: '',
    total: '',
    emphasis: true,
  });
  pushLineRows(rows, key, section.additions.lines, 'addition');
  rows.push({
    key: `${key}-additions-total`,
    description: CASH_FLOW_REPORT_TEXT.additionsTotal,
    bank: section.additions.total.bank,
    cash: section.additions.total.cash,
    total: section.additions.total.total,
    emphasis: true,
  });

  rows.push({
    key: `${key}-inter-header`,
    description: CASH_FLOW_REPORT_TEXT.interBranch,
    bank: '',
    cash: '',
    total: '',
    emphasis: true,
  });
  pushLineRows(rows, key, section.interBranch.lines, 'inter');
  rows.push({
    key: `${key}-inter-total`,
    description: CASH_FLOW_REPORT_TEXT.interBranchTotal,
    bank: section.interBranch.total.bank,
    cash: section.interBranch.total.cash,
    total: section.interBranch.total.total,
    emphasis: true,
  });

  rows.push({
    key: `${key}-deductions-header`,
    description: CASH_FLOW_REPORT_TEXT.deductions,
    bank: '',
    cash: '',
    total: '',
    emphasis: true,
  });
  pushLineRows(rows, key, section.deductions.lines, 'deduction');
  rows.push({
    key: `${key}-deductions-total`,
    description: CASH_FLOW_REPORT_TEXT.deductionsTotal,
    bank: section.deductions.total.bank,
    cash: section.deductions.total.cash,
    total: section.deductions.total.total,
    emphasis: true,
  });

  rows.push({
    key: `${key}-closing`,
    description: CASH_FLOW_REPORT_TEXT.closing,
    bank: section.closing.bank,
    cash: section.closing.cash,
    total: section.closing.total,
    emphasis: true,
  });

  return rows;
};

export const CashFlowReportTable = ({
  report,
  loading,
}: CashFlowReportTableProps) => {
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
        {report?.message || CASH_FLOW_REPORT_TEXT.empty}
      </div>
    );
  }

  const columns = report.columns.length
    ? report.columns
    : [
        { key: 'description', label: 'Description' },
        { key: 'bank', label: 'Bank' },
        { key: 'cash', label: 'Cash' },
        { key: 'total', label: 'Total' },
      ];

  const rows = report.sections.flatMap(buildSectionRows);

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
              <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top">
                {row.description}
              </td>
              <td
                className={`whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top ${amountClass}`}
              >
                {row.bank}
              </td>
              <td
                className={`whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top ${amountClass}`}
              >
                {row.cash}
              </td>
              <td
                className={`whitespace-nowrap border border-slate-100 px-2 py-1.5 text-[11px] align-top ${amountClass}`}
              >
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CashFlowReportTable;
