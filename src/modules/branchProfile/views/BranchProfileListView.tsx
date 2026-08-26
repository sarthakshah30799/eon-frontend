import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { FunnelIcon } from '@/assets/icons';
import {
  AsyncSelect,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import { useDebounce } from '@/hooks';
import { useDeleteBranchProfile, useListBranchProfiles } from '../hooks';
import { useListStateProfiles } from '@/modules/stateProfile/hooks';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import { BranchProfileTable } from '../components';

export const BranchProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);

  // Filters from routes (as in previous pages with search + filter via URL) — no local form state
  const stateParam = searchParams.get('state') ?? '';
  const cityParam = searchParams.get('city') ?? '';
  const statusParam = searchParams.get('status') ?? ''; // "active" | "inactive" | ""

  const { data: stateResponse } = useListStateProfiles({ limit: 100 });
  const stateProfiles = stateResponse?.data ?? [];

  const stateOptions = useMemo<AsyncSelectOption[]>(() => {
    return stateProfiles
      .map(state => ({
        value: state.id,
        label: state.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [stateProfiles]);

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
    []
  );

  const selectedStateOption = useMemo<AsyncSelectOption | null>(
    () => stateOptions.find(option => option.label === stateParam) ?? null,
    [stateParam, stateOptions]
  );

  const selectedStatusOption = useMemo<AsyncSelectOption | null>(
    () =>
      statusOptions.find(option => option.value.toLowerCase() === statusParam) ??
      null,
    [statusParam, statusOptions]
  );

  const loadStateOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? stateOptions.filter(option =>
            option.label.toLowerCase().includes(normalizedInput)
          )
        : stateOptions;
      return { options: filteredOptions };
    },
    [stateOptions]
  );

  const loadStatusOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? statusOptions.filter(option =>
            option.label.toLowerCase().includes(normalizedInput)
          )
        : statusOptions;
      return { options: filteredOptions };
    },
    [statusOptions]
  );

  const query = useMemo(() => {
    const statusValue = statusParam ? statusParam.toLowerCase() : undefined; // "active" | "inactive"
    return {
      // Only keywords BE supports: city, state, status — e.g. GET /branches?city=Pune&state=Maharashtra&status=active
      // If status is undefined, no status filter is applied and BE returns both active/inactive
      search: debouncedSearch.trim() || undefined,
      city: cityParam || undefined,
      state: stateParam || undefined,
      status: statusValue,
    };
  }, [debouncedSearch, cityParam, stateParam, statusParam]);

  const {
    data: branches = [],
    isLoading,
    isFetching,
    error,
  } = useListBranchProfiles(query);

  // City options derived from current branches data — single API call on page load (no extra ?activeOnly=false)
  // Keeps single GET /branches without keywords on initial load; filters trigger GET /branches?city=...&state=...&status=...
  const cityOptions = useMemo<AsyncSelectOption[]>(() => {
    const cities = Array.from(
      new Set(
        branches
          .map(branch => branch.city?.trim())
          .filter((city): city is string => Boolean(city))
      )
    ).sort((a, b) => a.localeCompare(b));
    // Ensure selected city stays visible even if filtered branches don't contain it (e.g. after status filter)
    if (cityParam && !cities.includes(cityParam)) {
      cities.push(cityParam);
      cities.sort((a, b) => a.localeCompare(b));
    }
    return cities.map(city => ({ value: city, label: city }));
  }, [branches, cityParam]);

  const selectedCityOption = useMemo<AsyncSelectOption | null>(
    () => cityOptions.find(option => String(option.value) === cityParam) ?? null,
    [cityParam, cityOptions]
  );

  const loadCityOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedInput = inputValue.trim().toLowerCase();
      const filteredOptions = normalizedInput
        ? cityOptions.filter(option =>
            option.label.toLowerCase().includes(normalizedInput)
          )
        : cityOptions;
      return { options: filteredOptions };
    },
    [cityOptions]
  );
  const { deleteBranchProfile, isPending: isDeleting } =
    useDeleteBranchProfile();

  const handleDelete = async (id: string) => {
    await deleteBranchProfile(id);
  };

  const hasActiveFilters = Boolean(search || stateParam || cityParam || statusParam);

  const handleReset = useCallback(() => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);
      nextParams.delete('search');
      nextParams.delete('state');
      nextParams.delete('city');
      nextParams.delete('status');
      return nextParams;
    });
  }, [setSearchParams]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const nextParams = new URLSearchParams(prev);
        if (value.trim()) {
          nextParams.set('search', value.trim());
        } else {
          nextParams.delete('search');
        }
        return nextParams;
      });
    },
    [setSearchParams]
  );

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {BRANCH_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/branch-profile/create')}
        >
          {BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
        </Button>
      </div>

      {/* Filter bar — design like Image 1: search + 3 dropdowns + Reset, compact horizontal */}
      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <FunnelIcon className="shrink-0 text-slate-500" width={15} height={15} />

        <div className="w-full sm:w-[280px]">
          <Input
            placeholder="Search branch code, name, city, state, or country"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-40">
          <AsyncSelect
            placeholder="All States"
            value={selectedStateOption}
            loadOptions={loadStateOptions}
            defaultOptions={stateOptions}
            onChange={option => {
              const selectedOption = Array.isArray(option)
                ? (option[0] ?? null)
                : option;
              setSearchParams(prev => {
                const nextParams = new URLSearchParams(prev);
                if (selectedOption?.label) {
                  nextParams.set('state', selectedOption.label);
                } else {
                  nextParams.delete('state');
                }
                return nextParams;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        <div className="w-full sm:w-40">
          <AsyncSelect
            placeholder="All Cities"
            value={selectedCityOption}
            loadOptions={loadCityOptions}
            defaultOptions={cityOptions}
            onChange={option => {
              const selectedOption = Array.isArray(option)
                ? (option[0] ?? null)
                : option;
              setSearchParams(prev => {
                const nextParams = new URLSearchParams(prev);
                if (selectedOption?.value) {
                  nextParams.set('city', String(selectedOption.value));
                } else {
                  nextParams.delete('city');
                }
                return nextParams;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        <div className="w-full sm:w-40">
          <AsyncSelect
            placeholder="All Statuses"
            value={selectedStatusOption}
            loadOptions={loadStatusOptions}
            defaultOptions={statusOptions}
            onChange={option => {
              const selectedOption = Array.isArray(option)
                ? (option[0] ?? null)
                : option;
              setSearchParams(prev => {
                const nextParams = new URLSearchParams(prev);
                if (selectedOption?.value) {
                  nextParams.set('status', String(selectedOption.value).toLowerCase());
                } else {
                  nextParams.delete('status');
                }
                return nextParams;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <span className="text-base leading-none">×</span> Reset
          </button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <BranchProfileTable
          branches={branches}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};
