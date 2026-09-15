import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { PaginationControls } from '@/components/ui';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import { MiscellaneousProfileTable } from '../components';

export const MiscellaneousProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );

  const {
    rows: groups,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['category-options', 'grouped'],
    queryFn: params => categoryOptionsApi.getCategoryOptionGroups(params),
    filters,
  });

  const handleSearch = (value: string) => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);
      if (value.trim()) {
        nextParams.set('search', value.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!nextParams.get('limit')) {
        nextParams.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return nextParams;
    });
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {CATEGORY_OPTIONS_TEXTS.LIST_LOAD_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/miscellaneous-profile/create')}
        >
          {CATEGORY_OPTIONS_TEXTS.CREATE_TITLE}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <MiscellaneousProfileTable
          groups={groups}
          loading={isLoading || isFetching}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder={CATEGORY_OPTIONS_TEXTS.LIST_SEARCH_PLACEHOLDER}
        />
        {totalPages > 0 ? (
          <div className="mt-3 border-t border-border-primary pt-3">
            <PaginationControls
              page={page}
              pageSize={limit}
              total={total}
              totalPages={totalPages}
              itemLabel={CATEGORY_OPTIONS_TEXTS.LIST_ITEM_LABEL}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default MiscellaneousProfileListView;
