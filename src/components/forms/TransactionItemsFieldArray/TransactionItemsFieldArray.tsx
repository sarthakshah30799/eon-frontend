import type { ReactNode } from 'react';
import type { TableColumnDef } from '@/components/ui';
import { Button, CardSection, Table } from '@/components/ui';

interface TransactionItemsFieldArrayProps<TItem extends { id: string }> {
  heading: string;
  emptyMessage: string;
  addLabel: string;
  data: TItem[];
  columns: TableColumnDef<{ id: string }>[];
  disabled?: boolean;
  onAdd: () => void;
}

export const TransactionItemsFieldArray = <TItem extends { id: string }>({
  heading,
  emptyMessage,
  addLabel,
  data,
  columns,
  disabled = false,
  onAdd,
}: TransactionItemsFieldArrayProps<TItem>): ReactNode => {
  return (
    <CardSection heading={heading}>
      <div className="space-y-3">
        <Table
          columns={columns}
          data={data}
          enableSorting={false}
          enableFiltering={false}
          enablePagination={false}
          enableRowSelection={false}
          enableColumnVisibility={false}
          loading={false}
          className="table-fixed"
          emptyMessage={emptyMessage}
          getRowId={row => row.id}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={onAdd}
          >
            {addLabel}
          </Button>
        </div>
      </div>
    </CardSection>
  );
};

export default TransactionItemsFieldArray;
