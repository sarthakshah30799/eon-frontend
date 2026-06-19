import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { useDebounce, usePermission } from '@/hooks';
import {
  CorporateClientProfileTypeSelect,
  CorporateClientTable,
} from '../components';
import { useListCorporateClients } from '../hooks';
import {
  getCorporateClientProfileTypeConfig,
  normalizeCorporateClientProfileType,
} from '../constants';

export const CorporateClientListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/corporate-client-profile');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const selectedProfileType = normalizeCorporateClientProfileType(
    searchParams.get('type')
  );
  const selectedProfileTypeConfig =
    getCorporateClientProfileTypeConfig(selectedProfileType);

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
    }),
    [page, pageSize, debouncedSearch]
  );

  const {
    data: clientResponse,
    isLoading,
    isFetching,
    error,
  } = useListCorporateClients(query, selectedProfileType);
  const clients = clientResponse?.data ?? [];

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load Corporate Client Profiles. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex md:justify-end">
        {canAdd && (
          <Button
            type="button"
            className="rounded-sm md:self-end"
            onClick={() =>
              navigate({
                pathname: '/corporate-client-profile/create',
                search: `?type=${selectedProfileType}`,
              })
            }
          >
            {selectedProfileTypeConfig.createButtonLabel}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Input
            label="Search"
            placeholder="Search client code, name, or city"
            value={search}
            onChange={event => {
              setPage(1);
              setSearch(event.target.value);
            }}
            className="sm:max-w-md"
          />
          <CorporateClientProfileTypeSelect
            value={selectedProfileType}
            onChange={nextType => {
              setPage(1);
              setSearchParams({ type: nextType });
            }}
            label="Profile Type"
          />
        </div>

        <CorporateClientTable
          clients={clients}
          loading={isLoading || isFetching}
          profileType={selectedProfileType}
        />
      </section>
    </div>
  );
};

export default CorporateClientListView;
