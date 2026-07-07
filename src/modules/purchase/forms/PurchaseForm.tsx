import { useMemo, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, CardSection } from '@/components/ui';
import { Form, FormFieldInput } from '@/components/forms';
import { TransactionAdditionalChargesFieldArray } from '@/components/forms';
import { TransactionPaymentDetailsFieldArray } from '@/components/forms';
import { documentProfileApi } from '@/api/documentProfile';
import { transactionsApi } from '@/api/transactions';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components/DocumentRequirementCard';
import type { IDocumentProfileFile } from '@/modules/documentProfiles/types';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import { getAdditionalSettingTextValue } from '@/modules/additionalSettings/utils';
import { useGetPartyProfile } from '@/modules/partyProfiles/hooks';
import type { PartyProfileType } from '@/modules/partyProfiles/constants';
import type { PurchasePageType } from '@/pages/purchase/[slug]/purchasePage.enum';
import { getPurchasePageTitle } from '@/pages/purchase/[slug]/purchasePage.enum';
import type {
  IPurchaseDraftDocumentAttachment,
  IPurchaseFormValues,
  IPurchasePricingData,
  IPurchaseTransactionDocument,
} from '../types/purchaseTypes';
import { purchaseFormSchema } from '../schema/purchaseSchema';
import { PurchaseAgentProfileField } from '../components/PurchaseAgentProfileField';
import { PurchaseBookReferenceField } from '../components/PurchaseBookReferenceField';
import { PurchasePartyProfileField } from '../components/PurchasePartyProfileField';
import { PurchaseTransactionTable } from '../components/PurchaseTransactionTable';
import { calculatePurchasePayableTotal } from '../utils/purchaseUtils';
import {
  buildPurchasePrintHtml,
  getPurchasePrintCopyLabel,
} from '../utils/purchasePrintUtils';

