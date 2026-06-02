import { Button } from '../button1';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export const PaginationControls = ({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  itemLabel = 'records',
}: PaginationControlsProps) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-4 border-t border-border-primary pt-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-text-secondary">
        {totalItems > 0
          ? `Showing ${startItem}-${endItem} of ${totalItems} ${itemLabel}`
          : `No ${itemLabel} found`}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={page <= 1 || totalPages === 0}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>

        <div className="text-sm text-text-secondary">
          Page {totalItems === 0 ? 0 : safePage} of {safeTotalPages}
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={page >= totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={event => onPageSizeChange(Number(event.target.value))}
            className="rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
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
