import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { countryProfileApi } from '@/api/countryProfile';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import { CountryProfileTable } from '../components';

export const CountryProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/country-profile');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );

  const {
    rows: countries,
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
    queryKey: ['country-profiles'],
    queryFn: params => countryProfileApi.getCountryProfiles(params),
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
        {COUNTRY_PROFILE_TEXTS.LIST_ERROR}
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
            onClick={() => navigate('/admin/country-profile/create')}
          >
            {COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <CountryProfileTable
          countries={countries}
          loading={isLoading}
          isFetching={isFetching}
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search country code, name, group, or risk category"
        />
      </section>
    </div>
  );
};
