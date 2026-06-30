import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, usePermission } from '@/hooks';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import { CountryProfileTable } from '../components';
import { useListCountryProfiles } from '../hooks';

export const CountryProfileListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/admin/country-profile');
  const [page] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
    }),
    [page, pageSize, debouncedSearch]
  );

  const {
    data: countryResponse,
    isLoading,
    isFetching,
    error,
  } = useListCountryProfiles(query);
  const countries = countryResponse?.data ?? [];

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {COUNTRY_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {canAdd && (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() =>
              navigate('/admin/country-profile/create')
            }
          >
            {COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CountryProfileTable
          countries={countries}
          loading={isLoading || isFetching}
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder="Search country code, name, group, or risk category"
        />
      </section>
    </div>
  );
};
