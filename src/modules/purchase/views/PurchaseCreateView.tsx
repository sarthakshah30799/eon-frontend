import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { useCurrencyRatesViewData } from '@/modules/currencyRates/hooks/useCurrencyRatesViewData';
import { useCreatePurchaseTransaction } from '../hooks';
import {
  createEmptyPurchaseFormValues,
  mapPurchaseFormValuesToSubmitPayload,
} from '../utils/purchaseUtils';
import { PurchaseForm } from '../forms/PurchaseForm';
import {
  type PurchasePageType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import { getAdditionalSettingBooleanValue } from '@/modules/additionalSettings/utils';
import {
  getPurchasePageTitle,
  getPurchasePartyProfileTypes,
  getPurchaseTradeMode,
  getPurchaseTransactionType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import type { ITransactionEntity, ITransactionReferenceSnapshot } from '@/modules/transactions';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import { getAdditionalSettingTextValue } from '@/modules/additionalSettings/utils';

interface PurchaseCreateViewProps {
  purchasePageType: PurchasePageType | null;
}

export const PurchaseCreateView = ({
  purchasePageType,
}: PurchaseCreateViewProps) => {
  const navigate = useNavigate();
  const { activeBranchId } = useAuth();
  const [savedTransaction, setSavedTransaction] = useState<{
    id: string;
    number: string | null;
    logs?: ITransactionEntity['logs'];
  } | null>(null);
  const {
    data: branchProfile,
    isLoading: isBranchLoading,
    error: branchError,
  } = useGetBranchProfile(activeBranchId ?? '');
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
  const { createPurchaseTransaction, isPending: isSaving } =
    useCreatePurchaseTransaction();

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
        AdditionalSettingsCodeEnum.TransactionPrintSettings,
        AdditionalSettingsCodeEnum.TransactionPrintSacCode,
        ''
      ),
    [additionalSettings]
  );

  const defaultValues = useMemo(
    () =>
      createEmptyPurchaseFormValues(
        branchProfile?.code ?? '',
        getPurchaseTransactionType(purchasePageType),
        getPurchaseTradeMode(purchasePageType),
        purchasePageType,
        branchProfile
          ? ({
              id: branchProfile.id,
              code: branchProfile.code,
              name: branchProfile.name,
              label: `${branchProfile.code} - ${branchProfile.name}`,
            } satisfies ITransactionReferenceSnapshot)
          : null
      ),
    [branchProfile, purchasePageType]
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

  const isLoading =
    isBranchLoading || isPricingLoading || isAdditionalSettingsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (branchError || pricingError || additionalSettingsError) {
    return (
      <div className="py-8 text-center text-error-600">
        Failed to load purchase data. Please try again.
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
          {getPurchasePageTitle(purchasePageType)}
        </h1>
        <p className="text-sm text-text-secondary">
          Capture the party profile, transaction number, pricing, and draft documents in one form.
        </p>
      </div>

      <PurchaseForm
        purchasePageType={purchasePageType}
        defaultValues={defaultValues}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        requiresApproval={requiresApproval}
        branchId={activeBranchId ?? ''}
        branchCode={branchProfile?.code ?? ''}
        sacCode={sacCode}
        isSubmitting={isSaving}
        submitLabel={requiresApproval ? 'Submit for Approval' : 'Save'}
        onSubmit={async (values, attachments) => {
          const payload = mapPurchaseFormValuesToSubmitPayload(
            values,
            activeBranchId ?? '',
            attachments,
            requiresApproval
          );
          const created = await createPurchaseTransaction(payload);
          setSavedTransaction({
            id: created.id,
            number: created.number,
            logs: created.logs ?? [],
          });
        }}
        onCancel={() => navigate(-1)}
        savedTransaction={savedTransaction}
        isFreshlyCreated={Boolean(savedTransaction)}
      />
    </div>
  );
};

export default PurchaseCreateView;
