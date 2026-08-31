import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { Loader } from '../loader';
import { PaginationControls } from '../pagination';
import { TableToolbar } from './TableToolbar';
import type { TableToolbarFilter } from './tableToolbar.types';
import { buildSearchToolbarFilter } from './tableToolbarPresets';
import {
  PAGINATION_DEFAULTS,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from '@/constants/paginationConstants';

interface TableColumnMeta {
  headerClassName?: string;
  cellClassName?: string;
}

const LAYOUT_FOOTER_INSET_PX = 16;
const MIN_FITTED_HEIGHT_PX = 240;

const getScrollParent = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;

  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
};

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
  /** When true, parent owns page/totals (server-side). Table does not slice `data`. */
  manualPagination?: boolean;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  /** 1-based page. Used when `manualPagination` is true. */
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  total?: number;
  totalPages?: number;
  paginationItemLabel?: string;
  className?: string;
  onRowSelectionChange?: (selectedRows: RowSelectionState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  /** Background refetch (page/size/filter). Keeps rows visible with an overlay. */
  isFetching?: boolean;
  skeletonRows?: number;
  onSearch?: (value: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  /** Unified toolbar filters rendered in one wrap row above the grid. */
  toolbarFilters?: TableToolbarFilter[];
  rowSelection?: RowSelectionState;
  getRowId?: (originalRow: T, index: number, parent?: unknown) => string;
}

function Table<T extends object>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  manualPagination = false,
  enableRowSelection = false,
  enableColumnVisibility = false,
  page = 1,
  pageSize = PAGINATION_DEFAULTS.LIMIT,
  pageSizeOptions = [...PAGINATION_PAGE_SIZE_OPTIONS, 250, 500, 1000],
  total,
  totalPages,
  paginationItemLabel = 'results',
  className = '',
  variant,
  size,
  onRowSelectionChange,
  onSortingChange,
  onColumnFiltersChange,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  isFetching = false,
  skeletonRows = 5,
  onSearch,
  searchValue = '',
  searchPlaceholder = 'Search',
  toolbarFilters,
  rowSelection: rowSelectionProp,
  getRowId,
  ...props
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize,
    }
  );
  const pagination: PaginationState = manualPagination
    ? {
        pageIndex: Math.max(page - 1, 0),
        pageSize,
      }
    : internalPagination;
  const rowSelection = rowSelectionProp ?? internalRowSelection;
  const rootRef = useRef<HTMLDivElement>(null);
  const [fittedMaxHeight, setFittedMaxHeight] = useState<number>();

  const resolvedToolbarFilters = useMemo(() => {
    const filters: TableToolbarFilter[] = [];

    if (onSearch) {
      filters.push(
        buildSearchToolbarFilter({
          value: searchValue,
          onChange: onSearch,
          placeholder: searchPlaceholder,
        })
      );
    }

    if (toolbarFilters?.length) {
      filters.push(...toolbarFilters);
    }

    return filters;
  }, [onSearch, searchPlaceholder, searchValue, toolbarFilters]);

  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const scrollParent = getScrollParent(node);
    const observed: HTMLElement[] = [];
    let ancestor: HTMLElement | null = node;

    while (ancestor) {
      observed.push(ancestor);
      if (ancestor === scrollParent) break;
      ancestor = ancestor.parentElement;
    }

    const updateFittedMaxHeight = () => {
      const top = node.getBoundingClientRect().top;
      const parentBottom = scrollParent
        ? scrollParent.getBoundingClientRect().bottom
        : window.innerHeight;
      const parentPaddingBottom = node.parentElement
        ? Number.parseFloat(
            window.getComputedStyle(node.parentElement).paddingBottom
          ) || 0
        : 0;
      const footerInset =
        !scrollParent || scrollParent.tagName === 'MAIN'
          ? LAYOUT_FOOTER_INSET_PX
          : 0;

      setFittedMaxHeight(
        Math.max(
          MIN_FITTED_HEIGHT_PX,
          Math.floor(
            parentBottom - footerInset - parentPaddingBottom - top
          )
        )
      );
    };

    updateFittedMaxHeight();

    const resizeObserver = new ResizeObserver(updateFittedMaxHeight);
    observed.forEach(element => resizeObserver.observe(element));

    scrollParent?.addEventListener('scroll', updateFittedMaxHeight, {
      passive: true,
    });
    window.addEventListener('resize', updateFittedMaxHeight);

    return () => {
      resizeObserver.disconnect();
      scrollParent?.removeEventListener('scroll', updateFittedMaxHeight);
      window.removeEventListener('resize', updateFittedMaxHeight);
    };
  }, [data.length, enablePagination, loading, resolvedToolbarFilters.length]);

  // TanStack Table returns functions that the React Compiler cannot safely memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enablePagination && !manualPagination
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
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
      if (rowSelectionProp === undefined) {
        setInternalRowSelection(newSelection);
      }
      onRowSelectionChange?.(newSelection);
    },
    onPaginationChange: updater => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      if (!manualPagination) {
        setInternalPagination(newPagination);
      }
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
    enableHiding: enableColumnVisibility,
    enableRowSelection,
    manualPagination,
    pageCount: enablePagination
      ? manualPagination
        ? (totalPages ?? 0)
        : Math.ceil(data.length / pagination.pageSize)
      : undefined,
    getRowId,
  });

  const renderSkeleton = () =>
    Array.from({ length: skeletonRows }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        {columns.map((column, colIndex) => (
          <td
            key={`skeleton-cell-${colIndex}`}
            className={`border-b border-border-secondary px-4 py-2 ${(column.meta as TableColumnMeta | undefined)?.cellClassName ?? ''}`}
          >
            <div className="h-4 rounded bg-surface-secondary"></div>
          </td>
        ))}
      </tr>
    ));

  return (
    <div
      ref={rootRef}
      className="flex min-h-0 flex-col gap-2 overflow-hidden"
      style={fittedMaxHeight ? { maxHeight: fittedMaxHeight } : undefined}
    >
      <TableToolbar filters={resolvedToolbarFilters} />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto rounded-sm border border-border-primary">
        <table
          className={tableVariants({ variant, size, className })}
          {...props}
        >
          <thead className="sticky top-0 z-10 bg-surface-secondary">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={`border-b border-border-primary bg-surface-secondary px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary ${(header.column.columnDef.meta as TableColumnMeta | undefined)?.headerClassName ?? ''}`}
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
                  onClick={
                    onRowClick
                      ? () => {
                          onRowClick(row.original);
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className={`whitespace-nowrap px-4 py-2 text-sm text-text-primary ${(cell.column.columnDef.meta as TableColumnMeta | undefined)?.cellClassName ?? ''}`}
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

      {enablePagination && (
        <div className="sticky bottom-0 z-20 min-w-0 shrink-0 bg-surface-primary">
          <PaginationControls
            page={
              manualPagination
                ? page
                : table.getState().pagination.pageIndex + 1
            }
            pageSize={
              manualPagination
                ? pageSize
                : table.getState().pagination.pageSize
            }
            total={
              manualPagination
                ? (total ?? 0)
                : table.getFilteredRowModel().rows.length
            }
            totalPages={
              manualPagination ? (totalPages ?? 0) : table.getPageCount()
            }
            onPageChange={nextPage => {
              if (manualPagination) {
                onPageChange?.(nextPage);
                return;
              }
              table.setPageIndex(nextPage - 1);
            }}
            onPageSizeChange={nextPageSize => {
              if (manualPagination) {
                onPageSizeChange?.(nextPageSize);
                return;
              }
              table.setPageSize(nextPageSize);
            }}
            pageSizeOptions={pageSizeOptions}
            itemLabel={paginationItemLabel}
          />
        </div>
      )}

      {isFetching && !loading ? (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-surface-primary/70"
          aria-busy="true"
          aria-live="polite"
        >
          <Loader variant="inline" size="sm" />
        </div>
      ) : null}
      </div>

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
