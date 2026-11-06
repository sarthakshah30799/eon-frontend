import { createPortal } from 'react-dom';
import { Button, Input } from '@/components/ui';
import { formatDateTime } from '@/utils';
import { BANK_RECONCILIATION_TEXT } from '../constants';
import type { IBankReconciliationEditableRow } from '../types';

interface BankReconciliationTableSectionProps {
  title: string;
  rows: IBankReconciliationEditableRow[];
  onChange: (
    sourceType: string,
    sourceId: string,
    patch: Partial<IBankReconciliationEditableRow>
  ) => void;
}

const DateCell = ({ value }: { value: string | null | undefined }) => (
  <span>{value ? formatDateTime(value) : '-'}</span>
);

export const BankReconciliationTableSection = ({
  title,
  rows,
  onChange,
}: BankReconciliationTableSectionProps) => {
  if (!rows.length) return null;

  return (
    <section className="space-y-2 rounded-xl border border-border-primary bg-white p-3 shadow-sm">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-text-secondary">
              <th className="px-2 py-1.5">{BANK_RECONCILIATION_TEXT.COL_SELECT}</th>
              <th className="px-2 py-1.5">{BANK_RECONCILIATION_TEXT.COL_BRANCH}</th>
              <th className="px-2 py-1.5">{BANK_RECONCILIATION_TEXT.COL_TYPE}</th>
              <th className="px-2 py-1.5">{BANK_RECONCILIATION_TEXT.COL_DOC_NO}</th>
              <th className="px-2 py-1.5">{BANK_RECONCILIATION_TEXT.COL_DOC_DATE}</th>
              <th className="px-2 py-1.5">
                {BANK_RECONCILIATION_TEXT.COL_PASSENGER}
              </th>
              <th className="px-2 py-1.5 text-right">
                {BANK_RECONCILIATION_TEXT.COL_AMOUNT}
              </th>
              <th className="px-2 py-1.5">
                {BANK_RECONCILIATION_TEXT.COL_CHEQUE_NO}
              </th>
              <th className="px-2 py-1.5">
                {BANK_RECONCILIATION_TEXT.COL_CHEQUE_DATE}
              </th>
              <th className="px-2 py-1.5">{BANK_RECONCILIATION_TEXT.COL_BANK}</th>
              <th className="px-2 py-1.5">
                {BANK_RECONCILIATION_TEXT.COL_BANK_DATE}
              </th>
              <th className="px-2 py-1.5">
                {BANK_RECONCILIATION_TEXT.COL_NARRATION}
              </th>
              <th className="px-2 py-1.5">
                {BANK_RECONCILIATION_TEXT.COL_DISHONOR}
              </th>
              <th className="px-2 py-1.5">
                {BANK_RECONCILIATION_TEXT.COL_REVERSAL}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={`${row.sourceType}:${row.sourceId}:${row.amount}:${row.section}`}
                className="border-b border-slate-100 align-top"
              >
                <td className="px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={event =>
                      onChange(row.sourceType, row.sourceId, {
                        selected: event.target.checked,
                      })
                    }
                  />
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">{row.branchCode}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{row.docType}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{row.docNumber}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  <DateCell value={row.docDate} />
                </td>
                <td className="px-2 py-1.5 min-w-[120px]">{row.passengerName || '-'}</td>
                <td className="px-2 py-1.5 text-right whitespace-nowrap">
                  {row.amount}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  {row.chequeNo || '-'}
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">
                  <DateCell value={row.chequeDate} />
                </td>
                <td className="px-2 py-1.5 whitespace-nowrap">{row.bankCode}</td>
                <td className="px-2 py-1.5 min-w-[130px]">
                  <Input
                    type="date"
                    value={row.editBankDate}
                    onChange={event =>
                      onChange(row.sourceType, row.sourceId, {
                        editBankDate: event.target.value,
                      })
                    }
                    className="h-8 text-[11px]"
                  />
                </td>
                <td className="px-2 py-1.5 min-w-[160px]">
                  <Input
                    value={row.editRemarks}
                    onChange={event =>
                      onChange(row.sourceType, row.sourceId, {
                        editRemarks: event.target.value,
                      })
                    }
                    className="h-8 text-[11px]"
                    placeholder="Narration"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={row.editDishonored}
                    onChange={event =>
                      onChange(row.sourceType, row.sourceId, {
                        editDishonored: event.target.checked,
                        editReversalNumber: event.target.checked
                          ? row.editReversalNumber
                          : '',
                      })
                    }
                  />
                </td>
                <td className="px-2 py-1.5 min-w-[140px]">
                  <Input
                    value={row.editReversalNumber}
                    disabled={!row.editDishonored}
                    onChange={event =>
                      onChange(row.sourceType, row.sourceId, {
                        editReversalNumber: event.target.value,
                      })
                    }
                    className="h-8 text-[11px]"
                    placeholder="Reversal no"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

interface BankReconciliationFooterProps {
  onSave: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export const BankReconciliationFooter = ({
  onSave,
  isSaving = false,
  disabled = false,
}: BankReconciliationFooterProps) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:left-[var(--app-sidebar-offset)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-4 py-3">
        <Button type="button" onClick={onSave} disabled={disabled || isSaving}>
          {isSaving ? 'Saving...' : BANK_RECONCILIATION_TEXT.SAVE}
        </Button>
      </div>
    </div>,
    document.body
  );
};

export default BankReconciliationTableSection;
