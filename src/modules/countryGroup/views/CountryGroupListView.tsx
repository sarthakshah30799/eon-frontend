import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { countryGroupApi } from '@/api/countryGroup';
import { COUNTRY_GROUP_TEXTS } from '../constants';
import { CountryGroupTable } from '../components';
import { useDeleteCountryGroup } from '../hooks';

export const CountryGroupListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd, canModify, canDelete } = usePermission(
    '/admin/country-group'
  );
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
    queryKey: ['country-groups'],
    queryFn: params => countryGroupApi.getCountryGroups(params),
    filters,
  });
  const { deleteCountryGroup, isPending: isDeleting } = useDeleteCountryGroup();

  const handleDelete = async (id: string) => {
    await deleteCountryGroup(id);
  };

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
        {COUNTRY_GROUP_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canAdd && (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate('/admin/country-group/create')}
          >
            {COUNTRY_GROUP_TEXTS.CREATE_BUTTON}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <CountryGroupTable
          groups={groups}
          canModify={canModify}
          canDelete={canDelete}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          loading={isLoading}
          isFetching={isFetching}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search country group code or name"
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>
    </div>
  );
};

export default CountryGroupListView;