interface PurchaseFormProps {
  purchasePageType: PurchasePageType | null;
  defaultValues: IPurchaseFormValues;
  pricingData: IPurchasePricingData;
  partyProfileTypes: PartyProfileType[];
  requiresApproval: boolean;
  branchId?: string;
  branchCode?: string;
  savedTransactionId?: string | null;
  savedTransactionNumber?: string | null;
  isFreshlyCreated?: boolean;
  readOnly?: boolean;
  isSubmitting?: boolean;
  existingDocuments?: IPurchaseTransactionDocument[];
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
  savedTransactionId: string | null;
  savedTransactionNumber: string | null;
  isFreshlyCreated: boolean;
  isSubmitting: boolean;
  readOnly: boolean;
  draftDocuments: Record<string, File | null>;
  existingDocuments: IPurchaseTransactionDocument[];
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
  savedTransactionId,
  savedTransactionNumber,
  isFreshlyCreated,
  isSubmitting,
  readOnly,
  draftDocuments,
  existingDocuments,
  onSelectDraftDocument,
  onClearDraftDocument,
}: PurchaseFormBodyProps) => {
  const form = useFormContext<IPurchaseFormValues>();
  const [currencyPickerRowIndex, setCurrencyPickerRowIndex] = useState<
    number | null
  >(null);
  const [hasPrintedOnce, setHasPrintedOnce] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const isReadOnly = isSubmitting || readOnly;
  const partyProfileApplyTax = useWatch({
    control: form.control,
    name: 'partyProfileApplyTax',
  });
  const agentProfileId = useWatch({
    control: form.control,
    name: 'agentProfileId',
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
  const { data: agentProfile } = useGetPartyProfile(
    String(agentProfileId || ''),
    'AGENT',
    Boolean(agentProfileId)
  );
  const { data: branchProfile } = useGetBranchProfile(branchId);
  const { data: companies = [] } = useListCompanyProfiles();
  const { data: additionalSettings = [] } = useListAdditionalSettings();
  const agentCommissionRules = useMemo(
    () => (agentProfileId ? agentProfile?.commissionRules ?? [] : []),
    [agentProfile?.commissionRules, agentProfileId]
  );
  const transactionDocumentProfiles = documentProfiles;
  const existingDocumentsByProfileId = useMemo(
    () =>
      new Map(
        existingDocuments.map(document => [
          document.documentProfileId,
          document,
        ])
      ),
    [existingDocuments]
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
      calculatePurchasePayableTotal(
        (transactions ?? []) as Array<{ total?: string | null }>,
        (additionalCharges ?? []) as Array<{
          totalAmount?: string | null;
          amount?: string | null;
        }>
      ),
    [additionalCharges, transactions]
  );
  const getDocumentLabel = (document: IPurchaseTransactionDocument) => {
    const snapshot = document.documentProfileSnapshot as
      | { label?: unknown; name?: unknown }
      | null
      | undefined;

    return (
      String(snapshot?.label ?? snapshot?.name ?? '') ||
      document.fileName ||
      document.originalFileName ||
      'Document'
    );
  };
  const getDocumentDownloadUrl = (document: IPurchaseTransactionDocument) => {
    if (!savedTransactionId) {
      return document.storageUrl ?? undefined;
    }

    return transactionsApi.getTransactionDocumentDownloadUrl(
      savedTransactionId,
      document.id
    );
  };

  const pageTitle = useMemo(
    () => getPurchasePageTitle(purchasePageType),
    [purchasePageType]
  );
  const currentCompany = useMemo(() => {
    const now = new Date();

    const activeCompany = companies.find(company => {
      const fromDate = company.fromDate ? new Date(company.fromDate) : null;
      const toDate = company.toDate ? new Date(company.toDate) : null;

      if (fromDate && now < fromDate) {
        return false;
      }

      if (toDate && now > toDate) {
        return false;
      }

      return true;
    });

    return activeCompany ?? companies[0] ?? null;
  }, [companies]);
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
  const canPrint = Boolean(savedTransactionId && savedTransactionNumber);

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

  const getDocumentFile = (
    document: IPurchaseTransactionDocument
  ): IDocumentProfileFile => ({
    fileName: getDocumentLabel(document),
    mimeType: document.mimeType || 'application/octet-stream',
    sizeBytes: Number(document.fileSize || 0) || 0,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  });

  const handlePrintCopy = async () => {
    if (!savedTransactionId || !savedTransactionNumber) {
      toast.error('Save the transaction before printing.');
      return;
    }

    if (isPrinting) {
      return;
    }

    try {
      setIsPrinting(true);
      const copyType =
        !hasPrintedOnce && isFreshlyCreated ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';
      const html = buildPurchasePrintHtml({
        copyType,
        transactionNumber: savedTransactionNumber,
        transactionDate: new Date(),
        company: currentCompany,
        branch: branchProfile ?? null,
        transaction: form.getValues(),
        sacCode,
      });

      await transactionsApi.recordPrint(savedTransactionId, {
        copyType,
        subject: `${savedTransactionNumber} - ${getPurchasePrintCopyLabel(copyType)}`,
        text: `Printed ${getPurchasePrintCopyLabel(copyType).toLowerCase()} for transaction ${savedTransactionNumber}.`,
        html,
        sendEmail: false,
      });

      const printWindow = window.open('', '_blank', 'width=1200,height=900');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow pop-ups and try again.');
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      window.setTimeout(() => {
        printWindow.print();
      }, 250);

      setHasPrintedOnce(true);
      toast.success(`${getPurchasePrintCopyLabel(copyType)} sent to printer`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to print transaction copy');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <CardSection heading={pageTitle}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PurchasePartyProfileField
            partyProfileTypes={partyProfileTypes}
            disabled={isReadOnly}
          />

          <PurchaseAgentProfileField disabled={isReadOnly} />

          <FormFieldInput
            name="number"
            label="Number"
            placeholder={branchCode ? `${branchCode}-00000000` : '00000000'}
            disabled={isReadOnly}
          />
        </div>
      </CardSection>

      <CardSection heading="Manual Book Reference">
        <PurchaseBookReferenceField branchId={branchId} disabled={isReadOnly} />
      </CardSection>

      <PurchaseTransactionTable
        pricingData={pricingData}
        onOpenCurrencyPicker={setCurrencyPickerRowIndex}
        disabled={isReadOnly}
        agentCommissionRules={agentCommissionRules}
      />

      <TransactionAdditionalChargesFieldArray
        name="additionalCharges"
        applyTax={Boolean(partyProfileApplyTax)}
        accountQuery={additionalChargeAccountQuery}
        disabled={isReadOnly}
        title="Additional Charges"
        description="Add optional charges for this transaction. Only bulk purchase accounts are shown."
      />

      <TransactionPaymentDetailsFieldArray
        name="paymentDetails"
        maxAmount={totalPayableAmount}
        accountQuery={paymentAccountQuery}
        disabled={isReadOnly}
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
            {transactionDocumentProfiles.map(profile => {
              const existingDocument = existingDocumentsByProfileId.get(profile.id);

              return (
              <DocumentRequirementCard
                key={profile.id}
                profile={
                  existingDocument
                    ? {
                        ...profile,
                        documentFile: getDocumentFile(existingDocument),
                      }
                    : profile
                }
                disabled={isReadOnly}
                selectedFile={draftDocuments[profile.id] ?? null}
                onSelectFile={onSelectDraftDocument}
                onClearFile={onClearDraftDocument}
                downloadUrl={
                  existingDocument ? getDocumentDownloadUrl(existingDocument) : undefined
                }
              />
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border-primary bg-surface-primary px-4 py-4 shadow-sm">
            <p className="text-sm text-text-secondary">
              No active transaction document profiles were found.
            </p>
          </div>
        )}

      </CardSection>

      {canPrint ? (
        <CardSection heading="Print Copy" className="space-y-4">
          <p className="text-sm text-text-secondary">
            {hasPrintedOnce || !isFreshlyCreated
              ? 'Print the duplicate copy for this saved transaction.'
              : 'Print the original copy for this newly saved transaction.'}
          </p>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => void handlePrintCopy()}
            disabled={isPrinting}
          >
            {isPrinting ? 'Preparing Print...' : 'Print Copy'}
          </Button>
        </CardSection>
      ) : null}

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
  savedTransactionId = null,
  savedTransactionNumber = null,
  isFreshlyCreated = false,
  readOnly = false,
  isSubmitting = false,
  existingDocuments = [],
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
        showSubmit: !readOnly,
      }}
    >
      <PurchaseFormBody
        purchasePageType={purchasePageType}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        requiresApproval={requiresApproval}
        branchId={branchId}
        branchCode={branchCode}
        savedTransactionId={savedTransactionId}
        savedTransactionNumber={savedTransactionNumber}
        isFreshlyCreated={isFreshlyCreated}
        isSubmitting={isSubmitting || readOnly}
        readOnly={readOnly}
        draftDocuments={draftDocuments}
        existingDocuments={existingDocuments ?? []}
        onSelectDraftDocument={handleSelectDraftDocument}
        onClearDraftDocument={handleClearDraftDocument}
      />
    </Form>
  );
};

export default PurchaseForm;
