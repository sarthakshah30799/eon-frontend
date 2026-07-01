import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce } from '@/hooks';
import { CURRENCY_PROFILE_TEXTS } from '../constants';
import { CurrencyProfileTable } from '../components';
import { useListCurrencyProfiles } from '../hooks';

export const CurrencyProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim() || undefined,
    [debouncedSearch]
  );
  const { data: currencies = [], isLoading, isFetching, error } =
    useListCurrencyProfiles(query);

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
          onClick={() =>
            navigate('/currency-profile/create')
          }
        >
          {CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CurrencyProfileTable
          currencies={currencies}
          loading={isLoading || isFetching}
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
          searchPlaceholder="Search currency code, name, or country"
        />
      </section>
    </div>
  );
};
