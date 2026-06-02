import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { PaginationControls } from '@/components/ui/pagination';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import { CountryProfileTable } from '../components';
import { useListCountryProfiles } from '../hooks';

export const CountryProfileListView = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: search.trim() || undefined,
    }),
    [page, pageSize, search]
  );

  const { data: countryResponse, isLoading, error } =
    useListCountryProfiles(query);
  const countries = countryResponse?.data ?? [];
  const totalPages = countryResponse?.totalPages ?? 0;
  const totalItems = countryResponse?.totalItems ?? 0;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {COUNTRY_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              System Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {COUNTRY_PROFILE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {COUNTRY_PROFILE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            className="rounded-sm"
            onClick={() =>
              navigate('/master/system-setups/country-profile/create')
            }
          >
            {COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Input
            label="Search"
            placeholder="Search country code or name"
            value={search}
            onChange={event => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="sm:max-w-md"
          />
          <div className="text-sm text-text-secondary">{totalItems} total records</div>
        </div>

        <CountryProfileTable countries={countries} />

        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          itemLabel="countries"
          onPageChange={setPage}
          onPageSizeChange={nextPageSize => {
            setPage(1);
            setPageSize(nextPageSize);
          }}
        />
      </section>
    </div>
  );
};
