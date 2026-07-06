import { useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import type { TableColumnDef } from '@/components/ui';
import { Button, CardSection, Table } from '@/components/ui';
import type {
  IPurchaseFormValues,
  IPurchasePricingData,
} from '../types/purchaseTypes';
import { createEmptyPurchaseTransactionRow } from '../utils/purchaseUtils';
import { PurchaseTransactionRowCell } from './PurchaseTransactionRowCell';
import type { IPartyProfileCommissionRule } from '@/modules/partyProfiles/types';

interface PurchaseTransactionTableProps {
  pricingData: IPurchasePricingData;
  agentCommissionRules?: IPartyProfileCommissionRule[];
  onOpenCurrencyPicker: (rowIndex: number) => void;
  disabled?: boolean;
}

export const PurchaseTransactionTable = ({
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
    disabled,
    fields.length,
    onOpenCurrencyPicker,
    pricingData,
    remove,
  ]);

  return (
    <CardSection heading="Transaction Details">
      <div className="space-y-3">
        <Table
          columns={columns}
          data={fields}
          enableSorting={false}
          enableFiltering={false}
          enablePagination={false}
          enableRowSelection={false}
          enableColumnVisibility={false}
          loading={false}
          className="table-fixed"
          emptyMessage="No transaction rows found."
          getRowId={row => row.id}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => append(createEmptyPurchaseTransactionRow())}
          >
            Add Row
          </Button>
        </div>
      </div>
    </CardSection>
  );
};

export default PurchaseTransactionTable;
