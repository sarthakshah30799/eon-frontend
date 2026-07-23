import { useEffect, useMemo, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, CardSection } from '@/components/ui';
import { Form } from '@/components/forms';
import { FormFieldCategoryOption } from '@/components/forms';
import { TransactionAdditionalChargesFieldArray } from '@/components/forms';
import { TransactionPaymentDetailsFieldArray } from '@/components/forms';
import { documentProfileApi } from '@/api/documentProfile';
import { transactionsApi } from '@/api/transactions';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components/DocumentRequirementCard';
import type { IDocumentProfileFile } from '@/modules/documentProfiles/types';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { useGetPartyProfile } from '@/modules/partyProfiles/hooks';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import {
  getPurchasePageEntityType,
  getPurchasePageTitle,
  type PurchasePageType,
} from '@/pages/purchase/[slug]/purchasePage.enum';
import type {
  IPurchaseDraftDocumentAttachment,
  IPurchaseFormValues,
  IPurchasePricingData,
  IPurchaseTransactionDocument,
} from '../types/purchaseTypes';
import type { ITransactionEntity } from '@/modules/transactions';
import { createPurchaseFormSchema } from '../schema/purchaseSchema';
import { PurchaseAgentProfileField } from '../components/PurchaseAgentProfileField';
import { PurchaseBookReferenceField } from '../components/PurchaseBookReferenceField';
import { PurchasePartyProfileField } from '../components/PurchasePartyProfileField';
import { PurchaseReferenceNumberField } from '../components/PurchaseReferenceNumberField';
import { PurchaseWorkplaceFields } from '../components/PurchaseWorkplaceFields';
import { PurchaseTransactionTable } from '../components/PurchaseTransactionTable';
import {
  buildPurchasePrintHtml,
  getPurchasePrintCopyLabel,
} from '../utils/purchasePrintUtils';
import { TransactionLogActionEnum } from '@/modules/transactions';
import { PassengerAmlVerificationModal } from '@/modules/passengers/components';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import type { ITransactionTaxPreviewResponse } from '@/modules/transactions';

const ACCOUNT_PROFILE_OPTION_PAGE_SIZE = 30;

const hasNumericPreviewValue = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return normalized !== '' && Number.isFinite(Number(normalized));
};

const buildPreviewNumericValue = (value: unknown) => {
  const normalized = String(value ?? '').trim();
  return hasNumericPreviewValue(normalized) ? normalized : null;
};

