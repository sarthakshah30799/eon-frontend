import { useState } from 'react';
import { Button } from '../button1';
import { Modal } from '../modal';
import { Table, type TableColumnDef } from '../table';
import type {
  PaginationState,
  RowSelectionState,
} from '@tanstack/react-table';

interface SelectEntityProps<T extends { id: string }> {
  open: boolean;
  title: string;
  description?: string;
  columns: TableColumnDef<T>[];
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPaginationChange?: (pagination: PaginationState) => void;
  searchValue?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onContinue: (rows: T[]) => void;
  onClose: () => void;
  getRowId?: (row: T) => string;
  continueLabel?: string;
  cancelLabel?: string;
}

const EMPTY_ROW_SELECTION: RowSelectionState = {};

export const SelectEntity = <T extends { id: string }>({
  open,
  title,
  description,
  columns,
  data,
  loading = false,
  selectable = true,
  multiple = false,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions,
  onPaginationChange,
  searchValue = '',
  onSearch,
  searchPlaceholder = 'Search',
  emptyMessage = 'No records found.',
  onContinue,
  onClose,
  getRowId,
  continueLabel = 'Continue',
  cancelLabel = 'Cancel',
}: SelectEntityProps<T>) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    EMPTY_ROW_SELECTION
  );

  const handleClose = () => {
    setRowSelection(EMPTY_ROW_SELECTION);
    onClose();
  };

  const handleContinue = () => {
    onContinue(selectable ? selectedRows : data);
    setRowSelection(EMPTY_ROW_SELECTION);
  };

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([rowId]) => rowId);

  const selectedRows = data.filter(row => {
    return selectedIds.includes(getRowId?.(row) ?? row.id);
  });

  const handleRowSelectionChange = (nextSelection: RowSelectionState) => {
    if (multiple) {
      setRowSelection(nextSelection);
      return;
    }

    const selectedRowId = Object.entries(nextSelection)
      .filter(([, selected]) => selected)
      .map(([rowId]) => rowId)
      .at(-1);

    const resolvedSelection = selectedRowId ? { [selectedRowId]: true } : {};
    setRowSelection(resolvedSelection);
  };

  return (
    <Modal
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          handleClose();
        }
      }}
      title={title}
      description={description}
      size="xl"
    >
      <div className="space-y-5">
        <Table
        columns={columns}
        data={data}
        getRowId={getRowId}
        loading={loading}
        enableSorting={false}
        enableFiltering={false}
        enablePagination={enablePagination}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        enableRowSelection={selectable}
        rowSelection={rowSelection}
        onPaginationChange={onPaginationChange}
        onRowSelectionChange={handleRowSelectionChange}
          onSearch={onSearch}
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-text-secondary">
            {selectable
              ? `${selectedRows.length} selected`
              : 'Selection is disabled for this view'}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={handleClose}>
              {cancelLabel}
            </Button>
            <Button type="button" onClick={handleContinue}>
              {continueLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SelectEntity;
