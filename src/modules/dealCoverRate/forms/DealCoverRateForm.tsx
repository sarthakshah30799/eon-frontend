import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldDatePicker,
  FormFieldInput,
  FormFieldPurposeSelect,
  FormFieldSelect,
  FormFieldTextarea,
} from '@/components/forms';
import {
  CardSection,
  type AsyncSelectOption,
  type AsyncSelectResponse,
} from '@/components/ui';
import { accountProfileApi } from '@/api/accountProfile';
import type { IAccountProfileListQuery } from '@/modules/accountProfile/types/accountProfileTypes';
import { AccountProfileLedgerLabelEnum } from '@/modules/accountProfile/utils/accountProfileLedgerLabels';
import { purposeApi } from '@/api/purpose';
import { FormFieldPartyProfileSelect } from '@/modules/partyProfiles/components';
import { usePartyProfileTypes } from '@/modules/partyProfiles/hooks';
import {
  PartyProfileTypeEnum,
  type PartyProfileType,
} from '@/modules/partyProfiles/types';
import {
  useGetBranchProfile,
  useLoadBranchOptions,
} from '@/modules/branchProfile/hooks';
import { useAuth } from '@/lib/AuthContext';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { resolvePurchaseTransactionPreview } from '@/modules/purchase/utils/purchaseUtils';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { DEAL_COVER_RATE_TEXT } from '../constants';
import { dealCoverRateSchema } from '../schema';
import { useDealCoverReferences } from '../hooks';
import { DealCoverPassengerSection } from '../components';
import type { DealCoverRateFormProps, DealCoverRateFormValues } from '../types';
import { calculateInrAmount, isTtProductCode } from '../utils';

const staticLoader =
  (options: AsyncSelectOption[]) =>
  async (input: string): Promise<AsyncSelectResponse> => ({
    options: input
      ? options.filter(option =>
          option.label.toLowerCase().includes(input.toLowerCase())
        )
      : options,
  });

