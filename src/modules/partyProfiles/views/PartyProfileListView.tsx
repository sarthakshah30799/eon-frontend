import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { NotFoundState } from '@/components/ui/not-found-state';
import { useDebounce, usePermission } from '@/hooks';
import { PartyProfileTable } from '../components';
import {
  formatPartyProfileLabel,
  toPartyProfileApiType,
  toPartyProfileRouteType,
} from '../constants';
import { useListPartyProfiles, usePartyProfileTypes } from '../hooks';

export const PartyProfileListView = () => {
  const navigate = useNavigate();
  const { type: routeType } = useParams<{ type?: string }>();
  const page = 1;
  const pageSize = 10;
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data: typeOptions = [], isLoading: isTypesLoading } = usePartyProfileTypes();
  const routeOptions = useMemo(
    () =>
      typeOptions.map(option => ({
        value: toPartyProfileRouteType(option.value),
        label: option.label.toUpperCase(),
      })),
    [typeOptions]
  );

  const selectedType = useMemo(
    () =>
      routeType ? toPartyProfileRouteType(routeType) : routeOptions[0]?.value,
    [routeType, routeOptions]
  );

  const selectedApiType = useMemo(
    () => toPartyProfileApiType(selectedType),
    [selectedType]
  );
  const { canAdd } = usePermission(
    selectedType ? `/party-profiles/${selectedType}` : '/party-profiles'
  );
  const isInvalidTypeRoute = Boolean(routeType) && !routeOptions.some(option => option.value === selectedType);
  const canLoadList = Boolean(selectedApiType) && !isInvalidTypeRoute;

  useEffect(() => {
    if (!routeType && routeOptions[0]) {
      navigate(`/party-profiles/${routeOptions[0].value}`, { replace: true });
    }
  }, [navigate, routeOptions, routeType]);

  const query = useMemo(
    () => ({
      page,
      limit: pageSize,
      search: debouncedSearch.trim() || undefined,
      type: selectedApiType,
    }),
    [page, pageSize, debouncedSearch, selectedApiType]
  );

  const {
    data: clientResponse,
    isLoading,
    isFetching,
    error,
  } = useListPartyProfiles(query, selectedApiType, canLoadList);
  const clients = clientResponse?.data ?? [];

  if (isTypesLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profiles...
      </div>
    );
  }

  if (!routeOptions.length || isInvalidTypeRoute) {
    return (
      <NotFoundState
        message="You do not have access to this party profile type."
      />
    );
  }

  if (!selectedType) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profiles...
      </div>
    );
  }

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
              selectedType && navigate(`/party-profiles/${selectedType}/create`)
            }
          >
            {`Create ${formatPartyProfileLabel(selectedType)} Profile`}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <PartyProfileTable
          clients={clients}
          loading={isLoading || isFetching}
          selectedType={selectedType}
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder={`Search ${formatPartyProfileLabel(selectedType).toLowerCase()} code, name, city, pin code, or phone no`}
        />
      </section>
    </div>
  );
};

export default PartyProfileListView;
