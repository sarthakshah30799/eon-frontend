import { useState, type ReactNode } from 'react';
import { Button } from '../button1';
import { Modal } from '../modal';
import { Table, type TableColumnDef } from '../table';
import type { PaginationState, RowSelectionState } from '@tanstack/react-table';

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
  selectedRowIds?: string[];
  selectedRows?: T[];
  onSelectedRowIdsChange?: (rowIds: string[]) => void;
  selectedSummary?: ReactNode;
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
  selectedRowIds,
  selectedRows: selectedRowsOverride,
  onSelectedRowIdsChange,
  selectedSummary,
  onClose,
  getRowId = (row: T) => row.id,
  continueLabel = 'Continue',
  cancelLabel = 'Cancel',
}: SelectEntityProps<T>) => {
  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>(EMPTY_ROW_SELECTION);

  const displayedRowSelection = selectedRowIds
    ? Object.fromEntries(selectedRowIds.map(rowId => [rowId, true]))
    : rowSelection;

  const handleClose = () => {
    setRowSelection(EMPTY_ROW_SELECTION);
    onClose();
  };

  const handleContinue = () => {
    if (!selectable) {
      onContinue(data);
    } else if (selectedRowsOverride) {
      const selectedById = new Map(
        selectedRowsOverride.map(row => [getRowId?.(row) ?? row.id, row])
      );
      data.forEach(row => {
        const rowId = getRowId?.(row) ?? row.id;
        if (selectedIds.includes(rowId)) {
          selectedById.set(rowId, row);
        }
      });
      onContinue([...selectedById.values()]);
    } else {
      onContinue(selectedRows);
    }
    setRowSelection(EMPTY_ROW_SELECTION);
  };

  const selectedIds = Object.entries(displayedRowSelection)
    .filter(([, selected]) => selected)
    .map(([rowId]) => rowId);

  const selectedRows = data.filter(row => {
    return selectedIds.includes(getRowId?.(row) ?? row.id);
  });

  const handleRowSelectionChange = (nextSelection: RowSelectionState) => {
    const currentPageIds = new Set(data.map(row => getRowId?.(row) ?? row.id));
    const retainedIds = (selectedRowIds ?? []).filter(
      rowId => !currentPageIds.has(rowId)
    );
    const nextPageIds = Object.entries(nextSelection)
      .filter(([, selected]) => selected)
      .map(([rowId]) => rowId);

    if (multiple) {
      setRowSelection(nextSelection);
      onSelectedRowIdsChange?.([...new Set([...retainedIds, ...nextPageIds])]);
      return;
    }

    const selectedRowId = Object.entries(nextSelection)
      .filter(([, selected]) => selected)
      .map(([rowId]) => rowId)
      .at(-1);

    const resolvedSelection = selectedRowId ? { [selectedRowId]: true } : {};
    setRowSelection(resolvedSelection);
    onSelectedRowIdsChange?.(
      selectedRowId
        ? [...new Set([...retainedIds, selectedRowId])]
        : retainedIds
    );
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
      footer={
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
      }
    >
      <div className="space-y-5">
        {selectedSummary}
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
          rowSelection={displayedRowSelection}
          onPaginationChange={onPaginationChange}
          onRowSelectionChange={handleRowSelectionChange}
          onSearch={onSearch}
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
        />
      </div>
    </Modal>
  );
};

export default SelectEntity;
