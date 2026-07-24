import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '@/components/ui/loader';
import { NotFoundState } from '@/components/ui/not-found-state';
import { useAuth } from '@/lib/AuthContext';
import { useCurrencyRatesViewData } from '@/modules/currencyRates/hooks/useCurrencyRatesViewData';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { transactionsApi } from '@/api/transactions';
import { PurchaseForm, AD1EditView } from '@/modules/purchase';
import {
  getAdditionalSettingBooleanValue,
  getAdditionalSettingTextValue,
} from '@/modules/additionalSettings/utils';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import {
  getPurchasePageBasePath,
  getPurchasePageTitle,
  getPurchasePageTypeFromPath,
  getPurchasePartyProfileTypes,
  getPurchaseTradeMode,
  getPurchaseTransactionType,
} from '../../purchasePage.enum';
import { mapPurchaseTransactionToFormValues, createEmptyPurchaseFormValues } from '@/modules/purchase/utils/purchaseUtils';

const PurchaseEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const { activeBranchId } = useAuth();
  const purchasePageType = getPurchasePageTypeFromPath(location.pathname, slug);
  const basePath = getPurchasePageBasePath(purchasePageType);

  const isAd1 = slug === 'ad1';

  const { data: transaction, isLoading: isTransactionLoading, error: transactionError } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getTransactionById(id ?? ''),
    enabled: Boolean(id) && !isAd1,
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
      getAdditionalSettingBooleanValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TransactionApprovalPolicy,
        AdditionalSettingsCodeEnum.PurchaseFfmcAds,
        false
      ),
    [additionalSettings]
  );
  const sacCode = useMemo(
    () =>
      getAdditionalSettingTextValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TransactionSacCode,
        AdditionalSettingsCodeEnum.TransactionPrintSacCode,
        ''
      ),
    [additionalSettings]
  );
  const cashControlAccountId = useMemo(
    () =>
      getAdditionalSettingTextValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TransactionAccounting,
        AdditionalSettingsCodeEnum.CashControlAccount,
        ''
      ),
    [additionalSettings]
  );
  const gstRatePercent = useMemo(
    () =>
      getAdditionalSettingTextValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TaxConfiguration,
        AdditionalSettingsCodeEnum.TaxRate,
        '0'
      ),
    [additionalSettings]
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
      products: data?.products ?? [],
      latestRates: data?.latestRates ?? data?.rates ?? [],
    }),
    [data]
  );

  const defaultValues = useMemo(() => {
    if (!transaction) {
      return createEmptyPurchaseFormValues(
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
        branchProfile?.id ?? '',
        ''
      );
    }

    return mapPurchaseTransactionToFormValues(transaction, purchasePageType);
  }, [branchProfile, purchasePageType, transaction]);

  const isLoading =
    isTransactionLoading ||
    isBranchLoading ||
    isPricingLoading ||
    isAdditionalSettingsLoading;

  if (isAd1) {
    return <AD1EditView />;
  }

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
        cashControlAccountId={cashControlAccountId}
        branchId={transaction.branchId}
        branchCode={branchProfile?.code ?? ''}
        sacCode={sacCode}
        gstRatePercent={gstRatePercent}
        savedTransaction={transaction}
        isFreshlyCreated={false}
        readOnly
        isSubmitting={false}
        existingDocuments={transaction.documents ?? []}
        submitLabel="Save"
        onSubmit={async () => undefined}
        onCancel={() => navigate(`/${basePath}/${slug}`)}
      />
    </div>
  );
};

export default PurchaseEditPage;