interface PurchaseFormProps {
  purchasePageType: PurchasePageType | null;
  defaultValues: IPurchaseFormValues;
  pricingData: IPurchasePricingData;
  partyProfileTypes: PartyProfileType[];
  requiresApproval: boolean;
  cashControlAccountId?: string;
  handlingFeeControlAccountId?: string;
  branchId?: string;
  branchCode?: string;
  sacCode?: string | null;
  savedTransaction?: ITransactionEntity | null;
  gstRatePercent: string;
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
  cashControlAccountId?: string;
  handlingFeeControlAccountId?: string;
  branchId: string;
  branchCode: string;
  sacCode: string;
  savedTransaction: ITransactionEntity | null;
  gstRatePercent: string;
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
  cashControlAccountId,
  handlingFeeControlAccountId,
  branchId,
  sacCode,
  savedTransaction,
  gstRatePercent,
  branchCode: _branchCode,
  isFreshlyCreated: _isFreshlyCreated,
  isSubmitting,
  readOnly,
  draftDocuments,
  existingDocuments,
  onSelectDraftDocument,
  onClearDraftDocument,
}: PurchaseFormBodyProps) => {
  void _branchCode;
  void _isFreshlyCreated;
  const form = useFormContext<IPurchaseFormValues>();
  const [currencyPickerRowIndex, setCurrencyPickerRowIndex] = useState<
    number | null
  >(null);
  const [isPassengerAmlModalOpen, setIsPassengerAmlModalOpen] = useState(false);
  const [hasPrintedOnce, setHasPrintedOnce] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const isReadOnly = isSubmitting || readOnly;
  const partyProfileApplyTax = useWatch({
    control: form.control,
    name: 'partyProfileApplyTax',
  });
  const partyProfileId = useWatch({
    control: form.control,
    name: 'partyProfileId',
  });
  const agentProfileId = useWatch({
    control: form.control,
    name: 'agentProfileId',
  });
  const cashierUserId = useWatch({
    control: form.control,
    name: 'cashierUserId',
  });
  const watchedBranchId = useWatch({
    control: form.control,
    name: 'branchId',
  });
  const resolvedBranchId = watchedBranchId || branchId;
  const additionalChargeAccountQuery = useMemo(
    () => ({
      page: 1,
      limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
      active: true,
    }),
    []
  );
  const paymentAccountQuery = useMemo(
    () => ({
      page: 1,
      limit: ACCOUNT_PROFILE_OPTION_PAGE_SIZE,
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
  const { data: selectedPartyProfile } = useGetPartyProfile(
    String(partyProfileId || ''),
    undefined,
    Boolean(partyProfileId)
  );
  const { data: branchProfile } = useGetBranchProfile(resolvedBranchId);
  const { data: companies = [] } = useListCompanyProfiles();
  const { data: nextTransactionNumber } = useQuery({
    queryKey: ['purchase-next-transaction-number', resolvedBranchId, purchasePageType],
    queryFn: () =>
      transactionsApi.getNextNumber({
        slug: purchasePageType ?? '',
        branchId: resolvedBranchId,
      }),
    enabled: Boolean(resolvedBranchId && purchasePageType && !savedTransaction?.number),
  });
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
  const transactionType = useWatch({
    control: form.control,
    name: 'transactionType',
  });
  const hasCompleteItemPreviewRows = useMemo(
    () =>
      (transactions ?? []).every(
        transaction =>
          hasNumericPreviewValue(transaction.quantity) &&
          hasNumericPreviewValue(transaction.rate) &&
          hasNumericPreviewValue(transaction.per)
      ),
    [transactions]
  );
  const hasCompleteAdditionalChargePreviewRows = useMemo(
    () =>
      (additionalCharges ?? []).every(charge =>
        hasNumericPreviewValue(charge.amount)
      ),
    [additionalCharges]
  );
  const canPreviewTax = Boolean(
    resolvedBranchId &&
      partyProfileId &&
      transactionType &&
      branchProfile &&
      selectedPartyProfile &&
      hasCompleteItemPreviewRows &&
      hasCompleteAdditionalChargePreviewRows &&
      !savedTransaction?.id
  );
  const taxPreviewRequest = useMemo(
    () => ({
      transactionType,
      branchId: resolvedBranchId,
      partyProfileId: String(partyProfileId || ''),
      partyProfileApplyTax: Boolean(partyProfileApplyTax),
      taxRatePercent: gstRatePercent,
      branchStateName: branchProfile?.gstState ?? '',
      partyStateName:
        selectedPartyProfile?.gstStateName ?? selectedPartyProfile?.stateName ?? '',
      items: (transactions ?? []).map(transaction => ({
        quantity: buildPreviewNumericValue(transaction.quantity),
        rate: buildPreviewNumericValue(transaction.rate),
        per: buildPreviewNumericValue(transaction.per),
      })),
      additionalCharges: (additionalCharges ?? []).map(charge => ({
        amount: buildPreviewNumericValue(charge.amount),
        applyTax: Boolean(partyProfileApplyTax),
      })),
    }),
    [
      additionalCharges,
      branchProfile?.gstState,
      gstRatePercent,
      partyProfileApplyTax,
      partyProfileId,
      resolvedBranchId,
      selectedPartyProfile?.gstStateName,
      selectedPartyProfile?.stateName,
      transactionType,
      transactions,
    ]
  );
  const { data: taxPreview } = useQuery<ITransactionTaxPreviewResponse, Error>({
    queryKey: ['purchase-tax-preview', taxPreviewRequest],
    queryFn: () => transactionsApi.previewTax(taxPreviewRequest),
    enabled: canPreviewTax,
  });
  const resolvedTaxSummary = useMemo<ITransactionTaxPreviewResponse | null>(() => {
    if (taxPreview) {
      return taxPreview;
    }

    if (!savedTransaction) {
      return null;
    }

    const savedBranchStateName =
      String(
        savedTransaction.branchSnapshot?.stateName ??
          savedTransaction.branchSnapshot?.gstStateName ??
          savedTransaction.branchSnapshot?.state ??
          savedTransaction.branchSnapshot?.gstState ??
          ''
      ).trim() || null;
    const savedPartyStateName =
      String(
        savedTransaction.partyProfileSnapshot?.stateName ??
          savedTransaction.partyProfileSnapshot?.gstStateName ??
          savedTransaction.partyProfileSnapshot?.state ??
          savedTransaction.partyProfileSnapshot?.gstState ??
          ''
      ).trim() || null;

    return {
      taxRatePercent: savedTransaction.taxRatePercent ?? '0.00',
      taxableAmount: savedTransaction.taxableAmount ?? '0.00',
      itemBaseAmount: savedTransaction.itemBaseAmount ?? '0.00',
      itemTaxableAmount: savedTransaction.itemTaxableAmount ?? '0.00',
      itemTaxAmount: savedTransaction.itemTaxAmount ?? '0.00',
      itemIgstAmount: savedTransaction.splitMode === 'IGST'
        ? savedTransaction.itemTaxAmount ?? '0.00'
        : '0.00',
      itemCgstAmount: savedTransaction.splitMode === 'CGST_SGST'
        ? savedTransaction.itemTaxAmount ?? '0.00'
        : '0.00',
      itemSgstAmount: '0.00',
      itemIgstRatePercent: savedTransaction.splitMode === 'IGST'
        ? savedTransaction.taxRatePercent ?? '0.00'
        : '0.00',
      itemCgstRatePercent: savedTransaction.splitMode === 'CGST_SGST'
        ? savedTransaction.taxRatePercent ?? '0.00'
        : '0.00',
      itemSgstRatePercent: savedTransaction.splitMode === 'CGST_SGST'
        ? savedTransaction.taxRatePercent ?? '0.00'
        : '0.00',
      additionalChargeBaseAmount: savedTransaction.additionalChargeBaseAmount ?? '0.00',
      additionalChargeTaxAmount: savedTransaction.additionalChargeTaxAmount ?? '0.00',
      totalTaxAmount: Number(savedTransaction.itemTaxAmount ?? 0) + Number(savedTransaction.additionalChargeTaxAmount ?? 0) > 0
        ? String(Number(savedTransaction.itemTaxAmount ?? 0) + Number(savedTransaction.additionalChargeTaxAmount ?? 0))
        : '0.00',
      finalAmount: savedTransaction.finalAmount ?? '0.00',
      igstAmount: savedTransaction.igstAmount ?? '0.00',
      cgstAmount: savedTransaction.cgstAmount ?? '0.00',
      sgstAmount: savedTransaction.sgstAmount ?? '0.00',
      splitMode: savedTransaction.splitMode ?? null,
      branchStateName: savedBranchStateName,
      partyStateName: savedPartyStateName,
      itemRows: (savedTransaction.items ?? []).map(item => ({
        lineNo: item.lineNo,
        taxableAmount: item.taxableAmount ?? '0.00',
        taxRatePercent: item.taxRatePercent ?? '0.00',
        gstAmount: item.gstAmount ?? '0.00',
        igstRatePercent: item.igstRatePercent ?? '0.00',
        cgstRatePercent: item.cgstRatePercent ?? '0.00',
        sgstRatePercent: item.sgstRatePercent ?? '0.00',
        igstAmount: item.igstAmount ?? '0.00',
        cgstAmount: item.cgstAmount ?? '0.00',
        sgstAmount: item.sgstAmount ?? '0.00',
        splitMode: item.splitMode ?? null,
      })),
      additionalChargeRows: (savedTransaction.additionalCharges ?? []).map(charge => ({
        lineNo: charge.lineNo,
        amount: charge.amount ?? '0.00',
        taxRatePercent: charge.taxRatePercent ?? charge.gstRate ?? '0.00',
        gstRatePercent: charge.taxRatePercent ?? charge.gstRate ?? '0.00',
        gstAmount: charge.gstAmount ?? '0.00',
        igstAmount: charge.igstAmount ?? '0.00',
        cgstAmount: charge.cgstAmount ?? '0.00',
        sgstAmount: charge.sgstAmount ?? '0.00',
        igstRatePercent: charge.igstRatePercent ?? '0.00',
        cgstRatePercent: charge.cgstRatePercent ?? '0.00',
        sgstRatePercent: charge.sgstRatePercent ?? '0.00',
        splitMode: charge.splitMode ?? null,
        totalAmount: String(
          Number(charge.amount ?? 0) + Number(charge.gstAmount ?? 0)
        ),
      })),
    };
  }, [savedTransaction, taxPreview]);
  const totalPayableAmount = useMemo(
    () => resolvedTaxSummary?.finalAmount ?? '0.00',
    [resolvedTaxSummary?.finalAmount]
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
    if (!savedTransaction?.id) {
      return document.storageUrl ?? undefined;
    }

    return transactionsApi.getTransactionDocumentDownloadUrl(
      savedTransaction.id,
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
  const hasPrintedHistory = Boolean(
    savedTransaction?.logs?.some(log => log.action === TransactionLogActionEnum.PRINT)
  );
  const displayReferenceNumber =
    savedTransaction?.number ?? nextTransactionNumber?.nextNumber ?? '';
  const canPrint = Boolean(savedTransaction?.id && savedTransaction?.number);

  useEffect(() => {
    if (!branchProfile) {
      return;
    }

    form.setValue('branchSnapshot', {
      id: branchProfile.id,
      code: branchProfile.code,
      name: branchProfile.name,
      label: `${branchProfile.code} - ${branchProfile.name}`,
    }, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    }, [branchProfile, form]);

  useEffect(() => {
    if (!taxPreview) {
      return;
    }

    const additionalChargeRows = Array.isArray(taxPreview.additionalChargeRows)
      ? taxPreview.additionalChargeRows
      : [];

    for (const row of additionalChargeRows) {
      const rowIndex = row.lineNo - 1;
      if (rowIndex < 0) {
        continue;
      }

      const resolvedTaxRate = row.taxRatePercent ?? row.gstRatePercent ?? '0';

      form.setValue(`additionalCharges.${rowIndex}.gstRate`, resolvedTaxRate, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      form.setValue(`additionalCharges.${rowIndex}.gstAmount`, row.gstAmount, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      form.setValue(`additionalCharges.${rowIndex}.totalAmount`, row.totalAmount, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [form, taxPreview]);

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
    if (!savedTransaction?.id || !savedTransaction?.number) {
      toast.error('Save the transaction before printing.');
      return;
    }

    if (isPrinting) {
      return;
    }

    try {
      setIsPrinting(true);
      const copyType =
        !hasPrintedOnce && !hasPrintedHistory ? 'CUSTOMER_COPY' : 'DUPLICATE_COPY';
      const html = buildPurchasePrintHtml({
        copyType,
        transactionNumber: savedTransaction.number,
        transactionDate: new Date(),
        company: currentCompany,
        branch: branchProfile ?? null,
        transaction: form.getValues(),
        sacCode,
      });

      await transactionsApi.recordPrint(savedTransaction.id, {
        copyType,
        subject: `${savedTransaction.number} - ${getPurchasePrintCopyLabel(copyType)}`,
        text: `Printed ${getPurchasePrintCopyLabel(copyType).toLowerCase()} for transaction ${savedTransaction.number}.`,
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
      <CardSection heading="Workplace">
        <p className="mb-4 text-sm text-text-secondary">
          Select the branch and counter for this transaction. Admin and HO can choose these before saving.
        </p>
        <PurchaseWorkplaceFields readOnly={isReadOnly} />
      </CardSection>

      <CardSection heading={pageTitle}>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <FormFieldCategoryOption
            name="purposeId"
            code={CategoryOptionCodeEnum.Purpose}
            label="Purpose"
            placeholder="Select purpose"
            disabled={isReadOnly}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <PurchasePartyProfileField
            partyProfileTypes={partyProfileTypes}
            purchasePageType={purchasePageType}
            disabled={isReadOnly}
            showPassengerAction
            onAddPassengerInfo={() => {
              setIsPassengerAmlModalOpen(true);
            }}
          />

          <PurchaseAgentProfileField disabled={isReadOnly} />

          <PurchaseReferenceNumberField
            value={displayReferenceNumber}
            placeholder="Will be generated on save or approval"
            helperText="Format: branch code + financial year + running series. The backend rechecks the latest counter on submit."
          />
        </div>
      </CardSection>

      <CardSection heading="Manual Book Reference">
        <PurchaseBookReferenceField
          branchId={resolvedBranchId}
          purchasePageType={purchasePageType}
          disabled={isReadOnly}
        />
      </CardSection>

      <PurchaseTransactionTable
        branchId={resolvedBranchId}
        excludeTransactionId={savedTransaction?.id ?? undefined}
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
        transactionType={transactionType}
        defaultAccountId={handlingFeeControlAccountId}
        title="Additional Charges"
        description="Add optional charges for this transaction. The account list is filtered by ledger type and purchase/sale mode."
      />

      {resolvedTaxSummary ? (
        <CardSection heading="GST Summary" className="space-y-4">
          <div className="space-y-4 rounded-xl border border-border-primary bg-surface-primary px-4 py-4 shadow-sm">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-text-primary">
                Item Tax Breakdown
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  Taxable amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {resolvedTaxSummary.itemTaxableAmount}
                </div>
              </div>
              {resolvedTaxSummary.splitMode === 'IGST' ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-text-secondary">
                      IGST ({resolvedTaxSummary.itemIgstRatePercent})
                    </div>
                    <div className="text-sm font-semibold text-text-primary text-right">
                      {resolvedTaxSummary.itemIgstAmount}
                    </div>
                  </div>
                </>
              ) : resolvedTaxSummary.splitMode === 'CGST_SGST' ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-text-secondary">
                      CGST ({resolvedTaxSummary.itemCgstRatePercent})
                    </div>
                    <div className="text-sm font-semibold text-text-primary text-right">
                      {resolvedTaxSummary.itemCgstAmount}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-text-secondary">
                      SGST ({resolvedTaxSummary.itemSgstRatePercent})
                    </div>
                    <div className="text-sm font-semibold text-text-primary text-right">
                      {resolvedTaxSummary.itemSgstAmount}
                    </div>
                  </div>
                </>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  Final item tax amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {resolvedTaxSummary.itemTaxAmount}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-text-primary">
                Additional Charges
              </div>
              {resolvedTaxSummary.additionalChargeRows.length > 0 ? (
                resolvedTaxSummary.additionalChargeRows.map((row, index) => (
                  <div
                    key={`${row.lineNo}-${index}`}
                    className="rounded-lg border border-border-secondary bg-surface-secondary/30 px-4 py-3"
                  >
                    <div className="mb-3 text-sm font-semibold text-text-primary">
                      Additional Charge {index + 1}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-medium text-text-secondary">
                          Taxable amount
                        </div>
                        <div className="text-sm font-semibold text-text-primary text-right">
                          {row.amount}
                        </div>
                      </div>
                      {row.splitMode === 'IGST' ? (
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-medium text-text-secondary">
                            IGST ({row.igstRatePercent})
                          </div>
                          <div className="text-sm font-semibold text-text-primary text-right">
                            {row.igstAmount}
                          </div>
                        </div>
                      ) : row.splitMode === 'CGST_SGST' ? (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-sm font-medium text-text-secondary">
                              CGST ({row.cgstRatePercent})
                            </div>
                            <div className="text-sm font-semibold text-text-primary text-right">
                              {row.cgstAmount}
                            </div>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-sm font-medium text-text-secondary">
                              SGST ({row.sgstRatePercent})
                            </div>
                            <div className="text-sm font-semibold text-text-primary text-right">
                              {row.sgstAmount}
                            </div>
                          </div>
                        </>
                      ) : null}
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-medium text-text-secondary">
                          Final charge amount
                        </div>
                        <div className="text-sm font-semibold text-text-primary text-right">
                          {row.totalAmount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-text-secondary">
                  No additional charges added.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border-secondary pt-3">
              <div className="text-sm font-medium text-text-secondary">
                Final total amount
              </div>
              <div className="text-lg font-semibold text-text-primary text-right">
                {resolvedTaxSummary.finalAmount}
              </div>
            </div>
          </div>
        </CardSection>
      ) : null}

      <TransactionPaymentDetailsFieldArray
        name="paymentDetails"
        maxAmount={totalPayableAmount}
        syncPrimaryRowAmount={!savedTransaction}
        accountQuery={paymentAccountQuery}
        transactionType={transactionType}
        branchId={resolvedBranchId}
        selectablePagesUserId={cashierUserId || undefined}
        cashControlAccountId={cashControlAccountId}
        disabled={isReadOnly}
        title="Payment Details"
        description="Store how this transaction will be settled. Payment accounts are filtered by ledger type and purchase/sale mode."
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
            {hasPrintedOnce || hasPrintedHistory
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

      <PassengerAmlVerificationModal
        key={`${isPassengerAmlModalOpen ? 'open' : 'closed'}-${selectedPartyProfile?.id ?? 'none'}`}
        open={isPassengerAmlModalOpen}
        onOpenChange={setIsPassengerAmlModalOpen}
        entityType={getPurchasePageEntityType(purchasePageType) ?? undefined}
        selectedPartyProfile={selectedPartyProfile ?? null}
        onVerified={() => {
          toast.success('AML verified successfully');
        }}
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

export const PurchaseForm = ({
  purchasePageType,
  defaultValues,
  pricingData,
  partyProfileTypes,
  requiresApproval,
  cashControlAccountId,
  branchId = '',
  branchCode = '',
  sacCode = '',
  savedTransaction = null,
  gstRatePercent,
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
      resolver={yupResolver(
        createPurchaseFormSchema(defaultValues.transactionType),
      ) as unknown as Resolver<IPurchaseFormValues>}
      defaultValues={defaultValues}
      mode="onBlur"
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
        cashControlAccountId={cashControlAccountId}
        branchId={branchId}
        branchCode={branchCode}
        sacCode={sacCode ?? ''}
        savedTransaction={savedTransaction}
        gstRatePercent={gstRatePercent}
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
