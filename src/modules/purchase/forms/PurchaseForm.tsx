import { useMemo, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { CardSection } from '@/components/ui';
import { Form, FormFieldInput } from '@/components/forms';
import { TransactionAdditionalChargesFieldArray } from '@/components/forms';
import { TransactionPaymentDetailsFieldArray } from '@/components/forms';
import { documentProfileApi } from '@/api/documentProfile';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components/DocumentRequirementCard';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import type { PartyProfileType } from '@/modules/partyProfiles/constants';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { getPurchasePageTitle } from '@/pages/purchase/[slug]/purchasePage.enum';
import type {
  IPurchaseDraftDocumentAttachment,
  IPurchaseFormValues,
  IPurchasePricingData,
} from '../types/purchaseTypes';
import { purchaseFormSchema } from '../schema/purchaseSchema';
import { PurchaseAgentProfileField } from '../components/PurchaseAgentProfileField';
import { PurchaseBookReferenceField } from '../components/PurchaseBookReferenceField';
import { PurchasePartyProfileField } from '../components/PurchasePartyProfileField';
import { PurchaseTransactionTable } from '../components/PurchaseTransactionTable';
import { calculatePurchasePayableTotal } from '../utils/purchaseUtils';

interface PurchaseFormProps {
  purchasePageType: PurchasePageType | null;
  defaultValues: IPurchaseFormValues;
  pricingData: IPurchasePricingData;
  partyProfileTypes: PartyProfileType[];
  requiresApproval: boolean;
  branchId?: string;
  branchCode?: string;
  isSubmitting?: boolean;
  onSubmit: (
    values: IPurchaseFormValues,
    attachments: IPurchaseDraftDocumentAttachment[]
  ) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

interface PurchaseFormBodyProps {
  purchasePageType: PurchasePageType | null;
  pricingData: IPurchasePricingData;
  partyProfileTypes: PartyProfileType[];
  requiresApproval: boolean;
  branchId: string;
  branchCode: string;
  isSubmitting: boolean;
  draftDocuments: Record<string, File | null>;
  onSelectDraftDocument: (documentProfileId: string, file: File) => void | Promise<void>;
  onClearDraftDocument: (documentProfileId: string) => void | Promise<void>;
}

const PurchaseFormBody = ({
  purchasePageType,
  pricingData,
  partyProfileTypes,
  requiresApproval,
  branchId,
  branchCode,
  isSubmitting,
  draftDocuments,
  onSelectDraftDocument,
  onClearDraftDocument,
}: PurchaseFormBodyProps) => {
  const form = useFormContext<IPurchaseFormValues>();
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
  const { data: documentProfiles = [] } = useQuery({
    queryKey: ['purchase-transaction-document-profiles', purchasePageType],
    queryFn: () =>
      documentProfileApi.resolveDocumentProfiles({
        specificationType: 'TRANSACTION',
        type: purchasePageType ?? undefined,
      }),
    enabled: Boolean(purchasePageType),
  });
  const transactionDocumentProfiles = documentProfiles;
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
      calculatePurchasePayableTotal(
        (transactions ?? []) as Array<{ total?: string | null }>,
        (additionalCharges ?? []) as Array<{
          totalAmount?: string | null;
          amount?: string | null;
        }>
      ),
    [additionalCharges, transactions]
  );

  const pageTitle = useMemo(
    () => getPurchasePageTitle(purchasePageType),
    [purchasePageType]
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
          <PurchasePartyProfileField
            partyProfileTypes={partyProfileTypes}
            disabled={isSubmitting}
          />

          <PurchaseAgentProfileField disabled={isSubmitting} />

          <FormFieldInput
            name="number"
            label="Number"
            placeholder={branchCode ? `${branchCode}-00000000` : '00000000'}
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Manual Book Reference">
        <PurchaseBookReferenceField branchId={branchId} disabled={isSubmitting} />
      </CardSection>

      <PurchaseTransactionTable
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

      <CardSection
        heading="Transaction Documents"
        className="space-y-4"
      >
        <p className="text-sm text-text-secondary">
          Attach any transaction documents now.
          {requiresApproval
            ? ' They will be saved together with the draft.'
            : ' They will be saved with the transaction.'}
        </p>

        {transactionDocumentProfiles.length > 0 ? (
          <div className="grid gap-4">
            {transactionDocumentProfiles.map(profile => (
              <DocumentRequirementCard
                key={profile.id}
                profile={profile}
                disabled={isSubmitting}
                selectedFile={draftDocuments[profile.id] ?? null}
                onSelectFile={onSelectDraftDocument}
                onClearFile={onClearDraftDocument}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border-primary bg-surface-primary px-4 py-4 shadow-sm">
            <p className="text-sm text-text-secondary">
              No active transaction document profiles were found.
            </p>
          </div>
        )}
      </CardSection>

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

export const PurchaseForm = ({
  purchasePageType,
  defaultValues,
  pricingData,
  partyProfileTypes,
  requiresApproval,
  branchId = '',
  branchCode = '',
  isSubmitting = false,
  onSubmit,
  onCancel,
  submitLabel = 'Save Draft',
}: PurchaseFormProps) => {
  const [draftDocuments, setDraftDocuments] = useState<Record<string, File | null>>({});

  const handleSelectDraftDocument = async (documentProfileId: string, file: File) => {
    setDraftDocuments(prev => ({
      ...prev,
      [documentProfileId]: file,
    }));
  };

  const handleClearDraftDocument = async (documentProfileId: string) => {
    setDraftDocuments(prev => {
      const next = { ...prev };
      delete next[documentProfileId];
      return next;
    });
  };

  const draftDocumentAttachments = useMemo<IPurchaseDraftDocumentAttachment[]>(
    () =>
      Object.entries(draftDocuments).flatMap(([documentProfileId, file]) => {
        if (!file) {
          return [];
        }

        return [{ documentProfileId, file }];
      }),
    [draftDocuments]
  );

  return (
    <Form<IPurchaseFormValues>
      id="purchase-form"
      onSubmit={values => onSubmit(values, draftDocumentAttachments)}
      resolver={yupResolver(purchaseFormSchema) as Resolver<IPurchaseFormValues>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: onCancel,
        onCancel,
      }}
    >
      <PurchaseFormBody
        purchasePageType={purchasePageType}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        requiresApproval={requiresApproval}
        branchId={branchId}
        branchCode={branchCode}
        isSubmitting={isSubmitting}
        draftDocuments={draftDocuments}
        onSelectDraftDocument={handleSelectDraftDocument}
        onClearDraftDocument={handleClearDraftDocument}
      />
    </Form>
  );
};

export default PurchaseForm;
