import { useMemo, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CardSection } from '@/components/ui';
import { Form, FormFieldInput } from '@/components/forms';
import { TransactionAdditionalChargesFieldArray } from '@/components/forms';
import { TransactionPaymentDetailsFieldArray } from '@/components/forms';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import type { PartyProfileType } from '@/modules/partyProfiles/constants';
import type { BuyFromPageType } from '@/pages/buy-from/[slug]/buyFromPage.enum';
import { getBuyFromPageTitle } from '@/pages/buy-from/[slug]/buyFromPage.enum';
import type {
  IBuyFromFormValues,
  IBuyFromPricingData,
} from '../types/buyFromTypes';
import { buyFromFormSchema } from '../schema/buyFromSchema';
import { BuyFromAgentProfileField } from '../components/BuyFromAgentProfileField';
import { BuyFromBookReferenceField } from '../components/BuyFromBookReferenceField';
import { BuyFromPartyProfileField } from '../components/BuyFromPartyProfileField';
import { BuyFromTransactionTable } from '../components/BuyFromTransactionTable';
import { calculateBuyFromPayableTotal } from '../utils/buyFromUtils';

interface BuyFromFormProps {
  buyFromPageType: BuyFromPageType | null;
  defaultValues: IBuyFromFormValues;
  pricingData: IBuyFromPricingData;
  partyProfileTypes: PartyProfileType[];
  branchId?: string;
  branchCode?: string;
  isSubmitting?: boolean;
  onSubmit: (values: IBuyFromFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

interface BuyFromFormBodyProps {
  buyFromPageType: BuyFromPageType | null;
  pricingData: IBuyFromPricingData;
  partyProfileTypes: PartyProfileType[];
  branchId: string;
  branchCode: string;
  isSubmitting: boolean;
}

const BuyFromFormBody = ({
  buyFromPageType,
  pricingData,
  partyProfileTypes,
  branchId,
  branchCode,
  isSubmitting,
}: BuyFromFormBodyProps) => {
  const form = useFormContext<IBuyFromFormValues>();
  const [currencyPickerRowIndex, setCurrencyPickerRowIndex] = useState<
    number | null
  >(null);
  const partyProfileApplyTax = useWatch({
    control: form.control,
    name: 'partyProfileApplyTax',
  });
  const additionalChargeAccountQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      active: true,
      bulkPurchase: true,
    }),
    []
  );
  const paymentAccountQuery = useMemo(
    () => ({
      page: 1,
      limit: 100,
      active: true,
    }),
    []
  );
  const transactions = useWatch({
    control: form.control,
    name: 'transactions',
  });
  const additionalCharges = useWatch({
    control: form.control,
    name: 'additionalCharges',
  });
  const totalPayableAmount = useMemo(
    () =>
      calculateBuyFromPayableTotal(
        (transactions ?? []) as Array<{ total?: string | null }>,
        (additionalCharges ?? []) as Array<{
          totalAmount?: string | null;
          amount?: string | null;
        }>
      ),
    [additionalCharges, transactions]
  );

  const pageTitle = useMemo(
    () => getBuyFromPageTitle(buyFromPageType),
    [buyFromPageType]
  );

  const handleCurrencySelect = (
    currencies: Array<{
      id: string;
      currencyCode: string;
      currencyName: string;
    }>
  ) => {
    const selectedCurrency = currencies[0];
    if (selectedCurrency === undefined || currencyPickerRowIndex === null) {
      return;
    }

    const rowIndex = currencyPickerRowIndex;
    form.setValue(`transactions.${rowIndex}.currencyId`, selectedCurrency.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    form.setValue(
      `transactions.${rowIndex}.currencyCode`,
      selectedCurrency.currencyCode,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
    form.setValue(
      `transactions.${rowIndex}.currencyName`,
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
      <CardSection heading={pageTitle}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <BuyFromPartyProfileField
            partyProfileTypes={partyProfileTypes}
            disabled={isSubmitting}
          />

          <BuyFromAgentProfileField disabled={isSubmitting} />

          <FormFieldInput
            name="number"
            label="Number"
            placeholder={branchCode ? `${branchCode}-00000000` : '00000000'}
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Manual Book Reference">
        <BuyFromBookReferenceField branchId={branchId} disabled={isSubmitting} />
      </CardSection>

      <BuyFromTransactionTable
        pricingData={pricingData}
        onOpenCurrencyPicker={setCurrencyPickerRowIndex}
        disabled={isSubmitting}
      />

      <TransactionAdditionalChargesFieldArray
        name="additionalCharges"
        applyTax={Boolean(partyProfileApplyTax)}
        accountQuery={additionalChargeAccountQuery}
        disabled={isSubmitting}
        title="Additional Charges"
        description="Add optional charges for this transaction. Only bulk purchase accounts are shown."
      />

      <TransactionPaymentDetailsFieldArray
        name="paymentDetails"
        maxAmount={totalPayableAmount}
        accountQuery={paymentAccountQuery}
        disabled={isSubmitting}
        title="Payment Details"
        description="Store how this transaction will be settled. Payment amounts cannot exceed the total payable amount."
      />

      <SelectCurrencyProfiles
        open={currencyPickerRowIndex !== null}
        selectable
        multiple={false}
        title="Select Currency"
        description="Choose a single currency for the selected transaction row."
        onContinue={handleCurrencySelect}
        onClose={() => setCurrencyPickerRowIndex(null)}
      />
    </>
  );
};

export const BuyFromForm = ({
  buyFromPageType,
  defaultValues,
  pricingData,
  partyProfileTypes,
  branchId = '',
  branchCode = '',
  isSubmitting = false,
  onSubmit,
  onCancel,
  submitLabel = 'Save Draft',
}: BuyFromFormProps) => {
  return (
    <Form<IBuyFromFormValues>
      id="buy-from-form"
      onSubmit={onSubmit}
      resolver={yupResolver(buyFromFormSchema) as Resolver<IBuyFromFormValues>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: onCancel,
        onCancel,
      }}
    >
      <BuyFromFormBody
        buyFromPageType={buyFromPageType}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        branchId={branchId}
        branchCode={branchCode}
        isSubmitting={isSubmitting}
      />
    </Form>
  );
};

export default BuyFromForm;
