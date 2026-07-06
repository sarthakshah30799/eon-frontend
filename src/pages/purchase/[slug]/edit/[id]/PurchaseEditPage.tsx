import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@/components/ui/loader';
import { NotFoundState } from '@/components/ui/not-found-state';
import { useAuth } from '@/lib/AuthContext';
import { useCurrencyRatesViewData } from '@/modules/currencyRates/hooks/useCurrencyRatesViewData';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { transactionsApi } from '@/api/transactions';
import { PurchaseForm } from '@/modules/purchase';
import { getAdditionalSettingBooleanValue } from '@/modules/additionalSettings/utils';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import {
  getPurchasePageTitle,
  getPurchasePageTypeFromSlug,
  getPurchasePartyProfileTypes,
  getPurchaseTradeMode,
  getPurchaseTransactionType,
} from '../../purchasePage.enum';
import { mapPurchaseTransactionToFormValues, createEmptyPurchaseFormValues } from '@/modules/purchase/utils/purchaseUtils';

const PurchaseEditPage = () => {
  const navigate = useNavigate();
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const { activeBranchId } = useAuth();
  const purchasePageType = getPurchasePageTypeFromSlug(slug);

  const { data: transaction, isLoading: isTransactionLoading, error: transactionError } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getTransactionById(id ?? ''),
    enabled: Boolean(id),
  });
  const {
    data: branchProfile,
    isLoading: isBranchLoading,
    error: branchError,
  } = useGetBranchProfile(transaction?.branchId ?? activeBranchId ?? '');
  const {
    data,
    isLoading: isPricingLoading,
    error: pricingError,
  } = useCurrencyRatesViewData();
  const {
    data: additionalSettings = [],
    isLoading: isAdditionalSettingsLoading,
    error: additionalSettingsError,
  } = useListAdditionalSettings();

  const partyProfileTypes = useMemo(
    () => getPurchasePartyProfileTypes(purchasePageType),
    [purchasePageType]
  );
  const requiresApproval = useMemo(
    () =>
      purchasePageType === null
        ? false
        : getAdditionalSettingBooleanValue(
            additionalSettings,
            AdditionalSettingsCodeEnum.TransactionApprovalPolicy,
            AdditionalSettingsCodeEnum.PurchaseFfmcAds,
            false
          ),
    [additionalSettings, purchasePageType]
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

  const defaultValues = useMemo(() => {
    if (!transaction) {
      return createEmptyPurchaseFormValues(
        branchProfile?.code ?? '',
        getPurchaseTransactionType(purchasePageType),
        getPurchaseTradeMode(purchasePageType),
        purchasePageType,
        branchProfile
          ? {
              id: branchProfile.id,
              code: branchProfile.code,
              name: branchProfile.name,
              label: `${branchProfile.code} - ${branchProfile.name}`,
            }
          : null,
      );
    }

    return mapPurchaseTransactionToFormValues(transaction, purchasePageType);
  }, [branchProfile, purchasePageType, transaction]);

  const isLoading =
    isTransactionLoading ||
    isBranchLoading ||
    isPricingLoading ||
    isAdditionalSettingsLoading;

  if (!purchasePageType) {
    return (
      <NotFoundState message="You do not have access to this purchase page." />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (transactionError || branchError || pricingError || additionalSettingsError || !transaction) {
    return (
      <NotFoundState message="Transaction not found." />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">
          {getPurchasePageTitle(purchasePageType)}
        </h1>
        <p className="text-sm text-text-secondary">
          View the transaction in the same form layout. Editing is disabled from this screen.
        </p>
      </div>

      <PurchaseForm
        purchasePageType={purchasePageType}
        defaultValues={defaultValues}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        requiresApproval={requiresApproval}
        branchId={transaction.branchId}
        branchCode={branchProfile?.code ?? ''}
        savedTransactionId={transaction.id}
        savedTransactionNumber={transaction.number}
        isFreshlyCreated={false}
        readOnly
        isSubmitting={false}
        existingDocuments={transaction.documents ?? []}
        submitLabel="Save"
        onSubmit={async () => undefined}
        onCancel={() => navigate(`/purchase/${slug}`)}
      />
    </div>
  );
};

export default PurchaseEditPage;
