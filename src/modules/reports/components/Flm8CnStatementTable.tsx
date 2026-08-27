import { FLM8_CN_STATEMENT_TEXT } from '../constants/flm8CnStatementConstants';
import type {
  IFlm8CnStatementResponse,
  IFlm8ReportColumn,
  IFlm8ReportRow,
} from '../types';
import {
  clusterFlm8HeaderColumns,
  hasFlm8GroupedHeader,
} from '../utils/flm8CnStatementUtils';

interface Flm8CnStatementTableProps {
  report: IFlm8CnStatementResponse | null;
  loading?: boolean;
}

const getRowClassName = (row: IFlm8ReportRow, rowIndex: number) => {
  if (row.rowType === 'TOTAL') {
    return 'bg-slate-50 font-semibold';
  }
  if (row.rowType === 'HEADER') {
    return 'bg-white font-medium text-text-secondary';
  }
  return rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
};

const getHeaderClassName = (highlight?: boolean, grouped = false) =>
  [
    'border border-slate-200 px-2 py-2 font-semibold align-middle',
    grouped
      ? 'text-center text-[10px] leading-tight text-text-primary normal-case'
      : 'text-left text-[10px] uppercase tracking-wider text-text-tertiary',
    highlight ? 'text-red-600' : '',
  ].join(' ');

const getCellClassName = (column: IFlm8ReportColumn, row: IFlm8ReportRow) => {
  const isParticulars = column.key === 'particulars';
  return [
    'border border-slate-100 px-2 py-1.5 text-[11px] align-top',
    isParticulars ? 'text-left whitespace-pre' : 'text-right tabular-nums',
    row.rowType === 'TOTAL' || column.highlight ? 'font-semibold' : '',
    column.highlight ? 'text-red-600' : '',
  ].join(' ');
};

const Flm8GroupedHeader = ({ columns }: { columns: IFlm8ReportColumn[] }) => {
  const clusters = clusterFlm8HeaderColumns(columns);

  return (
    <>
      <tr>
        {clusters.map(cluster => {
          const isGroup = Boolean(cluster.groupLabel);
          return (
            <th
              key={cluster.id}
              colSpan={isGroup ? cluster.columns.length : 1}
              rowSpan={isGroup ? 1 : 2}
              className={getHeaderClassName(cluster.highlight, isGroup)}
            >
              {cluster.groupLabel ?? cluster.columns[0]?.label}
            </th>
          );
        })}
      </tr>
      <tr>
        {clusters.flatMap(cluster =>
          cluster.groupLabel
            ? cluster.columns.map(column => (
                <th
                  key={column.key}
                  className={getHeaderClassName(column.highlight, true)}
                >
                  {column.label}
                </th>
              ))
            : []
        )}
      </tr>
    </>
  );
};

export const Flm8CnStatementTable = ({
  report,
  loading = false,
}: Flm8CnStatementTableProps) => {
  if (loading) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        Loading report...
      </div>
    );
  }

  if (!report || report.groups.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-6 text-center text-sm text-text-secondary">
        {FLM8_CN_STATEMENT_TEXT.emptyMessage}
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
              {group.emptyMessage || FLM8_CN_STATEMENT_TEXT.emptyMessage}
            </div>
          ) : (
            group.blocks.map((block, blockIndex) => {
              const groupedHeader = hasFlm8GroupedHeader(block.columns);
              return (
                <div
                  key={`${group.branchId}-${blockIndex}`}
                  className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm"
                >
                  <table className="min-w-max w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      {groupedHeader ? (
                        <Flm8GroupedHeader columns={block.columns} />
                      ) : (
                        <tr>
                          {block.columns.map(column => (
                            <th
                              key={column.key}
                              className={getHeaderClassName(column.highlight)}
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {block.rows.map((row, rowIndex) => (
                        <tr
                          key={`${group.branchId}-${blockIndex}-${row.lineKey}`}
                          className={getRowClassName(row, rowIndex)}
                        >
                          {block.columns.map(column => {
                            const value = row[column.key] ?? '';
                            const isParticulars = column.key === 'particulars';
                            return (
                              <td
                                key={column.key}
                                className={getCellClassName(column, row)}
                              >
                                {value ||
                                  (isParticulars ? (
                                    ''
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  ))}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
};

export default Flm8CnStatementTable;
