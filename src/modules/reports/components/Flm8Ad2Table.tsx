import { FLM8_AD2_TEXT } from '../constants/flm8Ad2Constants';
import type { IFlm8Ad2Response, IFlm8Ad2Row } from '../types';

interface Flm8Ad2TableProps {
  report: IFlm8Ad2Response | null;
  loading?: boolean;
}

const rowClassName = (row: IFlm8Ad2Row, index: number) => {
  if (row.rowType === 'TOTAL') {
    return 'bg-slate-50 font-semibold';
  }
  return index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
};

export const Flm8Ad2Table = ({ report, loading }: Flm8Ad2TableProps) => {
  if (loading) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!report?.rows.length) {
    return (
      <div className="px-2 py-6 text-center text-[11px] text-text-secondary">
        {report?.message || FLM8_AD2_TEXT.empty}
      </div>
    );
  }

  const textColumnKeys = new Set([
    'line',
    'particulars',
    'srNo',
    'purposeCode',
    'purposeDescription',
    'purposeDesc',
    'trCurr',
    'trxType',
    'rbiCode',
    'partyType',
    'partyName',
    'address',
    'city',
    'state',
    'pinCode',
    'appointmentDate',
    'fxFacility',
  ]);

  const fixedColumnClass = (key: string) => {
    if (key === 'line') {
      return 'sticky left-0 z-10 w-14 min-w-14';
    }
    if (key === 'particulars' && report.columns.some(column => column.key === 'line')) {
      return 'sticky left-14 z-10 min-w-72';
    }
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr>
            {report.columns.map(column => (
              <th
                key={column.key}
                className={[
                  'border border-slate-200 bg-white px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary',
                  fixedColumnClass(column.key),
                ].join(' ')}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row, index) => (
            <tr key={`${row.lineKey}-${index}`} className={rowClassName(row, index)}>
              {report.columns.map(column => (
                <td
                  key={column.key}
                  className={[
                    'border border-slate-100 px-2 py-1.5 text-[11px] align-top',
                    textColumnKeys.has(column.key)
                      ? column.key === 'purposeDescription' || column.key === 'particulars'
                        ? 'min-w-64 whitespace-pre-wrap text-left'
                        : 'whitespace-nowrap text-left'
                      : 'text-right tabular-nums',
                    row.rowType === 'TOTAL' ? 'font-semibold' : '',
                    fixedColumnClass(column.key)
                      ? row.rowType === 'TOTAL'
                        ? 'bg-slate-50'
                        : index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50'
                      : '',
                  ].join(' ')}
                >
                  {row[column.key] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
