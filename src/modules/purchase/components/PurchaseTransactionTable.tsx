import { useFieldArray, useFormContext } from 'react-hook-form';
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
  onOpenCurrencyPicker: (
    rowIndex: number,
    allowedCurrencyIds: string[]
  ) => void;
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

  return (
    <TransactionItemsFieldArray
      heading="Transaction Details"
      emptyMessage="No transaction rows found."
      addLabel="Add Row"
      data={fields}
      disabled={disabled}
      onAdd={() => append(createEmptyPurchaseTransactionRow())}
      renderRow={(_item, index) => (
        <PurchaseTransactionRowCell
          rowIndex={index}
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
      )}
    />
  );
};

export default PurchaseTransactionTable;
