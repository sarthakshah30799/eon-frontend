import type { ReactNode } from 'react';
import type { TableColumnDef } from '@/components/ui';
import { Button, CardSection, Table } from '@/components/ui';

interface TransactionItemsFieldArrayBaseProps<TItem extends { id: string }> {
  heading: string;
  emptyMessage: string;
  addLabel: string;
  data: TItem[];
  disabled?: boolean;
  onAdd: () => void;
}

interface TransactionItemsFieldArrayColumnsProps<
  TItem extends { id: string },
> extends TransactionItemsFieldArrayBaseProps<TItem> {
  columns: TableColumnDef<{ id: string }>[];
  renderRow?: never;
}

interface TransactionItemsFieldArrayRenderRowProps<
  TItem extends { id: string },
> extends TransactionItemsFieldArrayBaseProps<TItem> {
  columns?: never;
  renderRow: (item: TItem, index: number) => ReactNode;
}

export type TransactionItemsFieldArrayProps<TItem extends { id: string }> =
  | TransactionItemsFieldArrayColumnsProps<TItem>
  | TransactionItemsFieldArrayRenderRowProps<TItem>;

export const TransactionItemsFieldArray = <TItem extends { id: string }>({
  heading,
  emptyMessage,
  addLabel,
  data,
  disabled = false,
  onAdd,
  ...rest
}: TransactionItemsFieldArrayProps<TItem>): ReactNode => {
  const renderRow =
    'renderRow' in rest && rest.renderRow ? rest.renderRow : undefined;
  const columns =
    'columns' in rest && rest.columns ? rest.columns : undefined;

  return (
    <CardSection heading={heading}>
      <div className="space-y-3">
        {renderRow ? (
          data.length > 0 ? (
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={item.id}>{renderRow(item, index)}</div>
              ))}
            </div>
          ) : (
            <p className="px-1 py-4 text-center text-sm text-text-tertiary">
              {emptyMessage}
            </p>
          )
        ) : (
          <Table
            columns={columns ?? []}
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
        )}

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
