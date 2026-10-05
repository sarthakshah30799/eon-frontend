import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { transactionPoliciesApi } from '@/api/transactionPolicies';
import type { TransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { Loader } from '@/components/ui/loader';
import { CardSection } from '@/components/ui';
import { Form, FormFieldDatePicker, FormFieldInput } from '@/components/forms';
import { PurchaseReferenceNumberField } from '@/modules/purchase/components/PurchaseReferenceNumberField';
import { useAuth } from '@/lib/AuthContext';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import { usePermission } from '@/hooks/usePermission';
import { useCurrencyRatesViewData } from '@/modules/currencyRates/hooks/useCurrencyRatesViewData';
import { useTransactionNextNumber } from '@/modules/transactions/hooks';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types/currencyProfileTypes';
import {
  useCreateBranchTransfer,
  useCreateCounterTransfer,
  useTransferItemsHoldCostStatus,
} from '../hooks';
import type { ITransferFormValues, TransferType } from '../types';
import { transferRequestSchema } from '../schema/transferRequestSchema';
import {
  createEmptyTransferFormValues,
  mapTransferFormValuesToPayload,
} from '../utils/transferFormUtils';
import {
  combineTransferTransactionDatePolicies,
  getTransferNumberSeriesCode,
} from '../utils';
import {
  TransferWorkplaceFields,
  type TransferWorkplaceReferenceOptions,
} from '../components/TransferWorkplaceFields';
import { TransferItemsFieldArray } from '../components/TransferItemsFieldArray';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { getAdditionalSettingBooleanValue } from '@/modules/additionalSettings/utils';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import { TRANSFER_FORM_TEXT } from '../constants/transferConstants';

interface TransferHoldCostBlockState {
  isLoading: boolean;
  isBlocked: boolean;
  message: string;
}

interface TransferWorkplacePolicyBlockState {
  isLoading: boolean;
  isBlocked: boolean;
  message: string;
  combinedPolicy: TransactionDatePolicy;
  awaitingSourceBranch: boolean;
  awaitingDestinationBranch: boolean;
}

interface TransferFormBodyProps {
  transferType: TransferType;
  pricingData: NonNullable<ReturnType<typeof useCurrencyRatesViewData>['data']>;
  canSubmit: boolean;
  canSelectWorkplace: boolean;
  currencyPickerState: {
    rowIndex: number;
    allowedCurrencyIds: string[];
  } | null;
  onOpenCurrencyPicker: (
    rowIndex: number,
    allowedCurrencyIds: string[]
  ) => void;
  onCloseCurrencyPicker: () => void;
  readOnly: boolean;
  useTransferRateEditable: boolean;
  displayNumber?: string;
  readOnlyOptions?: TransferWorkplaceReferenceOptions;
  onHoldCostBlockChange: (state: TransferHoldCostBlockState) => void;
  onWorkplacePolicyChange: (state: TransferWorkplacePolicyBlockState) => void;
}

const TransferFormBody = ({
  transferType,
  pricingData,
  canSubmit,
  canSelectWorkplace,
  currencyPickerState,
  onOpenCurrencyPicker,
  onCloseCurrencyPicker,
  readOnly,
  displayNumber,
  readOnlyOptions,
  useTransferRateEditable,
  onHoldCostBlockChange,
  onWorkplacePolicyChange,
}: TransferFormBodyProps) => {
  const form = useFormContext<ITransferFormValues>();
  const { activeBranchId, policyContext } = useAuth();
  const sourceBranchId = useWatch({
    control: form.control,
    name: 'sourceBranchId',
  });
  const sourceCounterId = useWatch({
    control: form.control,
    name: 'sourceCounterId',
  });
  const destinationBranchId = useWatch({
    control: form.control,
    name: 'destinationBranchId',
  });
  const items = useWatch({
    control: form.control,
    name: 'items',
  });
  const isBranchTransfer = transferType === 'BRANCH';

  const sourceBranchPolicyQuery = useQuery({
    queryKey: ['transfers', 'branch-day-policy', 'source', sourceBranchId],
    queryFn: () => transactionPoliciesApi.getPolicyContext(sourceBranchId),
    enabled: Boolean(sourceBranchId) && !readOnly,
  });

  const requiresDestinationPolicy =
    isBranchTransfer &&
    Boolean(destinationBranchId) &&
    destinationBranchId !== sourceBranchId;

  const destinationBranchPolicyQuery = useQuery({
    queryKey: [
      'transfers',
      'branch-day-policy',
      'destination',
      destinationBranchId,
    ],
    queryFn: () =>
      transactionPoliciesApi.getPolicyContext(destinationBranchId),
    enabled: requiresDestinationPolicy && !readOnly,
  });

  const resolveBranchPolicyContext = useCallback(
    (
      branchId: string,
      queryData: typeof sourceBranchPolicyQuery.data | undefined
    ) => queryData ?? (branchId === activeBranchId ? policyContext : null),
    [activeBranchId, policyContext]
  );

  const sourcePolicy = useMemo(
    () =>
      getTransactionDatePolicy(
        sourceBranchId
          ? resolveBranchPolicyContext(
              sourceBranchId,
              sourceBranchPolicyQuery.data
            )
          : null
      ),
    [
      resolveBranchPolicyContext,
      sourceBranchId,
      sourceBranchPolicyQuery.data,
    ]
  );

  const destinationPolicy = useMemo(() => {
    if (!requiresDestinationPolicy) {
      return null;
    }

    return getTransactionDatePolicy(
      resolveBranchPolicyContext(
        destinationBranchId,
        destinationBranchPolicyQuery.data
      )
    );
  }, [
    destinationBranchId,
    destinationBranchPolicyQuery.data,
    requiresDestinationPolicy,
    resolveBranchPolicyContext,
  ]);

  const transactionDatePolicy = useMemo(() => {
    if (destinationPolicy) {
      return combineTransferTransactionDatePolicies([
        sourcePolicy,
        destinationPolicy,
      ]);
    }

    return sourcePolicy;
  }, [destinationPolicy, sourcePolicy]);

  const awaitingSourceBranch = canSelectWorkplace && !sourceBranchId;
  const awaitingDestinationBranch = isBranchTransfer && !destinationBranchId;
  const sourcePolicyLoading =
    Boolean(sourceBranchId) && sourceBranchPolicyQuery.isPending;
  const destinationPolicyLoading =
    requiresDestinationPolicy && destinationBranchPolicyQuery.isPending;
  const policyIsLoading = sourcePolicyLoading || destinationPolicyLoading;

  const workplacePolicyDisplayMessage = useMemo(() => {
    if (
      awaitingSourceBranch ||
      awaitingDestinationBranch ||
      policyIsLoading ||
      !sourceBranchId
    ) {
      return '';
    }

    const messages: string[] = [];

    if (!sourcePolicy.canPunchTransactions) {
      messages.push(TRANSFER_FORM_TEXT.sourceBranchDayBlocked);
      if (sourcePolicy.helperText) {
        messages.push(sourcePolicy.helperText);
      }
    }

    if (destinationPolicy && !destinationPolicy.canPunchTransactions) {
      messages.push(TRANSFER_FORM_TEXT.destinationBranchDayBlocked);
      if (destinationPolicy.helperText) {
        messages.push(destinationPolicy.helperText);
      }
    }

    return messages.join(' ');
  }, [
    awaitingDestinationBranch,
    awaitingSourceBranch,
    destinationPolicy,
    policyIsLoading,
    sourceBranchId,
    sourcePolicy.canPunchTransactions,
    sourcePolicy.helperText,
  ]);

  const workplacePolicyBlocked =
    !awaitingSourceBranch &&
    !awaitingDestinationBranch &&
    !policyIsLoading &&
    Boolean(sourceBranchId) &&
    (!sourcePolicy.canPunchTransactions ||
      (destinationPolicy !== null && !destinationPolicy.canPunchTransactions));

  useEffect(() => {
    onWorkplacePolicyChange({
      isLoading: policyIsLoading,
      isBlocked: workplacePolicyBlocked,
      message: workplacePolicyDisplayMessage,
      combinedPolicy: transactionDatePolicy,
      awaitingSourceBranch,
      awaitingDestinationBranch,
    });
  }, [
    awaitingDestinationBranch,
    awaitingSourceBranch,
    onWorkplacePolicyChange,
    policyIsLoading,
    transactionDatePolicy,
    workplacePolicyBlocked,
    workplacePolicyDisplayMessage,
  ]);

  useEffect(() => {
    return () => {
      onWorkplacePolicyChange({
        isLoading: false,
        isBlocked: false,
        message: '',
        combinedPolicy: getTransactionDatePolicy(null),
        awaitingSourceBranch: false,
        awaitingDestinationBranch: false,
      });
    };
  }, [onWorkplacePolicyChange]);

  useEffect(() => {
    if (
      readOnly ||
      awaitingSourceBranch ||
      awaitingDestinationBranch ||
      policyIsLoading ||
      workplacePolicyBlocked
    ) {
      return;
    }

    const nextDate = transactionDatePolicy.defaultTransactionDate;
    if (!nextDate) {
      return;
    }

    form.setValue('transactionDate', nextDate, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [
    awaitingDestinationBranch,
    awaitingSourceBranch,
    form,
    policyIsLoading,
    readOnly,
    transactionDatePolicy.defaultTransactionDate,
    workplacePolicyBlocked,
  ]);

  const seriesCode = getTransferNumberSeriesCode(transferType);
  const { data: nextTransferNumber, error: nextTransferNumberError } =
    useTransactionNextNumber({
      slug: seriesCode,
      branchId: sourceBranchId,
      enabled: Boolean(sourceBranchId) && !readOnly,
    });

  const itemCurrencyIds = useMemo(
    () => (items ?? []).map(item => String(item?.currencyId ?? '')),
    [items]
  );
  const holdCostStatus = useTransferItemsHoldCostStatus({
    branchId: sourceBranchId || '',
    counterId: sourceCounterId || '',
    currencyIds: itemCurrencyIds,
    enabled: !readOnly,
  });

  const holdCostMessage = useMemo(() => {
    if (holdCostStatus.isLoading) {
      return TRANSFER_FORM_TEXT.holdCostLoading;
    }

    if (!holdCostStatus.hasUnavailableHoldCost) {
      return '';
    }

    const currencyLabels = holdCostStatus.unavailableCurrencyIds.map(
      currencyId => {
        const currency = (pricingData.currencies ?? []).find(
          item => item.id === currencyId
        );
        const itemCode = (items ?? []).find(
          item => item?.currencyId === currencyId
        )?.currencyCode;
        return (
          currency?.currencyCode ||
          itemCode ||
          currency?.currencyName ||
          currencyId
        );
      }
    );

    return currencyLabels.length > 0
      ? TRANSFER_FORM_TEXT.noClosingStockBalanceForCurrencies(currencyLabels)
      : TRANSFER_FORM_TEXT.noClosingStockBalance;
  }, [
    holdCostStatus.hasUnavailableHoldCost,
    holdCostStatus.isLoading,
    holdCostStatus.unavailableCurrencyIds,
    items,
    pricingData.currencies,
  ]);

  useEffect(() => {
    onHoldCostBlockChange({
      isLoading: holdCostStatus.isLoading,
      isBlocked: holdCostStatus.hasUnavailableHoldCost,
      message: holdCostMessage,
    });
  }, [
    holdCostMessage,
    holdCostStatus.hasUnavailableHoldCost,
    holdCostStatus.isLoading,
    onHoldCostBlockChange,
  ]);

  useEffect(() => {
    return () => {
      onHoldCostBlockChange({
        isLoading: false,
        isBlocked: false,
        message: '',
      });
    };
  }, [onHoldCostBlockChange]);

  const handleCurrencySelect = (currencies: ICurrencyProfile[]) => {
    const selectedCurrency = currencies[0];
    if (selectedCurrency === undefined || currencyPickerState === null) {
      return;
    }

    form.setValue(
      `items.${currencyPickerState.rowIndex}.currencyId`,
      selectedCurrency.id,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    );
    form.setValue(
      `items.${currencyPickerState.rowIndex}.currencyCode`,
      selectedCurrency.currencyCode,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
    form.setValue(
      `items.${currencyPickerState.rowIndex}.currencyName`,
      selectedCurrency.currencyName,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
    onCloseCurrencyPicker();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {readOnly
              ? 'Transfer Approval'
              : transferType === 'COUNTER'
                ? 'Counter Transfer'
                : 'Branch Transfer'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'Review the transfer request and accept or reject it from the destination side.'
              : 'Create a transfer request with source and destination counters, then accept it from the destination side.'}
          </p>
        </div>

        {!canSubmit && !readOnly ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {TRANSFER_FORM_TEXT.noCreatePermission}
          </div>
        ) : null}
        {!readOnly && workplacePolicyDisplayMessage ? (
          <div className="rounded-md border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            {workplacePolicyDisplayMessage}
          </div>
        ) : null}
        {!readOnly && holdCostStatus.hasUnavailableHoldCost && holdCostMessage ? (
          <div className="rounded-md border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            {holdCostMessage}
          </div>
        ) : null}

        <CardSection heading="Transfer Details">
          <div className="grid gap-4 md:grid-cols-2">
            <PurchaseReferenceNumberField
              value={displayNumber ?? nextTransferNumber?.nextNumber ?? ''}
              placeholder="Number will be generated"
              helperText={
                readOnly
                  ? 'Source transaction number. The destination purchase number is generated from the configured purchase series when accepted.'
                  : nextTransferNumberError instanceof Error
                    ? nextTransferNumberError.message
                    : 'Preview only. The number is reserved when the transfer is submitted.'
              }
            />
            <FormFieldDatePicker
              name="transactionDate"
              label="Transaction Date"
              placeholder="Select transaction date"
              disabled={
                readOnly ||
                awaitingSourceBranch ||
                awaitingDestinationBranch ||
                policyIsLoading ||
                workplacePolicyBlocked
              }
              minDate={transactionDatePolicy.minDate}
              maxDate={transactionDatePolicy.maxDate}
            />
            <FormFieldInput
              name="billReference"
              label="Bill Reference"
              placeholder="Enter bill reference"
              disabled={readOnly}
            />
          </div>
        </CardSection>

        <TransferWorkplaceFields
          transferType={transferType}
          readOnly={readOnly}
          readOnlyOptions={readOnlyOptions}
        />

        <TransferItemsFieldArray
          branchId=""
          counterId=""
          pricingData={pricingData}
          onOpenCurrencyPicker={onOpenCurrencyPicker}
          disabled={!canSubmit || readOnly}
          rateEditable={useTransferRateEditable}
        />
      </div>

      <SelectCurrencyProfiles
        open={currencyPickerState !== null}
        selectable
        multiple={false}
        title="Select Currency"
        description="Choose a single currency for the selected transfer row."
        allowedCurrencyIds={currencyPickerState?.allowedCurrencyIds}
        onContinue={handleCurrencySelect}
        onClose={onCloseCurrencyPicker}
      />
    </>
  );
};

interface TransferFormViewProps {
  transferType: TransferType;
  initialValues?: ITransferFormValues;
  readOnly?: boolean;
  footerActions?: ReactNode;
  onCancel?: () => void;
  showSubmit?: boolean;
  readOnlyOptions?: TransferWorkplaceReferenceOptions;
}

export const TransferFormView = ({
  transferType,
  initialValues,
  readOnly = false,
  footerActions,
  onCancel,
  showSubmit = true,
  readOnlyOptions,
}: TransferFormViewProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, activeBranchId, activeCounterId, policyContext } = useAuth();
  const transferPermission = usePermission(pathname);
  const { data: pricingData, isLoading, error } = useCurrencyRatesViewData();
  const { data: additionalSettings = [] } = useListAdditionalSettings();
  const [currencyPickerState, setCurrencyPickerState] = useState<{
    rowIndex: number;
    allowedCurrencyIds: string[];
  } | null>(null);
  const handleOpenCurrencyPicker = useCallback(
    (rowIndex: number, allowedCurrencyIds: string[]) => {
      setCurrencyPickerState({ rowIndex, allowedCurrencyIds });
    },
    []
  );
  const handleCloseCurrencyPicker = useCallback(() => {
    setCurrencyPickerState(null);
  }, []);
  const createCounterTransfer = useCreateCounterTransfer();
  const createBranchTransfer = useCreateBranchTransfer();
  const canSelectWorkplace = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  const [holdCostBlock, setHoldCostBlock] = useState<TransferHoldCostBlockState>(
    {
      isLoading: false,
      isBlocked: false,
      message: '',
    }
  );
  const handleHoldCostBlockChange = useCallback(
    (state: TransferHoldCostBlockState) => {
      setHoldCostBlock(state);
    },
    []
  );
  const [workplacePolicyBlock, setWorkplacePolicyBlock] =
    useState<TransferWorkplacePolicyBlockState>(() => ({
      isLoading: false,
      isBlocked: false,
      message: '',
      combinedPolicy: getTransactionDatePolicy(policyContext),
      awaitingSourceBranch: canSelectWorkplace && !readOnly,
      awaitingDestinationBranch: transferType === 'BRANCH' && !readOnly,
    }));
  const handleWorkplacePolicyChange = useCallback(
    (state: TransferWorkplacePolicyBlockState) => {
      setWorkplacePolicyBlock(state);
    },
    []
  );

  const canSubmit = Boolean(
    user &&
    (user.isAdmin ||
      user.isHo ||
      user.isHoStaff ||
      transferPermission.canAdd ||
      transferPermission.canModify)
  );
  const transferRateEditable = getAdditionalSettingBooleanValue(
    additionalSettings,
    AdditionalSettingsCodeEnum.TransferSettings,
    AdditionalSettingsCodeEnum.TransferRateEditable,
    false
  );
  const defaultTransactionDate = useMemo(() => {
    const sessionDefault = getTransactionDatePolicy(
      policyContext
    ).defaultTransactionDate;
    if (sessionDefault) {
      return sessionDefault;
    }

    if (canSelectWorkplace) {
      return new Date().toISOString().slice(0, 10);
    }

    return workplacePolicyBlock.combinedPolicy.defaultTransactionDate;
  }, [
    canSelectWorkplace,
    policyContext,
    workplacePolicyBlock.combinedPolicy.defaultTransactionDate,
  ]);

  const defaultValues = useMemo(
    () =>
      createEmptyTransferFormValues({
        transferType,
        transactionDate: defaultTransactionDate,
        sourceBranchId: canSelectWorkplace ? '' : (activeBranchId ?? ''),
        sourceCounterId: canSelectWorkplace ? '' : (activeCounterId ?? ''),
        destinationBranchId:
          transferType === 'COUNTER'
            ? canSelectWorkplace
              ? ''
              : (activeBranchId ?? '')
            : '',
        destinationCounterId: '',
      }),
    [
      activeBranchId,
      activeCounterId,
      canSelectWorkplace,
      transferType,
      defaultTransactionDate,
    ]
  );

  const submitMessage = useMemo(() => {
    const messages: string[] = [];

    if (!canSubmit) {
      messages.push(TRANSFER_FORM_TEXT.noCreatePermission);
    }

    if (workplacePolicyBlock.isBlocked && workplacePolicyBlock.message) {
      messages.push(workplacePolicyBlock.message);
    }

    if (holdCostBlock.isBlocked && holdCostBlock.message) {
      messages.push(holdCostBlock.message);
    }

    return messages.join(' ');
  }, [
    canSubmit,
    holdCostBlock.isBlocked,
    holdCostBlock.message,
    workplacePolicyBlock.isBlocked,
    workplacePolicyBlock.message,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    );
  }

  if (!pricingData) {
    return (
      <div className="py-8 text-center text-text-secondary">
        No pricing data found.
      </div>
    );
  }

  return (
    <Form<ITransferFormValues>
      id="transfer-form"
      defaultValues={initialValues ?? defaultValues}
      resolver={
        yupResolver(transferRequestSchema) as Resolver<ITransferFormValues>
      }
      mode="onChange"
      footer={{
        submitLabel:
          transferType === 'COUNTER'
            ? 'Create Counter Transfer'
            : 'Create Branch Transfer',
        onCancel:
          onCancel ??
          (() => navigate(`/transfer/${transferType.toLowerCase()}`)),
        isSubmitDisabled:
          !canSubmit ||
          readOnly ||
          workplacePolicyBlock.awaitingSourceBranch ||
          workplacePolicyBlock.awaitingDestinationBranch ||
          workplacePolicyBlock.isLoading ||
          workplacePolicyBlock.isBlocked ||
          holdCostBlock.isBlocked ||
          holdCostBlock.isLoading,
        showSubmit: showSubmit && !readOnly,
        submitMessage: submitMessage || undefined,
        actions: footerActions,
      }}
      onError={errors => {
        console.error('[TransferForm] validation failed', {
          transferType,
          errors,
        });
      }}
      onSubmit={async values => {
        const payload = mapTransferFormValuesToPayload({
          ...values,
          transferType,
        });

        console.debug('[TransferForm] submitting transfer', {
          transferType,
          values,
          payload,
        });

        if (readOnly) {
          return;
        }

        if (
          workplacePolicyBlock.awaitingSourceBranch ||
          workplacePolicyBlock.awaitingDestinationBranch ||
          workplacePolicyBlock.isLoading ||
          workplacePolicyBlock.isBlocked ||
          holdCostBlock.isBlocked ||
          holdCostBlock.isLoading
        ) {
          return;
        }

        try {
          if (transferType === 'COUNTER') {
            await createCounterTransfer.createCounterTransfer(payload);
          } else {
            await createBranchTransfer.createBranchTransfer(payload);
          }
          navigate(`/transfer/${transferType.toLowerCase()}`);
        } catch (error) {
          console.error('[TransferForm] transfer submission failed', {
            transferType,
            error,
          });
          // toast handled by hooks
        }
      }}
    >
      <TransferFormBody
        transferType={transferType}
        pricingData={pricingData}
        canSubmit={canSubmit}
        canSelectWorkplace={canSelectWorkplace}
        currencyPickerState={currencyPickerState}
        onOpenCurrencyPicker={handleOpenCurrencyPicker}
        onCloseCurrencyPicker={handleCloseCurrencyPicker}
        readOnly={readOnly}
        displayNumber={initialValues?.number}
        readOnlyOptions={readOnlyOptions}
        useTransferRateEditable={transferRateEditable}
        onHoldCostBlockChange={handleHoldCostBlockChange}
        onWorkplacePolicyChange={handleWorkplacePolicyChange}
      />
    </Form>
  );
};

export default TransferFormView;
