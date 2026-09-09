import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { IPurchasePricingData } from '@/modules/purchase/types/purchaseTypes';
import type { ITransferFormValues } from '../types';
import { createEmptyTransferFormItem } from '../utils/transferFormUtils';
import { PurchaseTransactionRowCell } from '@/modules/purchase/components/PurchaseTransactionRowCell';
import { TransactionItemsFieldArray } from '@/components/forms/TransactionItemsFieldArray/TransactionItemsFieldArray';

interface TransferItemsFieldArrayProps {
  branchId: string;
  counterId: string;
  pricingData: IPurchasePricingData;
  onOpenCurrencyPicker: (
    rowIndex: number,
    allowedCurrencyIds: string[]
  ) => void;
  disabled?: boolean;
  rateEditable?: boolean;
}

export const TransferItemsFieldArray = ({
  branchId,
  counterId,
  pricingData,
  onOpenCurrencyPicker,
  disabled = false,
  rateEditable = false,
}: TransferItemsFieldArrayProps) => {
  const form = useFormContext<ITransferFormValues>();
  const watchedBranchId = useWatch({
    control: form.control,
    name: 'sourceBranchId',
  });
  const watchedCounterId = useWatch({
    control: form.control,
    name: 'sourceCounterId',
  });
  const resolvedBranchId = watchedBranchId || branchId;
  const resolvedCounterId = watchedCounterId || counterId;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <TransactionItemsFieldArray
      heading="Transfer Items"
      emptyMessage="No transfer items added yet."
      addLabel="Add Item"
      data={fields}
      disabled={disabled}
      onAdd={() => append(createEmptyTransferFormItem())}
      renderRow={(_item, index) => (
        <PurchaseTransactionRowCell
          rowIndex={index}
          fieldPrefix="items"
          branchId={resolvedBranchId}
          counterId={resolvedCounterId}
          pricingData={pricingData}
          onOpenCurrencyPicker={onOpenCurrencyPicker}
          disabled={disabled}
          canRemove={fields.length > 1}
          onRemove={remove}
          rateEditable={rateEditable}
          useCounterHoldCostRate
        />
      )}
    />
  );
};

export default TransferItemsFieldArray;
