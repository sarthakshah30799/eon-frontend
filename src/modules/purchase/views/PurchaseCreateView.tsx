import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { type PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { getAdditionalSettingBooleanValue } from '@/modules/additionalSettings/utils';
import {
  getPurchasePageSlugFromType,
  getPurchasePageTitle,
  getPurchasePartyProfileTypes,
  getPurchaseTradeMode,
  getPurchaseTransactionType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import {
  TransactionTypeEnum,
  type ITransactionEntity,
  type ITransactionReferenceSnapshot,
} from '@/modules/transactions';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import { getAdditionalSettingTextValue } from '@/modules/additionalSettings/utils';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import type {
  IPurchaseDraftDocumentAttachment,
  IPurchaseFormValues,
} from '../types';

interface PurchaseCreateViewProps {
  purchasePageType: PurchasePageType | null;
}

export const PurchaseCreateView = ({
  purchasePageType,
}: PurchaseCreateViewProps) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { user, activeBranchId, activeCounterId, policyContext } = useAuth();
  const canSelectWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const [savedTransaction, setSavedTransaction] =
    useState<ITransactionEntity | null>(null);
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
  const transactionDatePolicy = useMemo(
    () => getTransactionDatePolicy(policyContext),
    [policyContext]
  );

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
  const handlingFeeControlAccountId = useMemo(
    () =>
      getAdditionalSettingTextValue(
        additionalSettings,
        AdditionalSettingsCodeEnum.TransactionAccounting,
        AdditionalSettingsCodeEnum.HandlingChargeAccount,
        ''
      ),
    [additionalSettings]
  );

  const defaultValues = useMemo(
    () =>
      createEmptyPurchaseFormValues(
        getPurchaseTransactionType(purchasePageType),
        getPurchaseTradeMode(purchasePageType),
        purchasePageType,
        branchProfile && !canSelectWorkplace
          ? ({
              id: branchProfile.id,
              code: branchProfile.code,
              name: branchProfile.name,
              label: `${branchProfile.code} - ${branchProfile.name}`,
            } satisfies ITransactionReferenceSnapshot)
          : null,
        canSelectWorkplace ? '' : (activeBranchId ?? ''),
        canSelectWorkplace ? '' : (activeCounterId ?? ''),
        transactionDatePolicy.defaultTransactionDate
      ),
    [
      activeBranchId,
      activeCounterId,
      branchProfile,
      canSelectWorkplace,
      purchasePageType,
      transactionDatePolicy.defaultTransactionDate,
    ]
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

  const onSubmit = useCallback(
    async (
      values: IPurchaseFormValues,
      attachments: IPurchaseDraftDocumentAttachment[]
    ) => {
      const payload = mapPurchaseFormValuesToSubmitPayload(
        values,
        attachments,
        requiresApproval
      );
      const created = await createPurchaseTransaction(payload);
      setSavedTransaction(created);
      const listSlug = slug || getPurchasePageSlugFromType(purchasePageType);
      if (!listSlug) {
        return;
      }
      navigate(
        getPurchaseTransactionType(purchasePageType) ===
          TransactionTypeEnum.SALE
          ? `/sell/${listSlug}`
          : `/purchase/${listSlug}`
      );
    },
    [
      createPurchaseTransaction,
      navigate,
      purchasePageType,
      requiresApproval,
      slug,
    ]
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
          Capture the party profile, transaction number, pricing, and draft
          documents in one form.
        </p>
      </div>

      <PurchaseForm
        purchasePageType={purchasePageType}
        defaultValues={defaultValues}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        requiresApproval={requiresApproval}
        handlingFeeControlAccountId={handlingFeeControlAccountId}
        branchId={canSelectWorkplace ? '' : (activeBranchId ?? '')}
        branchCode={canSelectWorkplace ? '' : (branchProfile?.code ?? '')}
        sacCode={sacCode}
        gstRatePercent={gstRatePercent}
        isSubmitting={isSaving}
        submitLabel={requiresApproval ? 'Submit for Approval' : 'Save'}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        savedTransaction={savedTransaction}
        isFreshlyCreated={Boolean(savedTransaction)}
      />
    </div>
  );
};

export default PurchaseCreateView;
