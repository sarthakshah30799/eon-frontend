import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { useDebounce, usePermission } from '@/hooks';
import {
  PartyProfileTypeSelect,
  PartyProfileTable,
} from '../components';
import { DEFAULT_PARTY_PROFILE_TYPE } from '../constants';
import { useListPartyProfiles, usePartyProfileTypes } from '../hooks';

export const PartyProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/party-profiles');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const selectedType = searchParams.get('type') || DEFAULT_PARTY_PROFILE_TYPE;
  const { data: typeOptions = [] } = usePartyProfileTypes();

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      type: selectedType,
    }),
    [page, pageSize, debouncedSearch, selectedType]
  );

  const {
    data: clientResponse,
    isLoading,
    isFetching,
    error,
  } = useListPartyProfiles(query);
  const clients = clientResponse?.data ?? [];

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load Party Profiles. Please try again.
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
                pathname: '/party-profiles/create',
              search: `?type=${selectedType}`,
            })
          }
          >
            Create Party Profile
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
          {typeOptions.length > 0 && (
            <PartyProfileTypeSelect
              value={selectedType}
              onChange={nextType => {
                setPage(1);
                setSearchParams({ type: nextType });
              }}
              options={typeOptions}
              label="Profile Type"
            />
          )}
        </div>

        <PartyProfileTable
          clients={clients}
          loading={isLoading || isFetching}
          selectedType={selectedType}
        />
      </section>
    </div>
  );
};

export default PartyProfileListView;
