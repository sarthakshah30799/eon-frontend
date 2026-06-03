import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { PaginationControls } from '@/components/ui/pagination';
import { usePermission } from '@/hooks';
import { STATE_PROFILE_TEXTS } from '../constants';
import { StateProfileTable } from '../components';
import { useListStateProfiles } from '../hooks';
import { CountryDropdown } from '@/modules/dropdowns/countryDropdown';

export const StateProfileListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/master/system-setups/state-profile');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [countryId, setCountryId] = useState('');

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: search.trim() || undefined,
      countryId: countryId || undefined,
    }),
    [countryId, page, pageSize, search]
  );

  const { data: stateResponse, isLoading, error } = useListStateProfiles(query);
  const states = stateResponse?.data ?? [];
  const totalPages = stateResponse?.totalPages ?? 0;
  const totalItems = stateResponse?.totalItems ?? 0;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {STATE_PROFILE_TEXTS.LIST_ERROR}
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
              {STATE_PROFILE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {STATE_PROFILE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          {canAdd && (
            <Button
              type="button"
              className="rounded-sm"
              onClick={() =>
                navigate('/master/system-setups/state-profile/create')
              }
            >
              {STATE_PROFILE_TEXTS.CREATE_STATE}
            </Button>
          )}
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          <Input
            label="Search"
            placeholder="Search state code or name"
            value={search}
            onChange={event => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />

          <CountryDropdown
            value={countryId}
            onChange={nextValue => {
              setPage(1);
              setCountryId(nextValue);
            }}
            label="Country"
            placeholder="Filter by country"
          />

          <div className="flex items-end text-sm text-text-secondary">
            {totalItems} total records
          </div>
        </div>

        <StateProfileTable states={states} />

        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          itemLabel="states"
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
