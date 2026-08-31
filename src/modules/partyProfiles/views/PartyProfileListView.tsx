import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Button,
  type AsyncSelectOption,
} from '@/components/ui';
import {
  buildBranchToolbarFilter,
  buildSearchToolbarFilter,
} from '@/components/ui/table';
import { NotFoundState } from '@/components/ui/not-found-state';
import { AccessDeniedState } from '@/components/ui/access-denied-state';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { partyProfileApi } from '@/api/partyProfile';
import { PartyProfileTable } from '../components';
import {
  formatPartyProfileLabel,
  toPartyProfileApiType,
  toPartyProfileRouteType,
  PARTY_PROFILE_STATUS_TEXT,
} from '../constants';
import { usePartyProfileTypes } from '../hooks';
import type { PartyProfileType } from '../types/partyProfileTypes';
import { useLoadBranchOptions } from '@/modules/branchProfile/hooks';
import { useAuth } from '@/lib/AuthContext';

export const PartyProfileListView = () => {
  const navigate = useNavigate();
  const { type: routeType } = useParams<{ type?: string }>();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const [branchFilter, setBranchFilter] = useState('');
  const canSeeBranchFilter = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );

  const { data: typeOptions = [], isLoading: isTypesLoading } =
    usePartyProfileTypes();
  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const [selectedBranchOption, setSelectedBranchOption] =
    useState<AsyncSelectOption | null>(null);
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
    () => toPartyProfileApiType(selectedType) as PartyProfileType,
    [selectedType]
  );
  const { canAdd } = usePermission(
    selectedType ? `/party-profiles/${selectedType}` : '/party-profiles'
  );
  const isInvalidTypeRoute =
    Boolean(routeType) &&
    !routeOptions.some(option => option.value === selectedType);
  const canLoadList = Boolean(selectedApiType) && !isInvalidTypeRoute;

  useEffect(() => {
    if (!routeType && routeOptions[0]) {
      navigate(`/party-profiles/${routeOptions[0].value}`, { replace: true });
    }
  }, [navigate, routeOptions, routeType]);

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      activeOnly: false as const,
      type: selectedApiType,
      branchId: branchFilter || undefined,
    }),
    [branchFilter, debouncedSearch, selectedApiType]
  );

  const {
    rows: clients,
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
    queryKey: ['party-profiles', selectedApiType],
    queryFn: params =>
      partyProfileApi.getPartyProfiles(params, selectedApiType),
    filters,
    enabled: canLoadList,
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

  const handleBranchFilterChange = useCallback(
    (branchId: string) => {
      setBranchFilter(branchId);
      setSearchParams(prev => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
        return nextParams;
      });
    },
    [setSearchParams]
  );

  const toolbarFilters = useMemo(
    () => [
      buildSearchToolbarFilter({
        value: search,
        onChange: handleSearch,
        placeholder: `Search ${formatPartyProfileLabel(selectedType).toLowerCase()} code, name, city, pin code, or phone no`,
      }),
      buildBranchToolbarFilter({
        visible: canSeeBranchFilter,
        value: selectedBranchOption,
        loadOptions: loadBranchOptions,
        onChange: option => {
          setSelectedBranchOption(option);
          handleBranchFilterChange(option?.value ? String(option.value) : '');
        },
      }),
    ],
    [
      canSeeBranchFilter,
      handleBranchFilterChange,
      handleSearch,
      loadBranchOptions,
      search,
      selectedBranchOption,
      selectedType,
    ]
  );

  if (isTypesLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading party profiles...
      </div>
    );
  }

  if (isInvalidTypeRoute) {
    return <NotFoundState message={PARTY_PROFILE_STATUS_TEXT.typeNotFound} />;
  }

  if (!routeOptions.length) {
    return (
      <AccessDeniedState message={PARTY_PROFILE_STATUS_TEXT.accessDeniedType} />
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
    <div className="space-y-3">
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

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <PartyProfileTable
          clients={clients}
          loading={isLoading}
          isFetching={isFetching}
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          selectedType={selectedType}
          toolbarFilters={toolbarFilters}
        />
      </section>
    </div>
  );
};

export default PartyProfileListView;
