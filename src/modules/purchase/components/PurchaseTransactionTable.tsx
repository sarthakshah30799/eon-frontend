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
  passengerId?: string;
  excludeTransactionId?: string;
  pricingData: IPurchasePricingData;
  agentCommissionRules?: IPartyProfileCommissionRule[];
  onOpenCurrencyPicker: (rowIndex: number) => void;
  disabled?: boolean;
  rateEditable?: boolean;
  useAverageSellRate?: boolean;
}

export const PurchaseTransactionTable = ({
  branchId = '',
  counterId = '',
  passengerId = '',
  excludeTransactionId,
  pricingData,
  agentCommissionRules = [],
  onOpenCurrencyPicker,
  disabled = false,
  rateEditable = true,
  useAverageSellRate = false,
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
            passengerId={passengerId}
            excludeTransactionId={excludeTransactionId}
            pricingData={pricingData}
            agentCommissionRules={agentCommissionRules}
            onOpenCurrencyPicker={onOpenCurrencyPicker}
            onRemove={remove}
            canRemove={fields.length > 1}
            disabled={disabled}
            rateEditable={rateEditable}
            useAverageSellRate={useAverageSellRate}
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
    passengerId,
    excludeTransactionId,
    disabled,
    fields.length,
    onOpenCurrencyPicker,
    pricingData,
    remove,
    rateEditable,
    useAverageSellRate,
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
