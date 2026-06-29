import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState,
} from '@tanstack/react-table';
import { cva, type VariantProps } from 'class-variance-authority';
import { Button } from '../button1';
import { Input } from '../input';

interface TableColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
}

const tableVariants = cva('w-full border-collapse', {
  variants: {
    variant: {
      default: 'border-border-primary',
      striped: 'border-border-primary',
      bordered: 'border-border-secondary',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export type TableColumnDef<T extends object> = ColumnDef<T> & {
  searchable?: boolean;
  filterable?: boolean;
  meta?: TableColumnMeta;
};

export interface TableProps<T extends object>
  extends
    Omit<React.HTMLAttributes<HTMLTableElement>, 'children'>,
    VariantProps<typeof tableVariants> {
  columns: TableColumnDef<T>[];
  data: T[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  className?: string;
  onRowSelectionChange?: (selectedRows: RowSelectionState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  skeletonRows?: number;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
}

function Table<T extends object>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableColumnVisibility = false,
  pageSize = 10,
  className = '',
  variant,
  size,
  onRowSelectionChange,
  onSortingChange,
  onColumnFiltersChange,
  onPaginationChange,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  skeletonRows = 5,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
  ...props
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // TanStack Table returns functions that the React Compiler cannot safely memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: updater => {
      const newSorting =
        typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: updater => {
      const newFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
      onColumnFiltersChange?.(newFilters);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: updater => {
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);
      onRowSelectionChange?.(newSelection);
    },
    onPaginationChange: updater => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableSorting,
    enableColumnFilters: enableFiltering,
    enableRowSelection,
    manualPagination: false,
    pageCount: Math.ceil(data.length / pagination.pageSize),
  });

  const renderSkeleton = () =>
    Array.from({ length: skeletonRows }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        {columns.map((column, colIndex) => (
          <td
            key={`skeleton-cell-${colIndex}`}
            className={`border-b border-border-secondary px-4 py-3 ${(column.meta as TableColumnMeta | undefined)?.cellClassName ?? ''}`}
          >
            <div className="h-4 rounded bg-surface-secondary"></div>
          </td>
        ))}
      </tr>
    ));

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      {(onSearch || enableFiltering || enableColumnVisibility) && (
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {onSearch && (
            <div className="w-full sm:max-w-md">
              <Input
                label="Search"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={event => onSearch(event.target.value)}
                valueTransform="none"
              />
            </div>
          )}

          {enableFiltering && (
            <div className="flex flex-wrap gap-2">
              {table
                .getAllColumns()
                .filter(
                  column =>
                    column.getCanFilter() &&
                    column.id !== 'select' &&
                    column.id !== 'actions'
                )
                .map(column => (
                  <input
                    key={column.id}
                    type="text"
                    placeholder={`Filter ${column.columnDef.header?.toString() || column.id}...`}
                    value={(column.getFilterValue() as string) ?? ''}
                    onChange={e => column.setFilterValue(e.target.value)}
                    className="rounded-md border border-border-secondary px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ))}
            </div>
          )}

          {enableColumnVisibility && (
            <div className="flex gap-2">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={e => column.toggleVisibility(e.target.checked)}
                      className="rounded border-border-secondary text-primary-600 focus:ring-primary-500"
                    />
                    {column.id}
                  </label>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-border-primary">
        <table
          className={tableVariants({ variant, size, className })}
          {...props}
        >
          <thead className="bg-surface-secondary">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={`border-b border-border-primary px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary ${(header.column.columnDef.meta as TableColumnMeta | undefined)?.headerClassName ?? ''}`}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`${
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-text-primary'
                            : ''
                        } flex items-center gap-2`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {enableSorting && header.column.getCanSort() && (
                          <span className="text-text-tertiary">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '↕'}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border-primary bg-surface-primary">
            {loading ? (
              renderSkeleton()
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`${variant === 'striped' && index % 2 === 1 ? 'bg-surface-secondary' : ''} ${onRowClick ? 'cursor-pointer' : ''} hover:bg-surface-secondary`}
                onClick={(e) => {
                  e.preventDefault();
                  onRowClick?.(row.original);
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={`whitespace-nowrap px-4 py-3 text-sm text-text-primary ${(cell.column.columnDef.meta as TableColumnMeta | undefined)?.cellClassName ?? ''}`}
                  >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-text-tertiary"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-text-secondary">
            Showing {table.getRowModel().rows.length} of {data.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm text-text-secondary">Page</span>
              <strong className="text-sm">
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </strong>
            </div>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
            className="rounded-md border border-border-secondary px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Row Selection Info */}
      {enableRowSelection && Object.keys(rowSelection).length > 0 && (
        <div className="text-sm text-text-secondary">
          {Object.keys(rowSelection).length} row
          {Object.keys(rowSelection).length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

Table.displayName = 'Table';

export { Table };
