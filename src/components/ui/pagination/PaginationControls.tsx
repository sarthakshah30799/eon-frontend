import { Button } from '../button1';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '@/constants/paginationConstants';

export interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

type PageItem = number | 'ellipsis';

const buildPageItems = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
};

export const PaginationControls = ({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [...PAGINATION_PAGE_SIZE_OPTIONS],
  itemLabel = 'records',
}: PaginationControlsProps) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const startItem = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(safePage * pageSize, total);
  const pageItems = buildPageItems(safePage, total === 0 ? 0 : safeTotalPages);

  return (
    <div className="flex min-w-0 w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 border-t border-border-primary bg-surface-primary py-2">
      <div className="min-w-0 shrink text-sm text-text-secondary">
        {total > 0
          ? `Showing ${startItem}-${endItem} of ${total} ${itemLabel}`
          : `No ${itemLabel} found`}
      </div>

      <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="px-2.5"
          disabled={page <= 1 || totalPages === 0}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>

        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-0.5 text-sm text-text-secondary"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === safePage ? 'default' : 'outline'}
              size="sm"
              className="min-w-8 px-2"
              aria-current={item === safePage ? 'page' : undefined}
              aria-label={`Page ${item}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="px-2.5"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>

        <label className="flex shrink-0 items-center gap-1.5 text-sm text-text-secondary">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={event => onPageSizeChange(Number(event.target.value))}
            className="rounded-sm border border-border-primary bg-surface-primary px-2 py-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {pageSizeOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};
