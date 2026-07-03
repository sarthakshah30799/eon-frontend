import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { useCurrencyRatesViewData } from '@/modules/currencyRates/hooks/useCurrencyRatesViewData';
import { createEmptyBuyFromFormValues } from '../utils/buyFromUtils';
import { BuyFromForm } from '../forms/BuyFromForm';
import type { BuyFromPageType } from '@/pages/buy-from/[slug]/buyFromPage.enum';
import {
  getBuyFromPageTitle,
  getBuyFromPartyProfileTypes,
} from '@/pages/buy-from/[slug]/buyFromPage.enum';

interface BuyFromCreateViewProps {
  buyFromPageType: BuyFromPageType | null;
}

export const BuyFromCreateView = ({
  buyFromPageType,
}: BuyFromCreateViewProps) => {
  const navigate = useNavigate();
  const { activeBranchId } = useAuth();
  const {
    data: branchProfile,
    isLoading: isBranchLoading,
    error: branchError,
  } = useGetBranchProfile(activeBranchId ?? '', Boolean(activeBranchId));
  const {
    data,
    isLoading: isPricingLoading,
    error: pricingError,
  } = useCurrencyRatesViewData();

  const partyProfileTypes = useMemo(
    () => getBuyFromPartyProfileTypes(buyFromPageType),
    [buyFromPageType]
  );

  const defaultValues = useMemo(
    () => createEmptyBuyFromFormValues(branchProfile?.code ?? ''),
    [branchProfile?.code]
  );
  const pricingData = useMemo(
    () => ({
      ...(data ?? {
        groups: [],
        products: [],
        currencies: [],
        rates: [],
        latestRates: [],
        productCurrencyRates: [],
      }),
      latestRates: data?.latestRates ?? data?.rates ?? [],
    }),
    [data]
  );

  const isLoading = isBranchLoading || isPricingLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (branchError || pricingError) {
    return (
      <div className="py-8 text-center text-error-600">
        Failed to load buy-from data. Please try again.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-text-secondary">
        No pricing data found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">
          {getBuyFromPageTitle(buyFromPageType)}
        </h1>
        <p className="text-sm text-text-secondary">
          Capture the party profile, transaction number, pricing, and draft documents in one form.
        </p>
      </div>

      <BuyFromForm
        buyFromPageType={buyFromPageType}
        defaultValues={defaultValues}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        branchId={activeBranchId ?? ''}
        branchCode={branchProfile?.code ?? ''}
        onSubmit={async (values, attachments) => {
          console.log('Buy from draft payload:', {
            values,
            attachments,
          });
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default BuyFromCreateView;
