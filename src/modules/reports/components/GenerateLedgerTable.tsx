import { useMemo } from 'react';
import type {
  IGenerateLedgerColumn,
  IGenerateLedgerRow,
  IGenerateLedgerSection,
} from '../types';
import { GenerateLedgerLayoutEnum } from '../types';

interface GenerateLedgerTableProps {
  columns: IGenerateLedgerColumn[];
  sections: IGenerateLedgerSection[];
  layout?: string;
  loading?: boolean;
}

const NUMERIC_KEYS = new Set(['debit', 'credit', 'runningTotal']);
const BALANCE_ROW_TYPES = new Set(['Opening', 'Closing']);

const getCellClassName = (key: string) =>
  [
    'whitespace-nowrap border-b border-slate-50 px-3 py-2 text-text-primary',
    NUMERIC_KEYS.has(key) ? 'text-right tabular-nums' : 'text-left',
  ].join(' ');

const SectionSummary = ({ section }: { section: IGenerateLedgerSection }) => (
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
          Total debit
        </div>
        <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
          {section.totalDebit}
        </div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
        <div className="text-[10px] uppercase tracking-wide text-text-secondary">
          Total credit
        </div>
        <div className="mt-0.5 text-sm font-semibold tabular-nums text-text-primary">
          {section.totalCredit}
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
);

const SectionTable = ({
  columns,
  section,
}: {
  columns: IGenerateLedgerColumn[];
  section: IGenerateLedgerSection;
}) => (
  <>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[11px]">
        <thead className="bg-white text-text-secondary">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={[
                  'whitespace-nowrap border-b border-slate-100 px-3 py-2 font-medium',
                  NUMERIC_KEYS.has(column.key) ? 'text-right' : 'text-left',
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
              key={`${section.branchId ?? 'all'}-${section.accountId ?? 'all'}-${index}-${row.type}-${row.number}`}
              className={
                BALANCE_ROW_TYPES.has(row.type)
                  ? 'bg-slate-50 font-medium'
                  : 'bg-white'
              }
            >
              {columns.map(column => {
                const value = row[column.key as keyof IGenerateLedgerRow] ?? '';
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
    <SectionSummary section={section} />
  </>
);

export const GenerateLedgerTable = ({
  columns,
  sections,
  layout,
  loading = false,
}: GenerateLedgerTableProps) => {
  const branchGroups = useMemo(() => {
    if (layout === GenerateLedgerLayoutEnum.CONSOLIDATED) {
      return null;
    }

    const groups = new Map<
      string,
      { branchLabel: string; sections: IGenerateLedgerSection[] }
    >();

    for (const section of sections) {
      const key = section.branchId ?? section.branchLabel;
      const existing = groups.get(key);
      if (existing) {
        existing.sections.push(section);
      } else {
        groups.set(key, {
          branchLabel: section.branchLabel,
          sections: [section],
        });
      }
    }

    return Array.from(groups.values());
  }, [layout, sections]);

  if (loading) {
    return (
      <div className="rounded-md border border-slate-100 px-3 py-8 text-center text-[11px] text-text-secondary">
        Loading generate ledger...
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="rounded-md border border-slate-100 px-3 py-8 text-center text-[11px] text-text-secondary">
        No ledger postings found for the selected filters.
      </div>
    );
  }

  if (layout === GenerateLedgerLayoutEnum.CONSOLIDATED || !branchGroups) {
    return (
      <div className="space-y-4">
        {sections.map(section => (
          <div
            key={`${section.branchId ?? 'all'}::${section.accountId ?? 'all'}`}
            className="overflow-hidden rounded-lg border border-border-primary"
          >
            <div className="border-b border-border-primary bg-slate-50 px-3 py-2 text-xs font-semibold text-text-primary">
              {section.branchLabel} · {section.accountLabel}
            </div>
            <SectionTable columns={columns} section={section} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {branchGroups.map(group => (
        <div
          key={group.branchLabel}
          className="overflow-hidden rounded-lg border border-border-primary"
        >
          <div className="border-b border-border-primary bg-slate-100 px-3 py-2 text-sm font-semibold text-text-primary">
            {group.branchLabel}
          </div>
          <div className="space-y-3 p-3">
            {group.sections.map(section => (
              <div
                key={`${section.branchId}::${section.accountId}`}
                className="overflow-hidden rounded-md border border-slate-200"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-text-primary">
                  {section.accountLabel}
                </div>
                <SectionTable columns={columns} section={section} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GenerateLedgerTable;