const DealDateSync = ({
  transactionDate,
  readOnly,
}: {
  transactionDate: string;
  readOnly: boolean;
}) => {
  const form = useFormContext<DealCoverRateFormValues>();
  useEffect(() => {
    if (readOnly || !transactionDate) return;
    if (form.getValues('transactionDate') !== transactionDate) {
      form.setValue('transactionDate', transactionDate, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [form, readOnly, transactionDate]);
  return null;
};

const DealRateSync = ({ readOnly }: { readOnly: boolean }) => {
  const form = useFormContext<DealCoverRateFormValues>();
  const references = useDealCoverReferences();
  const productId = useWatch({ control: form.control, name: 'productId' });
  const currencyId = useWatch({ control: form.control, name: 'currencyId' });
  const feAmount = useWatch({ control: form.control, name: 'feAmount' });
  const dealRate = useWatch({ control: form.control, name: 'dealRate' });

  useEffect(() => {
    if (readOnly || !productId || !currencyId) return;
    const preview = resolvePurchaseTransactionPreview(
      {
        latestRates: references.latestRates,
        currencies: references.currencies,
        productCurrencyRates: references.productCurrencyRates,
        products: [],
      },
      currencyId,
      productId
    );
    const nextRate = preview?.sale?.appliedFinalRate ?? '';
    if (nextRate && form.getValues('dealRate') !== nextRate) {
      form.setValue('dealRate', nextRate, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [
    currencyId,
    form,
    productId,
    readOnly,
    references.currencies,
    references.latestRates,
    references.productCurrencyRates,
  ]);

  useEffect(() => {
    if (readOnly) return;
    const inrAmount = calculateInrAmount(feAmount ?? '', dealRate ?? '');
    if (inrAmount && form.getValues('inrAmount') !== inrAmount) {
      form.setValue('inrAmount', inrAmount, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [dealRate, feAmount, form, readOnly]);

  return null;
};

const DefaultTtProductSync = ({ readOnly }: { readOnly: boolean }) => {
  const form = useFormContext<DealCoverRateFormValues>();
  const references = useDealCoverReferences();
  useEffect(() => {
    if (readOnly || form.getValues('productId')) return;
    const ttProduct = references.products.find(product =>
      isTtProductCode(product.productCode)
    );
    if (ttProduct) {
      form.setValue('productId', ttProduct.id, { shouldValidate: true });
    }
  }, [form, readOnly, references.products]);
  return null;
};

export const DealCoverRateForm = ({
  initialValues,
  readOnly = false,
  onSubmit,
  footerActions,
  submitLabel = DEAL_COVER_RATE_TEXT.submit,
}: DealCoverRateFormProps) => {
  const navigate = useNavigate();
  const { user, activeBranchId, policyContext } = useAuth();
  const canSelectBranch = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const formBranchId = initialValues.branchId || activeBranchId || '';
  const { data: branchProfile } = useGetBranchProfile(formBranchId);
  const loadBranchOptions = useLoadBranchOptions({ activeOnly: true });
  const references = useDealCoverReferences();

  const policyQuery = useQuery({
    queryKey: ['deal-cover-rate', 'transaction-date-policy', formBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(formBranchId),
    enabled: Boolean(formBranchId),
  });
  const transactionDatePolicy = useMemo(
    () =>
      getTransactionDatePolicy(
        policyQuery.data ??
          (formBranchId === activeBranchId ? policyContext : null)
      ),
    [activeBranchId, formBranchId, policyContext, policyQuery.data]
  );

  const productOptions = useMemo(
    () =>
      references.products.map(product => ({
        value: product.id,
        label: `${product.productCode} - ${product.productDescription ?? product.productCode}`,
      })),
    [references.products]
  );
  const currencyOptions = useMemo(
    () =>
      references.currencies.map(currency => ({
        value: currency.id,
        label: `${currency.currencyCode} - ${currency.currencyName}`,
      })),
    [references.currencies]
  );

  const { data: partyProfileTypes = [], isLoading: partyTypesLoading } =
    usePartyProfileTypes();
  const partyTypeOptions = useMemo(
    () =>
      partyProfileTypes.map(option => ({
        value: option.value,
        label: option.label,
      })),
    [partyProfileTypes]
  );

  const loadBanks = useCallback(
    async (search: string): Promise<AsyncSelectResponse> => {
      const params: IAccountProfileListQuery = {
        search: search || undefined,
        limit: PAGINATION_DEFAULTS.LIMIT,
        active: true,
      };
      const res = await accountProfileApi.getAccountProfiles(params);
      const filtered = res.data.filter(
        account =>
          account.accountType?.value === AccountProfileLedgerLabelEnum.BankLedger
      );
      return {
        options: filtered.map(account => ({
          value: account.id,
          label: `${account.accountCode} - ${account.accountName}`,
        })),
      };
    },
    []
  );

  return (
    <Form<DealCoverRateFormValues>
      id="deal-cover-rate-form"
      defaultValues={initialValues}
      resolver={yupResolver(dealCoverRateSchema) as never}
      mode="onChange"
      onSubmit={onSubmit}
      footer={{
        submitLabel,
        showSubmit: !readOnly,
        backLabel: DEAL_COVER_RATE_TEXT.back,
        onBackClick: () => navigate('/deal-cover-rate'),
        isSubmitDisabled:
          policyQuery.isFetching ||
          transactionDatePolicy.canPunchTransactions === false,
        actions: footerActions,
      }}
    >
      <DealDateSync
        transactionDate={transactionDatePolicy.defaultTransactionDate}
        readOnly={readOnly}
      />
      <DealRateSync readOnly={readOnly} />
      <DefaultTtProductSync readOnly={readOnly} />
      <DealCoverRateFormFields
        readOnly={readOnly}
        canSelectBranch={canSelectBranch}
        branchesLoading={false}
        loadBranchOptions={loadBranchOptions}
        branchLabel={
          branchProfile
            ? `${branchProfile.code} - ${branchProfile.name}`
            : formBranchId
        }
        productOptions={productOptions}
        currencyOptions={currencyOptions}
        partyTypeOptions={partyTypeOptions}
        partyTypesLoading={partyTypesLoading}
        productsLoading={references.productsLoading}
        currenciesLoading={references.currenciesLoading}
        issuersLoading={references.issuersLoading}
        loadBanks={loadBanks}
        transactionDatePolicy={transactionDatePolicy}
        isTransactionDateLoading={policyQuery.isFetching}
      />
    </Form>
  );
};

const DealCoverRateFormFields = ({
  readOnly,
  canSelectBranch,
  branchesLoading,
  loadBranchOptions,
  branchLabel,
  productOptions,
  currencyOptions,
  partyTypeOptions,
  partyTypesLoading,
  productsLoading,
  currenciesLoading,
  issuersLoading,
  loadBanks,
  transactionDatePolicy,
  isTransactionDateLoading,
}: {
  readOnly: boolean;
  canSelectBranch: boolean;
  branchesLoading: boolean;
  loadBranchOptions: (
    input: string,
    page?: number
  ) => Promise<AsyncSelectResponse>;
  branchLabel: string;
  productOptions: AsyncSelectOption[];
  currencyOptions: AsyncSelectOption[];
  partyTypeOptions: AsyncSelectOption[];
  partyTypesLoading: boolean;
  productsLoading: boolean;
  currenciesLoading: boolean;
  issuersLoading: boolean;
  loadBanks: (search: string) => Promise<AsyncSelectResponse>;
  transactionDatePolicy: ReturnType<typeof getTransactionDatePolicy>;
  isTransactionDateLoading: boolean;
}) => {
  const form = useFormContext<DealCoverRateFormValues>();
  const references = useDealCoverReferences();
  const purposeId = useWatch({ control: form.control, name: 'purposeId' });
  const productId = useWatch({ control: form.control, name: 'productId' });
  const partyProfileType = useWatch({
    control: form.control,
    name: 'partyProfileType',
  });

  const purposeQuery = useQuery({
    queryKey: ['deal-cover-rate', 'purpose-detail', purposeId],
    queryFn: () => purposeApi.getPurposeById(purposeId),
    enabled: Boolean(purposeId),
  });

  const liveIssuerOptions = useMemo(() => {
    const product = references.products.find(item => item.id === productId);
    const allowed = product?.issuerProfileIds ?? [];
    const filtered =
      allowed.length > 0
        ? references.issuers.filter(issuer => allowed.includes(issuer.id))
        : references.issuers;
    return filtered.map(issuer => ({
      value: issuer.id,
      label: `${issuer.code} - ${issuer.name}`,
    }));
  }, [productId, references.issuers, references.products]);

  const subpurposeOptions = useMemo(
    () =>
      (purposeQuery.data?.subpurposes ?? [])
        .filter(item => item.isActive !== false)
        .map(item => ({
          value: item.id,
          label: `${item.code} - ${item.name}`,
        })),
    [purposeQuery.data?.subpurposes]
  );

  useEffect(() => {
    if (readOnly) return;
    const current = form.getValues('issuerPartyProfileId');
    if (
      current &&
      liveIssuerOptions.length > 0 &&
      !liveIssuerOptions.some(option => option.value === current)
    ) {
      form.setValue('issuerPartyProfileId', '', { shouldValidate: true });
    }
  }, [form, liveIssuerOptions, readOnly]);

  const previousPurposeIdRef = useRef(purposeId);
  useEffect(() => {
    if (readOnly) return;
    if (previousPurposeIdRef.current === purposeId) return;
    previousPurposeIdRef.current = purposeId;
    form.setValue('subpurposeId', '', { shouldValidate: true });
  }, [form, purposeId, readOnly]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {readOnly
            ? DEAL_COVER_RATE_TEXT.viewTitle
            : DEAL_COVER_RATE_TEXT.createTitle}
        </h1>
        <p className="text-sm text-text-secondary">
          {readOnly
            ? DEAL_COVER_RATE_TEXT.readonlyDescription
            : DEAL_COVER_RATE_TEXT.createDescription}
        </p>
      </div>

      <CardSection
        heading={DEAL_COVER_RATE_TEXT.detailsHeading}
        className="space-y-4"
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {canSelectBranch ? (
            <FormFieldSelect
              name="branchId"
              label={DEAL_COVER_RATE_TEXT.branch}
              placeholder={DEAL_COVER_RATE_TEXT.selectBranch}
              loadOptions={loadBranchOptions}
              defaultOptions={true}
              isLoading={branchesLoading}
              disabled={readOnly}
            />
          ) : (
            <div>
              <div className="mb-1 text-sm font-medium text-text-secondary">
                {DEAL_COVER_RATE_TEXT.branch}
              </div>
              <div className="rounded-sm border border-border-primary bg-surface-secondary px-3 py-2 text-sm text-text-primary">
                {branchLabel}
              </div>
            </div>
          )}
          <FormFieldDatePicker
            name="transactionDate"
            label={DEAL_COVER_RATE_TEXT.transactionDate}
            dateFormat="dd/MM/yyyy"
            disabled={
              readOnly ||
              isTransactionDateLoading ||
              transactionDatePolicy.canPunchTransactions === false
            }
            minDate={transactionDatePolicy.minDate}
            maxDate={transactionDatePolicy.maxDate}
          />
          <FormFieldSelect
            name="bankAccountProfileId"
            label={DEAL_COVER_RATE_TEXT.bankAccount}
            placeholder={DEAL_COVER_RATE_TEXT.selectBank}
            loadOptions={loadBanks}
            defaultOptions={true}
            disabled={readOnly}
          />
          <FormFieldSelect
            name="productId"
            label={DEAL_COVER_RATE_TEXT.product}
            placeholder={DEAL_COVER_RATE_TEXT.selectProduct}
            loadOptions={staticLoader(productOptions)}
            defaultOptions={productOptions}
            isLoading={productsLoading}
            disabled={readOnly}
            onValueChange={() =>
              form.setValue('issuerPartyProfileId', '', {
                shouldValidate: true,
              })
            }
          />
          <FormFieldSelect
            name="partyProfileType"
            label={DEAL_COVER_RATE_TEXT.partyType}
            placeholder={DEAL_COVER_RATE_TEXT.selectPartyType}
            loadOptions={staticLoader(partyTypeOptions)}
            defaultOptions={partyTypeOptions}
            isLoading={partyTypesLoading}
            disabled={readOnly}
            onValueChange={() => {
              form.setValue('partyProfileId', '', { shouldValidate: true });
              form.setValue('passengerId', '');
              form.setValue('passengerName', '');
              form.setValue('passengerPan', '');
              form.setValue('passengerPanHolder', '');
              form.setValue('passengerPanDob', '');
              form.setValue('passengerPassport', '');
            }}
          />
          <FormFieldPartyProfileSelect
            name="partyProfileId"
            label={DEAL_COVER_RATE_TEXT.party}
            types={
              (partyProfileType as PartyProfileType) ||
              PartyProfileTypeEnum.CORPORATE_CLIENT
            }
            placeholder={DEAL_COVER_RATE_TEXT.selectParty}
            disabled={readOnly || !partyProfileType}
          />
          <FormFieldPartyProfileSelect
            name="marketingExecutiveId"
            label={DEAL_COVER_RATE_TEXT.marketingExecutive}
            types={PartyProfileTypeEnum.MARKETING_EXECUTIVE}
            placeholder={DEAL_COVER_RATE_TEXT.selectMarketingExecutive}
            disabled={readOnly}
          />
          <FormFieldPurposeSelect
            name="purposeId"
            label={DEAL_COVER_RATE_TEXT.purpose}
            disabled={readOnly}
          />
          <FormFieldSelect
            name="subpurposeId"
            label={DEAL_COVER_RATE_TEXT.subpurpose}
            placeholder={DEAL_COVER_RATE_TEXT.selectSubpurpose}
            loadOptions={staticLoader(subpurposeOptions)}
            defaultOptions={subpurposeOptions}
            isLoading={purposeQuery.isLoading}
            disabled={readOnly || !purposeId || subpurposeOptions.length === 0}
          />
          <FormFieldSelect
            name="currencyId"
            label={DEAL_COVER_RATE_TEXT.currency}
            placeholder={DEAL_COVER_RATE_TEXT.selectCurrency}
            loadOptions={staticLoader(currencyOptions)}
            defaultOptions={currencyOptions}
            isLoading={currenciesLoading}
            disabled={readOnly}
          />
          <FormFieldSelect
            name="issuerPartyProfileId"
            label={DEAL_COVER_RATE_TEXT.issuer}
            placeholder={DEAL_COVER_RATE_TEXT.selectIssuer}
            loadOptions={staticLoader(liveIssuerOptions)}
            defaultOptions={liveIssuerOptions}
            isLoading={issuersLoading}
            disabled={readOnly}
          />
          <FormFieldInput
            name="feAmount"
            label={DEAL_COVER_RATE_TEXT.feAmount}
            valueTransform="none"
            disabled={readOnly}
          />
          <FormFieldInput
            name="dealRate"
            label={DEAL_COVER_RATE_TEXT.dealRate}
            valueTransform="none"
            readOnly
            disabled
          />
          <FormFieldInput
            name="inrAmount"
            label={DEAL_COVER_RATE_TEXT.inrAmount}
            valueTransform="none"
            readOnly
            disabled
          />
          <FormFieldInput
            name="fbChargeAmount"
            label={DEAL_COVER_RATE_TEXT.fbChargeAmount}
            valueTransform="none"
            disabled={readOnly}
          />
          <FormFieldCategoryOption
            name="maturityOptionId"
            label={DEAL_COVER_RATE_TEXT.maturity}
            placeholder={DEAL_COVER_RATE_TEXT.selectMaturity}
            code={CategoryOptionCodeEnum.TtMaturity}
            isCreatable={false}
            disabled={readOnly}
          />
          <div className="xl:col-span-2">
            <FormFieldTextarea
              name="narration"
              label={DEAL_COVER_RATE_TEXT.narration}
              disabled={readOnly}
              rows={3}
            />
          </div>
        </div>
      </CardSection>

      <CardSection
        heading={DEAL_COVER_RATE_TEXT.passengerHeading}
        className="space-y-4"
      >
        <DealCoverPassengerSection readOnly={readOnly} />
      </CardSection>
    </div>
  );
};

export default DealCoverRateForm;
