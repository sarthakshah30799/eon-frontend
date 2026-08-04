import { useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Loader } from '@/components/ui/loader';
import { CardSection } from '@/components/ui';
import { Form, FormFieldDatePicker, FormFieldInput } from '@/components/forms';
import { PurchaseReferenceNumberField } from '@/modules/purchase/components/PurchaseReferenceNumberField';
import { useAuth } from '@/lib/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { useCurrencyRatesViewData } from '@/modules/currencyRates/hooks/useCurrencyRatesViewData';
import { useTransactionNextNumber } from '@/modules/transactions/hooks';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types/currencyProfileTypes';
import { useCreateBranchTransfer, useCreateCounterTransfer } from '../hooks';
import type { ITransferFormValues, TransferType } from '../types';
import { transferRequestSchema } from '../schema/transferRequestSchema';
import {
  createEmptyTransferFormValues,
  mapTransferFormValuesToPayload,
} from '../utils/transferFormUtils';
import { getTransferNumberSeriesCode } from '../utils';
import {
  TransferWorkplaceFields,
  type TransferWorkplaceReferenceOptions,
} from '../components/TransferWorkplaceFields';
import { TransferItemsFieldArray } from '../components/TransferItemsFieldArray';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { getAdditionalSettingBooleanValue } from '@/modules/additionalSettings/utils';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';

const today = new Date().toISOString().slice(0, 10);

interface TransferFormBodyProps {
  transferType: TransferType;
  pricingData: NonNullable<ReturnType<typeof useCurrencyRatesViewData>['data']>;
  canSubmit: boolean;
  currencyPickerRowIndex: number | null;
  setCurrencyPickerRowIndex: (value: number | null) => void;
  readOnly: boolean;
  useTransferRateEditable: boolean;
  displayNumber?: string;
  readOnlyOptions?: TransferWorkplaceReferenceOptions;
}

const TransferFormBody = ({
  transferType,
  pricingData,
  canSubmit,
  currencyPickerRowIndex,
  setCurrencyPickerRowIndex,
  readOnly,
  displayNumber,
  readOnlyOptions,
  useTransferRateEditable,
}: TransferFormBodyProps) => {
  const form = useFormContext<ITransferFormValues>();
  const sourceBranchId = form.watch('sourceBranchId');
  const seriesCode = getTransferNumberSeriesCode(transferType);
  const { data: nextTransferNumber, error: nextTransferNumberError } =
    useTransactionNextNumber({
      slug: seriesCode,
      branchId: sourceBranchId,
      enabled: Boolean(sourceBranchId) && !readOnly,
    });

  const handleCurrencySelect = (currencies: ICurrencyProfile[]) => {
    const selectedCurrency = currencies[0];
    if (selectedCurrency === undefined || currencyPickerRowIndex === null) {
      return;
    }

    form.setValue(
      `items.${currencyPickerRowIndex}.currencyId`,
      selectedCurrency.id,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }
    );
    form.setValue(
      `items.${currencyPickerRowIndex}.currencyCode`,
      selectedCurrency.currencyCode,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
    form.setValue(
      `items.${currencyPickerRowIndex}.currencyName`,
      selectedCurrency.currencyName,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
    setCurrencyPickerRowIndex(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {readOnly ? 'Transfer Approval' : transferType === 'COUNTER' ? 'Counter Transfer' : 'Branch Transfer'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'Review the transfer request and accept or reject it from the destination side.'
              : 'Create a transfer request with source and destination counters, then accept it from the destination side.'}
          </p>
        </div>

        {!canSubmit && !readOnly ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You do not have permission to create transfers for this page.
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
              disabled={readOnly}
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
          onOpenCurrencyPicker={setCurrencyPickerRowIndex}
          disabled={!canSubmit || readOnly}
          rateEditable={useTransferRateEditable}
        />
      </div>

      <SelectCurrencyProfiles
        open={currencyPickerRowIndex !== null}
        selectable
        multiple={false}
        title="Select Currency"
        description="Choose a single currency for the selected transfer row."
        onContinue={handleCurrencySelect}
        onClose={() => setCurrencyPickerRowIndex(null)}
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
  const { user, activeBranchId, activeCounterId } = useAuth();
  const transferPermission = usePermission(pathname);
  const { data: pricingData, isLoading, error } = useCurrencyRatesViewData();
  const { data: additionalSettings = [] } = useListAdditionalSettings();
  const [currencyPickerRowIndex, setCurrencyPickerRowIndex] = useState<number | null>(null);
  const createCounterTransfer = useCreateCounterTransfer();
  const createBranchTransfer = useCreateBranchTransfer();

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
    false,
  );

  const defaultValues = useMemo(
    () =>
      createEmptyTransferFormValues({
        transferType,
        transactionDate: today,
        sourceBranchId: activeBranchId ?? '',
        sourceCounterId: activeCounterId ?? '',
        destinationBranchId: transferType === 'COUNTER' ? (activeBranchId ?? '') : '',
        destinationCounterId: '',
      }),
    [activeBranchId, activeCounterId, transferType]
  );

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
      resolver={yupResolver(transferRequestSchema) as Resolver<ITransferFormValues>}
      mode="onChange"
      footer={{
        submitLabel:
          transferType === 'COUNTER' ? 'Create Counter Transfer' : 'Create Branch Transfer',
        onCancel: onCancel ?? (() => navigate(`/transfer/${transferType.toLowerCase()}`)),
        isSubmitDisabled: !canSubmit || readOnly,
        showSubmit: showSubmit && !readOnly,
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
        currencyPickerRowIndex={currencyPickerRowIndex}
        setCurrencyPickerRowIndex={setCurrencyPickerRowIndex}
        readOnly={readOnly}
        displayNumber={initialValues?.number}
        readOnlyOptions={readOnlyOptions}
        useTransferRateEditable={transferRateEditable}
      />
    </Form>
  );
};

export default TransferFormView;
