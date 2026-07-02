import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button, CardSection } from '@/components/ui';
import type { IBuyFromFormValues, IBuyFromPricingData } from '../types/buyFromTypes';
import { createEmptyBuyFromTransactionRow } from '../utils/buyFromUtils';
import { BuyFromTransactionRow } from './BuyFromTransactionRow';

interface BuyFromTransactionTableProps {
  pricingData: IBuyFromPricingData;
  onOpenCurrencyPicker: (rowIndex: number) => void;
  disabled?: boolean;
}

export const BuyFromTransactionTable = ({
  pricingData,
  onOpenCurrencyPicker,
  disabled = false,
}: BuyFromTransactionTableProps) => {
  const form = useFormContext<IBuyFromFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'transactions',
  });

  return (
    <CardSection heading="Transaction Details">
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-sm border border-border-primary">
          <table className="min-w-full border-collapse">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="min-w-[260px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                  Currency
                </th>
                <th className="min-w-[260px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                  Product
                </th>
                <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                  Quantity
                </th>
                <th className="min-w-[160px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                  Fetch Rate
                </th>
                <th className="min-w-[160px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                  Total
                </th>
                <th className="w-[84px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <BuyFromTransactionRow
                  key={field.id}
                  index={index}
                  rowId={field.id}
                  pricingData={pricingData}
                  onOpenCurrencyPicker={onOpenCurrencyPicker}
                  onRemove={remove}
                  canRemove={fields.length > 1}
                  disabled={disabled}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => append(createEmptyBuyFromTransactionRow())}
          >
            Add Row
          </Button>
        </div>
      </div>
    </CardSection>
  );
};

export default BuyFromTransactionTable;
