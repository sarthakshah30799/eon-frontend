import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, AsyncSelect, type AsyncSelectOption, type AsyncSelectResponse } from '@/components/ui';
import { NotFoundState } from '@/components/ui/not-found-state';
import { useDebounce, usePermission } from '@/hooks';
import { PartyProfileTable } from '../components';
import {
  formatPartyProfileLabel,
  toPartyProfileApiType,
  toPartyProfileRouteType,
} from '../constants';
import { useListPartyProfiles, usePartyProfileTypes } from '../hooks';
import type { PartyProfileType } from '../types/partyProfileTypes';
import { useListBranchProfiles } from '@/modules/branchProfile/hooks';
import { useAuth } from '@/lib/AuthContext';

export const PartyProfileListView = () => {
  const navigate = useNavigate();
  const { type: routeType } = useParams<{ type?: string }>();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = 1;
  const pageSize = 10;
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const [branchFilter, setBranchFilter] = useState('');
  const canSeeBranchFilter = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);

  const { data: typeOptions = [], isLoading: isTypesLoading } = usePartyProfileTypes();
  const { data: branches = [] } = useListBranchProfiles({ activeOnly: true });
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
  const isInvalidTypeRoute = Boolean(routeType) && !routeOptions.some(option => option.value === selectedType);
  const canLoadList = Boolean(selectedApiType) && !isInvalidTypeRoute;
  const branchOptions = useMemo<AsyncSelectOption[]>(
    () =>
      branches.map(branch => ({
        value: branch.id,
        label: `${branch.code} - ${branch.name}`,
      })),
    [branches]
  );
  const selectedBranchOption = useMemo<AsyncSelectOption | null>(
    () => branchOptions.find(option => option.value === branchFilter) ?? null,
    [branchFilter, branchOptions]
  );
  const loadBranchOptions = useMemo(
    () => async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? branchOptions.filter(option =>
            option.label.toLowerCase().includes(normalizedInput)
          )
        : branchOptions;

      return { options: filteredOptions };
    },
    [branchOptions]
  );

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
      activeOnly: false,
      type: selectedApiType,
      branchId: branchFilter || undefined,
    }),
    [branchFilter, debouncedSearch, page, pageSize, selectedApiType]
  );

  const {
    data: clientResponse,
    isLoading,
    isFetching,
    error,
  } = useListPartyProfiles(query, selectedApiType, canLoadList, false);
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

      {canSeeBranchFilter && (
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px] flex-1">
            <AsyncSelect
              label="Branch Filter"
              placeholder="All Branches"
              value={selectedBranchOption}
              loadOptions={loadBranchOptions}
              defaultOptions={branchOptions}
              isClearable
              onChange={option => {
                const selectedOption = Array.isArray(option)
                  ? (option[0] ?? null)
                  : option;
                setBranchFilter(selectedOption?.value ? String(selectedOption.value) : '');
              }}
            />
          </div>
        </div>
      )}

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <PartyProfileTable
          clients={clients}
          loading={isLoading || isFetching}
          selectedType={selectedType}
          onSearch={value =>
            setSearchParams(prev => {
              const nextParams = new URLSearchParams(prev);

              if (value.trim()) {
                nextParams.set('search', value.trim());
              } else {
                nextParams.delete('search');
              }

              return nextParams;
            })
          }
          searchValue={search}
          searchPlaceholder={`Search ${formatPartyProfileLabel(selectedType).toLowerCase()} code, name, city, pin code, or phone no`}
        />
      </section>
    </div>
  );
};

export default PartyProfileListView;
