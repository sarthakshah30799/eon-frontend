import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { TableColumnDef } from '@/components/ui';
import type {
  IPurchaseFormValues,
  IPurchasePricingData,
} from '../types/purchaseTypes';
import { createEmptyPurchaseTransactionRow } from '../utils/purchaseUtils';
import { PurchaseTransactionRowCell } from './PurchaseTransactionRowCell';
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';
import { TransactionItemsFieldArray } from '@/components/forms/TransactionItemsFieldArray/TransactionItemsFieldArray';

interface PurchaseTransactionTableProps {
  branchId?: string;
  counterId?: string;
  excludeTransactionId?: string;
  pricingData: IPurchasePricingData;
  agentCommissionRules?: IPartyProfileCommissionRule[];
  onOpenCurrencyPicker: (rowIndex: number) => void;
  disabled?: boolean;
}

export const PurchaseTransactionTable = ({
  branchId = '',
  counterId = '',
  excludeTransactionId,
  pricingData,
  agentCommissionRules = [],
  onOpenCurrencyPicker,
  disabled = false,
}: PurchaseTransactionTableProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactions',
  });

  const columns = useMemo<TableColumnDef<{ id: string }>[]>(() => {
    return [
      {
        id: 'row',
        header: () => null,
        cell: ({ row }) => (
          <PurchaseTransactionRowCell
            rowIndex={row.index}
            branchId={branchId}
            counterId={counterId}
            excludeTransactionId={excludeTransactionId}
            pricingData={pricingData}
            agentCommissionRules={agentCommissionRules}
            onOpenCurrencyPicker={onOpenCurrencyPicker}
            onRemove={remove}
            canRemove={fields.length > 1}
            disabled={disabled}
          />
        ),
        meta: {
          headerClassName: 'hidden',
          cellClassName: '!px-1 !py-1',
        },
      },
    ];
  }, [
    agentCommissionRules,
    branchId,
    counterId,
    excludeTransactionId,
    disabled,
    fields.length,
    onOpenCurrencyPicker,
    pricingData,
    remove,
  ]);

  return (
    <TransactionItemsFieldArray
      heading="Transaction Details"
      emptyMessage="No transaction rows found."
      addLabel="Add Row"
      data={fields}
      columns={columns}
      disabled={disabled}
      onAdd={() => append(createEmptyPurchaseTransactionRow())}
    />
  );
};

export default PurchaseTransactionTable;
