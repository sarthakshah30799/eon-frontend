import type {
  IBankReconciliationEditableRow,
  IBankReconciliationRow,
} from './types';

export const rowKey = (row: Pick<IBankReconciliationRow, 'sourceType' | 'sourceId'>) =>
  `${row.sourceType}:${row.sourceId}`;

export const toEditableRow = (
  row: IBankReconciliationRow
): IBankReconciliationEditableRow => ({
  ...row,
  selected: false,
  editBankDate: row.bankDate ?? '',
  editRemarks: row.reconciliationRemarks ?? '',
  editDishonored: Boolean(row.isDishonored),
  editReversalNumber: row.reversalNumber ?? '',
});
