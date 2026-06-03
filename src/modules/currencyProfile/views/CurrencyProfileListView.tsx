import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { CURRENCY_PROFILE_TEXTS } from '../constants';
import { CurrencyProfileTable } from '../components';
import { useListCurrencyProfiles } from '../hooks';

export const CurrencyProfileListView = () => {
  const navigate = useNavigate();
  const { data: currencies = [], isLoading, error } = useListCurrencyProfiles();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {CURRENCY_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              Master Profile
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {CURRENCY_PROFILE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {CURRENCY_PROFILE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            className="rounded-sm"
            onClick={() =>
              navigate('/master/system-setups/currency-profile/create')
            }
          >
            {CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CurrencyProfileTable currencies={currencies} />
      </section>
    </div>
  );
};
