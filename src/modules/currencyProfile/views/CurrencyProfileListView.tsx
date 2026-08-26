import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button1';
import { Input } from '@/components/ui/input';
import { FunnelIcon } from '@/assets/icons';
import {
  AsyncSelect,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import { useDebounce } from '@/hooks';
import { CURRENCY_PROFILE_TEXTS, CURRENCY_GROUP_OPTIONS } from '../constants';
import { CurrencyProfileTable } from '../components';
import { useListCurrencyProfiles } from '../hooks';
import { useListCountryProfiles } from '@/modules/countryProfile/hooks';
import { currencyRatesApi } from '@/api/currencyRates';

export const CurrencyProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);

  // Filters from routes — same pattern as BranchProfileListView
  const countryParam = searchParams.get('country') ?? '';
  const groupParam = searchParams.get('group') ?? '';
  const pricingGroupParam = searchParams.get('pricingGroup') ?? '';
  const statusParam = searchParams.get('status') ?? ''; // "active" | "inactive"

  const { data: countryResponse } = useListCountryProfiles({ limit: 100 });
  const countries = countryResponse?.data ?? [];

  const { data: pricingGroups = [] } = useQuery({
    queryKey: ['currency-pricing-groups-list'],
    queryFn: () => currencyRatesApi.getGroups(),
  });

  const countryOptions = useMemo<AsyncSelectOption[]>(() => {
    return countries
      .map(c => ({
        value: c.name,
        label: c.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [countries]);

  const groupOptions = useMemo<AsyncSelectOption[]>(() => CURRENCY_GROUP_OPTIONS, []);

  const pricingGroupOptions = useMemo<AsyncSelectOption[]>(() => {
    return pricingGroups
      .map(g => ({
        value: g.id,
        label: `${g.code} - ${g.name}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [pricingGroups]);

  const statusOptions = useMemo<AsyncSelectOption[]>(
    () => [
      { value: 'Active', label: 'Active' },
      { value: 'Inactive', label: 'Inactive' },
    ],
    []
  );

  const selectedCountryOption = useMemo<AsyncSelectOption | null>(
    () => countryOptions.find(o => o.label === countryParam || String(o.value) === countryParam) ?? null,
    [countryParam, countryOptions]
  );

  const selectedGroupOption = useMemo<AsyncSelectOption | null>(
    () => groupOptions.find(o => o.value === groupParam) ?? null,
    [groupParam, groupOptions]
  );

  const selectedPricingGroupOption = useMemo<AsyncSelectOption | null>(
    () => pricingGroupOptions.find(o => String(o.value) === pricingGroupParam || o.label === pricingGroupParam) ?? null,
    [pricingGroupParam, pricingGroupOptions]
  );

  const selectedStatusOption = useMemo<AsyncSelectOption | null>(
    () => statusOptions.find(o => o.value.toLowerCase() === statusParam) ?? null,
    [statusParam, statusOptions]
  );

  const loadCountryOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? countryOptions.filter(o => o.label.toLowerCase().includes(q)) : countryOptions;
      return { options: filtered };
    },
    [countryOptions]
  );

  const loadGroupOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? groupOptions.filter(o => o.label.toLowerCase().includes(q)) : groupOptions;
      return { options: filtered };
    },
    [groupOptions]
  );

  const loadPricingGroupOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? pricingGroupOptions.filter(o => o.label.toLowerCase().includes(q)) : pricingGroupOptions;
      return { options: filtered };
    },
    [pricingGroupOptions]
  );

  const loadStatusOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const q = inputValue.trim().toLowerCase();
      const filtered = q ? statusOptions.filter(o => o.label.toLowerCase().includes(q)) : statusOptions;
      return { options: filtered };
    },
    [statusOptions]
  );

  const query = useMemo(() => {
    return {
      search: debouncedSearch.trim() || undefined,
      country: countryParam || undefined,
      group: groupParam || undefined,
      pricingGroup: pricingGroupParam || undefined,
      pricingGroupId: pricingGroupParam || undefined,
      status: statusParam ? statusParam.toLowerCase() : undefined,
    };
  }, [debouncedSearch, countryParam, groupParam, pricingGroupParam, statusParam]);

  const { data: currencies = [], isLoading, isFetching, error } = useListCurrencyProfiles(query);

  const hasActiveFilters = Boolean(search || countryParam || groupParam || pricingGroupParam || statusParam);

  const handleReset = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('search');
      next.delete('country');
      next.delete('group');
      next.delete('pricingGroup');
      next.delete('pricingGroupId');
      next.delete('status');
      return next;
    });
  }, [setSearchParams]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (value.trim()) next.set('search', value.trim());
        else next.delete('search');
        return next;
      });
    },
    [setSearchParams]
  );

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {CURRENCY_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/currency-profile/create')}
        >
          {CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY}
        </Button>
      </div>

      {/* Filter bar — increased size for this page only so filters stay on one line */}
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto rounded-sm border border-slate-200 bg-white px-3 py-3 shadow-sm">
        <FunnelIcon className="shrink-0 text-slate-500" width={15} height={15} />

        <div className="shrink-0 w-[240px]">
          <Input
            placeholder="Search currency code, name, or country"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="shrink-0 w-40">
          <AsyncSelect
            placeholder="All Countries"
            value={selectedCountryOption}
            loadOptions={loadCountryOptions}
            defaultOptions={countryOptions}
            onChange={option => {
              const opt = Array.isArray(option) ? (option[0] ?? null) : option;
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (opt?.label) next.set('country', opt.label);
                else next.delete('country');
                return next;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        <div className="shrink-0 w-36">
          <AsyncSelect
            placeholder="All Groups"
            value={selectedGroupOption}
            loadOptions={loadGroupOptions}
            defaultOptions={groupOptions}
            onChange={option => {
              const opt = Array.isArray(option) ? (option[0] ?? null) : option;
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (opt?.value) next.set('group', String(opt.value));
                else next.delete('group');
                return next;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        <div className="shrink-0 w-48">
          <AsyncSelect
            placeholder="All Pricing Groups"
            value={selectedPricingGroupOption}
            loadOptions={loadPricingGroupOptions}
            defaultOptions={pricingGroupOptions}
            onChange={option => {
              const opt = Array.isArray(option) ? (option[0] ?? null) : option;
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (opt?.value) {
                  next.set('pricingGroup', String(opt.value));
                  next.set('pricingGroupId', String(opt.value));
                } else {
                  next.delete('pricingGroup');
                  next.delete('pricingGroupId');
                }
                return next;
              });
            }}
            isClearable
            isSearchable
            pagination={false}
          />
        </div>

        <div className="shrink-0 w-36">
          <AsyncSelect
            placeholder="All Statuses"
            value={selectedStatusOption}
            loadOptions={loadStatusOptions}
            defaultOptions={statusOptions}
            onChange={option => {
              const opt = Array.isArray(option) ? (option[0] ?? null) : option;
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (opt?.value) next.set('status', String(opt.value).toLowerCase());
                else next.delete('status');
                return next;
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
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            <span className="text-base leading-none">×</span> Reset
          </button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CurrencyProfileTable currencies={currencies} loading={isLoading || isFetching} />
      </section>
    </div>
  );
};
