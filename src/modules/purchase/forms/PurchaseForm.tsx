import { useEffect, useMemo, useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Button, CardSection } from '@/components/ui';
import {
  Form,
  FormFieldPurposeSelect,
  FormFieldDatePicker,
  FormFieldSelect,
  TransactionAdditionalChargesFieldArray,
  TransactionPaymentDetailsFieldArray,
} from '@/components/forms';
import { documentProfileApi } from '@/api/documentProfile';
import { transactionsApi } from '@/api/transactions';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components/DocumentRequirementCard';
import type { IDocumentProfileFile } from '@/modules/documentProfiles/types';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { useGetPartyProfile } from '@/modules/partyProfiles/hooks';
import type { PartyProfileType } from '@/modules/partyProfiles/types';
import {
  getPurchasePageEntityType,
  getPurchasePageTitle,
  getPurchasePurposePartyProfileType,
  isCorporateIndividualPurchasePage,
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
import { PurchaseRulePreviewSection } from '../components/PurchaseRulePreviewSection';
import {
  PurchaseCdfDeclarationModal,
  type IPurchaseCdfDeclarationValues,
} from '../components/PurchaseCdfDeclarationModal';
import { PurchaseTransactionTable } from '../components/PurchaseTransactionTable';
import {
  buildPurchasePrintHtml,
  getPurchasePrintCopyLabel,
} from '../utils/purchasePrintUtils';
import {
  openPrintWindow,
  toPrintBranch,
  toPrintCompany,
} from '@/modules/transactions/utils/printSnapshotUtils';
import {
  formatPurchaseDecimal,
  mapPurchaseFormValuesToSubmitPayload,
} from '../utils/purchaseUtils';
import { PURCHASE_RULE_TEXT } from '../constants/purchaseConstants';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';
import {
  TransactionLogActionEnum,
  TransactionPartyProfileTypeEnum,
  TransactionTypeEnum,
} from '@/modules/transactions';
import { PassengerAmlVerificationModal } from '@/modules/passengers/components';
import {
  PassengerEntityTypeEnum,
  type PassengerEntityType,
} from '@/modules/passengers/types/passengerTypes';
import type {
  IPurchaseRulePreviewRequest,
  IPurchaseRulePreviewResponse,
  ITransactionTaxPreviewResponse,
  ITransactionTcsPreviewResponse,
} from '@/modules/transactions';
import { useTransactionTcsPreview } from '@/modules/transactions';
import { useAuth } from '@/lib/AuthContext';

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
  onSelectDraftDocument: (
    documentProfileId: string,
    file: File
  ) => void | Promise<void>;
  onClearDraftDocument: (documentProfileId: string) => void | Promise<void>;
  onPurchaseRuleBlockChange: (isBlocked: boolean) => void;
  onPurchaseRuleMetaChange: (meta: {
    allowed: boolean;
    requiresCdf: boolean;
    blockingReason: string | null;
    blockingReasons: string[];
    cdfThresholdAmount: string;
    referenceCurrencyCode: string;
  }) => void;
  transactionDatePolicy: ReturnType<typeof getTransactionDatePolicy>;
}

const PurchaseFormBody = ({
  purchasePageType,
  pricingData,
  partyProfileTypes,
  requiresApproval,
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
  onPurchaseRuleBlockChange,
  onPurchaseRuleMetaChange,
  transactionDatePolicy,
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
  const isCombinedPartyProfilePage =
    isCorporateIndividualPurchasePage(purchasePageType);
  const partyProfileApplyTax = useWatch({
    control: form.control,
    name: 'partyProfileApplyTax',
  });
  const transactionPartyProfileType = useWatch({
    control: form.control,
    name: 'transactionPartyProfileType',
  });
  const resolvedTransactionPartyProfileType =
    transactionPartyProfileType || null;
  const passengerEntityType = useWatch({
    control: form.control,
    name: 'entityType',
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
  const passengerInfoCaptured = useWatch({
    control: form.control,
    name: 'passengerInfoCaptured',
  });
  const passengerId = useWatch({
    control: form.control,
    name: 'passengerId',
  });
  const paymentDetails = useWatch({
    control: form.control,
    name: 'paymentDetails',
  });
  const watchedBranchId = useWatch({
    control: form.control,
    name: 'branchId',
  });
  const watchedCounterId = useWatch({
    control: form.control,
    name: 'counterId',
  });
  const resolvedBranchId = watchedBranchId || branchId;
  const resolvedCounterId = watchedCounterId || '';
  const resolvedPassengerEntityType =
    isCombinedPartyProfilePage &&
    transactionPartyProfileType === TransactionPartyProfileTypeEnum.INDIVIDUAL
      ? PassengerEntityTypeEnum.INDIVIDUAL
      : isCombinedPartyProfilePage
        ? PassengerEntityTypeEnum.CORPORATE
        : (passengerEntityType as PassengerEntityType | '' | null) || null;
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
  const {
    data: selectedPartyProfile,
    isLoading: isSelectedPartyProfileLoading,
    isFetching: isSelectedPartyProfileFetching,
  } = useGetPartyProfile(
    String(partyProfileId || ''),
    undefined,
    Boolean(partyProfileId)
  );
  const { data: branchProfile } = useGetBranchProfile(resolvedBranchId);
  const { data: nextTransactionNumber } = useQuery({
    queryKey: [
      'purchase-next-transaction-number',
      resolvedBranchId,
      purchasePageType,
    ],
    queryFn: () =>
      transactionsApi.getNextNumber({
        slug: purchasePageType ?? '',
        branchId: resolvedBranchId,
      }),
    enabled: Boolean(
      resolvedBranchId && purchasePageType && !savedTransaction?.number
    ),
  });
  const agentCommissionRules = useMemo(
    () => (agentProfileId ? (agentProfile?.commissionRules ?? []) : []),
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
  const isPurchaseTransaction =
    transactionType === TransactionTypeEnum.PURCHASE;
  const allowCashPayment = !(
    transactionType === TransactionTypeEnum.PURCHASE &&
    resolvedPassengerEntityType === PassengerEntityTypeEnum.CORPORATE
  );
  const purposeId = useWatch({
    control: form.control,
    name: 'purposeId',
  });
  const loanAmount = useWatch({
    control: form.control,
    name: 'loanAmount',
  });
  const declaredAmount = useWatch({
    control: form.control,
    name: 'declaredAmount',
  });
  const itrFiled = useWatch({
    control: form.control,
    name: 'itrFiled',
  });
  const tcsDeclarationAccepted = useWatch({
    control: form.control,
    name: 'tcsDeclarationAccepted',
  });
  const isProprietorship = useWatch({
    control: form.control,
    name: 'isProprietorship',
  });
  const purchaseRuleWatchValues = useWatch({
    control: form.control,
    name: [
      'passengerInfoCaptured',
      'entityType',
      'nationalityType',
      'residentStatus',
      'countryId',
      'stateId',
      'locationId',
      'city',
      'address1',
      'address2',
      'email',
      'contactNo',
      'panNumber',
      'panHolderName',
      'panDob',
      'panHolderRelationType',
      'paidByPanNumber',
      'paidByPanHolderName',
      'paidByPanDob',
      'gstNumber',
      'gstStateId',
      'passportNumber',
      'passportIssueAt',
      'passportIssueDate',
      'passportExpiryDate',
      'arrivalDate',
      'isPep',
      'otherDocuments',
      'transactions',
      'additionalCharges',
    ] as const,
  });
  const [
    purchaseRulePassengerInfoCaptured,
    purchaseRuleEntityType,
    purchaseRuleNationalityType,
    purchaseRuleResidentStatus,
    purchaseRuleCountryId,
    purchaseRuleStateId,
    purchaseRuleLocationId,
    purchaseRuleCity,
    purchaseRuleAddress1,
    purchaseRuleAddress2,
    purchaseRuleEmail,
    purchaseRuleContactNo,
    purchaseRulePanNumber,
    purchaseRulePanHolderName,
    purchaseRulePanDob,
    purchaseRulePanHolderRelationType,
    purchaseRulePaidByPanNumber,
    purchaseRulePaidByPanHolderName,
    purchaseRulePaidByPanDob,
    purchaseRuleGstNumber,
    purchaseRuleGstStateId,
    purchaseRulePassportNumber,
    purchaseRulePassportIssueAt,
    purchaseRulePassportIssueDate,
    purchaseRulePassportExpiryDate,
    purchaseRuleArrivalDate,
    purchaseRuleIsPep,
    purchaseRuleOtherDocuments,
    purchaseRuleTransactions,
    purchaseRuleAdditionalCharges,
  ] = purchaseRuleWatchValues;
  const purchaseRulePaymentSignature = useMemo(
    () =>
      (paymentDetails ?? [])
        .map(payment => ({
          paymentMethod: String(payment.paymentMethod ?? '')
            .trim()
            .toUpperCase(),
          amount: String(payment.amount ?? '').trim(),
        }))
        .filter(payment => payment.paymentMethod || payment.amount)
        .map(payment => `${payment.paymentMethod}:${payment.amount}`)
        .join('|'),
    [paymentDetails]
  );
  const passengerInfoCapturedForRule = Boolean(
    purchaseRulePassengerInfoCaptured
  );
  const purchaseRulePreviewSignature = useMemo(
    () =>
      JSON.stringify({
        passengerInfoCapturedForRule,
        entityType: purchaseRuleEntityType ?? '',
        nationalityType: purchaseRuleNationalityType ?? '',
        residentStatus: purchaseRuleResidentStatus ?? '',
        countryId: purchaseRuleCountryId ?? '',
        stateId: purchaseRuleStateId ?? '',
        locationId: purchaseRuleLocationId ?? '',
        city: purchaseRuleCity ?? '',
        address1: purchaseRuleAddress1 ?? '',
        address2: purchaseRuleAddress2 ?? '',
        email: purchaseRuleEmail ?? '',
        contactNo: purchaseRuleContactNo ?? '',
        panNumber: purchaseRulePanNumber ?? '',
        panHolderName: purchaseRulePanHolderName ?? '',
        panDob: purchaseRulePanDob ?? '',
        panHolderRelationType: purchaseRulePanHolderRelationType ?? '',
        paidByPanNumber: purchaseRulePaidByPanNumber ?? '',
        paidByPanHolderName: purchaseRulePaidByPanHolderName ?? '',
        paidByPanDob: purchaseRulePaidByPanDob ?? '',
        gstNumber: purchaseRuleGstNumber ?? '',
        gstStateId: purchaseRuleGstStateId ?? '',
        passportNumber: purchaseRulePassportNumber ?? '',
        passportIssueAt: purchaseRulePassportIssueAt ?? '',
        passportIssueDate: purchaseRulePassportIssueDate ?? '',
        passportExpiryDate: purchaseRulePassportExpiryDate ?? '',
        arrivalDate: purchaseRuleArrivalDate ?? '',
        isPep: purchaseRuleIsPep ?? false,
        otherDocuments: purchaseRuleOtherDocuments ?? [],
        transactions: purchaseRuleTransactions ?? [],
        additionalCharges: purchaseRuleAdditionalCharges ?? [],
        paymentDetails: purchaseRulePaymentSignature,
      }),
    [
      passengerInfoCapturedForRule,
      purchaseRuleAddress1,
      purchaseRuleAddress2,
      purchaseRuleAdditionalCharges,
      purchaseRuleArrivalDate,
      purchaseRuleCity,
      purchaseRuleContactNo,
      purchaseRuleCountryId,
      purchaseRuleEmail,
      purchaseRuleEntityType,
      purchaseRuleGstNumber,
      purchaseRuleGstStateId,
      purchaseRuleIsPep,
      purchaseRuleLocationId,
      purchaseRuleNationalityType,
      purchaseRuleOtherDocuments,
      purchaseRulePaidByPanDob,
      purchaseRulePaidByPanHolderName,
      purchaseRulePaidByPanNumber,
      purchaseRulePanDob,
      purchaseRulePanHolderName,
      purchaseRulePanHolderRelationType,
      purchaseRulePanNumber,
      purchaseRulePassportExpiryDate,
      purchaseRulePassportIssueAt,
      purchaseRulePassportIssueDate,
      purchaseRulePassportNumber,
      purchaseRulePaymentSignature,
      purchaseRuleResidentStatus,
      purchaseRuleStateId,
      purchaseRuleTransactions,
    ]
  );
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
  const hasCompletePaymentPreviewRows = useMemo(
    () =>
      Array.isArray(paymentDetails) &&
      paymentDetails.length > 0 &&
      paymentDetails.every(
        payment =>
          Boolean(String(payment.paymentMethod || '').trim()) &&
          hasNumericPreviewValue(payment.amount)
      ),
    [paymentDetails]
  );
  const purchaseRulePreviewPayload = useMemo(() => {
    void purchaseRulePreviewSignature;

    if (
      !purchasePageType ||
      !passengerInfoCapturedForRule ||
      !isPurchaseTransaction
    ) {
      return null;
    }

    return mapPurchaseFormValuesToSubmitPayload(
      form.getValues(),
      [],
      requiresApproval
    );
  }, [
    form,
    passengerInfoCapturedForRule,
    purchasePageType,
    requiresApproval,
    purchaseRulePreviewSignature,
    isPurchaseTransaction,
  ]);
  const purchaseRulePreviewRequest: IPurchaseRulePreviewRequest | null =
    purchaseRulePreviewPayload?.transaction
      ? { transaction: purchaseRulePreviewPayload.transaction }
      : null;
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
  const canPreviewPurchaseRule = Boolean(
    purchaseRulePreviewRequest &&
    isPurchaseTransaction &&
    resolvedBranchId &&
    partyProfileId &&
    passengerInfoCaptured &&
    branchProfile &&
    selectedPartyProfile &&
    hasCompleteItemPreviewRows &&
    hasCompleteAdditionalChargePreviewRows &&
    hasCompletePaymentPreviewRows &&
    !savedTransaction?.id
  );
  const { data: purchaseRulePreview } = useQuery<
    IPurchaseRulePreviewResponse,
    Error
  >({
    queryKey: ['purchase-rule-preview', purchaseRulePreviewRequest],
    queryFn: () => {
      if (!purchaseRulePreviewRequest) {
        throw new Error('Purchase rule preview request is missing');
      }

      return transactionsApi.previewPurchaseRule(purchaseRulePreviewRequest);
    },
    enabled: canPreviewPurchaseRule,
  });
  const resolvedPurchaseRulePreview =
    useMemo<IPurchaseRulePreviewResponse | null>(
      () => purchaseRulePreview ?? null,
      [purchaseRulePreview]
    );

  const lockedHandlingFeeRow = useMemo(() => {
    const defaultHandlingCharges = Number(
      selectedPartyProfile?.defaultHandlingCharges ?? 0
    );

    if (
      !selectedPartyProfile ||
      selectedPartyProfile.isIndividual ||
      !handlingFeeControlAccountId ||
      !Number.isFinite(defaultHandlingCharges) ||
      defaultHandlingCharges <= 0
    ) {
      return null;
    }

    return {
      key: `${selectedPartyProfile.id}:${handlingFeeControlAccountId}:${defaultHandlingCharges.toFixed(2)}`,
      accountId: handlingFeeControlAccountId,
      accountName: '',
      amount: formatPurchaseDecimal(defaultHandlingCharges),
    };
  }, [handlingFeeControlAccountId, selectedPartyProfile]);

  useEffect(() => {
    if (!isPurchaseTransaction) {
      onPurchaseRuleBlockChange(false);
      onPurchaseRuleMetaChange({
        allowed: true,
        requiresCdf: false,
        blockingReason: null,
        blockingReasons: [],
        cdfThresholdAmount: '',
        referenceCurrencyCode: '',
      });
      return;
    }

    onPurchaseRuleBlockChange(
      Boolean(
        resolvedPurchaseRulePreview && !resolvedPurchaseRulePreview.allowed
      )
    );
    onPurchaseRuleMetaChange({
      allowed: Boolean(resolvedPurchaseRulePreview?.allowed ?? true),
      requiresCdf: Boolean(resolvedPurchaseRulePreview?.requiresCdf),
      blockingReason: resolvedPurchaseRulePreview?.blockingReason ?? null,
      blockingReasons:
        resolvedPurchaseRulePreview?.blockingReasons ??
        (resolvedPurchaseRulePreview?.blockingReason
          ? [resolvedPurchaseRulePreview.blockingReason]
          : []),
      cdfThresholdAmount: resolvedPurchaseRulePreview?.cdfThresholdAmount ?? '',
      referenceCurrencyCode:
        resolvedPurchaseRulePreview?.referenceCurrencyCode ?? '',
    });
  }, [
    isPurchaseTransaction,
    onPurchaseRuleBlockChange,
    onPurchaseRuleMetaChange,
    resolvedPurchaseRulePreview,
  ]);

  const taxPreviewRequest = useMemo(
    () => ({
      transactionType,
      branchId: resolvedBranchId,
      partyProfileId: String(partyProfileId || ''),
      partyProfileApplyTax: Boolean(partyProfileApplyTax),
      taxRatePercent: gstRatePercent,
      branchStateName: branchProfile?.gstState ?? '',
      partyStateName:
        selectedPartyProfile?.gstStateName ??
        selectedPartyProfile?.stateName ??
        '',
      items: (transactions ?? []).map(transaction => ({
        quantity: buildPreviewNumericValue(transaction.quantity),
        rate: buildPreviewNumericValue(transaction.rate),
        per: buildPreviewNumericValue(transaction.per),
        finalAmount: buildPreviewNumericValue(transaction.finalAmount),
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
  const resolvedTaxSummary =
    useMemo<ITransactionTaxPreviewResponse | null>(() => {
      if (taxPreview) {
        return taxPreview;
      }

      if (!savedTransaction) {
        return null;
      }

      const savedBranchStateName =
        String(
          savedTransaction.branchSnapshot?.state?.name ??
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
        itemIgstAmount:
          savedTransaction.splitMode === 'IGST'
            ? (savedTransaction.itemTaxAmount ?? '0.00')
            : '0.00',
        itemCgstAmount:
          savedTransaction.splitMode === 'CGST_SGST'
            ? (savedTransaction.itemTaxAmount ?? '0.00')
            : '0.00',
        itemSgstAmount: '0.00',
        itemIgstRatePercent:
          savedTransaction.splitMode === 'IGST'
            ? (savedTransaction.taxRatePercent ?? '0.00')
            : '0.00',
        itemCgstRatePercent:
          savedTransaction.splitMode === 'CGST_SGST'
            ? (savedTransaction.taxRatePercent ?? '0.00')
            : '0.00',
        itemSgstRatePercent:
          savedTransaction.splitMode === 'CGST_SGST'
            ? (savedTransaction.taxRatePercent ?? '0.00')
            : '0.00',
        additionalChargeBaseAmount:
          savedTransaction.additionalChargeBaseAmount ?? '0.00',
        additionalChargeTaxAmount:
          savedTransaction.additionalChargeTaxAmount ?? '0.00',
        totalTaxAmount:
          Number(savedTransaction.itemTaxAmount ?? 0) +
            Number(savedTransaction.additionalChargeTaxAmount ?? 0) >
          0
            ? String(
                Number(savedTransaction.itemTaxAmount ?? 0) +
                  Number(savedTransaction.additionalChargeTaxAmount ?? 0)
              )
            : '0.00',
        finalAmount:
          savedTransaction.preTcsFinalAmount ??
          savedTransaction.finalAmount ??
          '0.00',
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
        additionalChargeRows: (savedTransaction.additionalCharges ?? []).map(
          charge => ({
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
            totalAmount:
              transactionType === TransactionTypeEnum.PURCHASE
                ? String(
                    -(
                      Math.abs(Number(charge.amount ?? 0)) +
                      Math.abs(Number(charge.gstAmount ?? 0))
                    )
                  )
                : String(
                    Number(charge.amount ?? 0) + Number(charge.gstAmount ?? 0)
                  ),
          })
        ),
      };
    }, [savedTransaction, taxPreview, transactionType]);
  const formatPurchaseSummaryAmount = (value?: string | number | null) => {
    const formattedValue = formatPurchaseDecimal(value);
    if (!formattedValue) {
      return formattedValue;
    }

    return transactionType === TransactionTypeEnum.PURCHASE
      ? `-${formattedValue.replace(/^-/, '')}`
      : formattedValue;
  };
  const tcsPreviewRequest = useMemo(() => {
    if (
      transactionType !== TransactionTypeEnum.SALE ||
      !purchasePageType ||
      !resolvedTaxSummary ||
      !purposeId ||
      !passengerInfoCaptured
    ) {
      return null;
    }

    return {
      transactionType,
      purposeId,
      slug: purchasePageType,
      preTcsFinalAmount: resolvedTaxSummary.finalAmount,
      itemBaseAmount: resolvedTaxSummary.itemBaseAmount,
      itemTaxAmount: resolvedTaxSummary.itemTaxAmount,
      additionalChargeBaseAmount: resolvedTaxSummary.additionalChargeBaseAmount,
      additionalChargeTaxAmount: resolvedTaxSummary.additionalChargeTaxAmount,
      loanAmount: loanAmount || null,
      declaredAmount: declaredAmount || null,
      itrFiled: Boolean(itrFiled),
      tcsDeclarationAccepted: Boolean(tcsDeclarationAccepted),
      isProprietorship: Boolean(isProprietorship),
    };
  }, [
    declaredAmount,
    isProprietorship,
    itrFiled,
    loanAmount,
    passengerInfoCaptured,
    purchasePageType,
    purposeId,
    resolvedTaxSummary,
    tcsDeclarationAccepted,
    transactionType,
  ]);
  const canPreviewTcs = Boolean(tcsPreviewRequest);
  const { data: tcsPreview } = useTransactionTcsPreview(
    tcsPreviewRequest,
    canPreviewTcs
  );
  const resolvedTcsSummary =
    useMemo<ITransactionTcsPreviewResponse | null>(() => {
      if (tcsPreview) {
        return tcsPreview;
      }

      if (savedTransaction?.tcsAmount === undefined && !savedTransaction?.id) {
        return null;
      }

      const breakdowns = (savedTransaction?.tcsBreakdowns ?? []).map(
        breakdown => ({
          lineNo: breakdown.lineNo,
          purposeId: breakdown.purposeId,
          purposeSlabId: breakdown.purposeSlabId,
          baseAmount: breakdown.baseAmount ?? '0.00',
          ratePercent: breakdown.ratePercent ?? '0.00',
          rateType: breakdown.rateType ?? 'PERCENT',
          tcsAmount: breakdown.tcsAmount ?? '0.00',
        })
      );

      return {
        transactionType: savedTransaction?.transactionType ?? transactionType,
        purposeId: savedTransaction?.purposeId ?? null,
        preTcsFinalAmount: savedTransaction?.preTcsFinalAmount ?? '0.00',
        effectiveAmount:
          String(
            Number(savedTransaction?.preTcsFinalAmount ?? 0) +
              Number(savedTransaction?.declaredAmount ?? 0)
          ) || '0.00',
        threshold: '0.00',
        effectiveThreshold: '0.00',
        loanAmount: savedTransaction?.loanAmount ?? '0.00',
        declaredAmount: savedTransaction?.declaredAmount ?? '0.00',
        taxableAmount: savedTransaction?.taxableAmount ?? '0.00',
        tcsRatePercent: savedTransaction?.tcsRatePercent ?? '0.00',
        tcsRateType: savedTransaction?.tcsRateType ?? null,
        tcsAmount: savedTransaction?.tcsAmount ?? '0.00',
        finalAmount: savedTransaction?.finalAmount ?? '0.00',
        tcsDeclarationAccepted: Boolean(
          savedTransaction?.tcsDeclarationAccepted
        ),
        itrFiled: Boolean(savedTransaction?.itrFiled),
        isProprietorship: Boolean(savedTransaction?.isProprietorship),
        breakdowns,
      };
    }, [savedTransaction, tcsPreview, transactionType]);
  useEffect(() => {
    if (!tcsPreview) {
      return;
    }

    form.setValue('preTcsFinalAmount', tcsPreview.preTcsFinalAmount, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.setValue('tcsRatePercent', tcsPreview.tcsRatePercent, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.setValue('tcsRateType', tcsPreview.tcsRateType ?? '', {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
    form.setValue('tcsAmount', tcsPreview.tcsAmount, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [form, tcsPreview]);
  const totalPayableAmount = useMemo(
    () =>
      transactionType === TransactionTypeEnum.SALE
        ? (resolvedTcsSummary?.finalAmount ??
          resolvedTaxSummary?.finalAmount ??
          '0.00')
        : (resolvedTaxSummary?.finalAmount ?? '0.00'),
    [
      resolvedTaxSummary?.finalAmount,
      resolvedTcsSummary?.finalAmount,
      transactionType,
    ]
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
  const hasPrintedHistory = Boolean(
    savedTransaction?.logs?.some(
      log => log.action === TransactionLogActionEnum.PRINT
    )
  );
  const displayReferenceNumber =
    savedTransaction?.number ?? nextTransactionNumber?.nextNumber ?? '';
  const canPrint = Boolean(savedTransaction?.id && savedTransaction?.number);

  useEffect(() => {
    if (!branchProfile) {
      return;
    }

    form.setValue(
      'branchSnapshot',
      {
        id: branchProfile.id,
        code: branchProfile.code,
        name: branchProfile.name,
        label: `${branchProfile.code} - ${branchProfile.name}`,
      },
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
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
      form.setValue(
        `additionalCharges.${rowIndex}.totalAmount`,
        row.totalAmount,
        {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        }
      );
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
        !hasPrintedOnce && !hasPrintedHistory
          ? 'CUSTOMER_COPY'
          : 'DUPLICATE_COPY';
      const formValues = form.getValues();
      const html = buildPurchasePrintHtml({
        copyType,
        transactionNumber: savedTransaction.number,
        transactionDate:
          formValues.transactionDate || savedTransaction.transactionDate || '',
        company: toPrintCompany(savedTransaction.companySnapshot),
        branch: toPrintBranch(savedTransaction.branchSnapshot),
        transaction: formValues,
        sacCode,
      });

      await transactionsApi.recordPrint(savedTransaction.id, {
        copyType,
        subject: `${savedTransaction.number} - ${getPurchasePrintCopyLabel(copyType)}`,
        text: `Printed ${getPurchasePrintCopyLabel(copyType).toLowerCase()} for transaction ${savedTransaction.number}.`,
        html,
        sendEmail: false,
      });

      openPrintWindow(
        html,
        'Unable to open print window. Please allow pop-ups and try again.'
      );

      setHasPrintedOnce(true);
      toast.success(`${getPurchasePrintCopyLabel(copyType)} sent to printer`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to print transaction copy'
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <CardSection heading="Workplace">
        <p className="mb-4 text-sm text-text-secondary">
          Select the branch and counter for this transaction. Admin and HO can
          choose these before saving.
        </p>
        <PurchaseWorkplaceFields readOnly={isReadOnly} />
      </CardSection>

      <CardSection heading={pageTitle}>
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          {isCombinedPartyProfilePage ? (
            <FormFieldPurposeSelect
              name="purposeId"
              label="Purpose"
              placeholder="Select purpose"
              transactionType={transactionType}
              partyProfileType={getPurchasePurposePartyProfileType(
                purchasePageType,
                resolvedTransactionPartyProfileType
              )}
              disabled={isReadOnly}
            />
          ) : null}
          <FormFieldDatePicker
            name="transactionDate"
            label="Transaction Date"
            placeholder="Select transaction date"
            disabled={isReadOnly || !transactionDatePolicy.canPunchTransactions}
            minDate={transactionDatePolicy.minDate}
            maxDate={transactionDatePolicy.maxDate}
          />
        </div>

        {isCombinedPartyProfilePage ? (
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <FormFieldSelect
              name="transactionPartyProfileType"
              label="Entity Type"
              placeholder="Select entity type"
              disabled={isReadOnly}
              loadOptions={async () => ({
                options: [
                  {
                    value: TransactionPartyProfileTypeEnum.CORPORATE,
                    label: 'Corporate',
                  },
                  {
                    value: TransactionPartyProfileTypeEnum.INDIVIDUAL,
                    label: 'Individual',
                  },
                ],
                hasMore: false,
              })}
              onValueChange={value => {
                const nextValue = Array.isArray(value)
                  ? (value[0] ?? '')
                  : (value ?? '');
                if (nextValue === transactionPartyProfileType) {
                  return;
                }

                form.setValue('partyProfileId', '', {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
                form.setValue('partyProfileCode', '', {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: false,
                });
                form.setValue('partyProfileName', '', {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: false,
                });
                form.setValue('partyProfileEmail', '', {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: false,
                });
                form.setValue('partyProfilePhoneNo', '', {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: false,
                });
                form.setValue('purposeId', '', {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
            />
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <PurchasePartyProfileField
            partyProfileTypes={partyProfileTypes}
            purchasePageType={purchasePageType}
            disabled={isReadOnly}
            showPassengerAction={isCombinedPartyProfilePage}
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
        counterId={resolvedCounterId}
        passengerId={passengerId || ''}
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
        lockedRow={lockedHandlingFeeRow}
        title="Additional Charges"
        description="Add optional charges for this transaction. The account list is filtered by ledger type and purchase/sale mode."
      />

      {isPurchaseTransaction && resolvedPurchaseRulePreview ? (
        <PurchaseRulePreviewSection preview={resolvedPurchaseRulePreview} />
      ) : null}

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
                  {formatPurchaseDecimal(resolvedTaxSummary.itemTaxableAmount)}
                </div>
              </div>
              {resolvedTaxSummary.splitMode === 'IGST' ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-text-secondary">
                      IGST (
                      {formatPurchaseDecimal(
                        resolvedTaxSummary.itemIgstRatePercent
                      )}
                      %)
                    </div>
                    <div className="text-sm font-semibold text-text-primary text-right">
                      {formatPurchaseDecimal(resolvedTaxSummary.itemIgstAmount)}
                    </div>
                  </div>
                </>
              ) : resolvedTaxSummary.splitMode === 'CGST_SGST' ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-text-secondary">
                      CGST (
                      {formatPurchaseDecimal(
                        resolvedTaxSummary.itemCgstRatePercent
                      )}
                      %)
                    </div>
                    <div className="text-sm font-semibold text-text-primary text-right">
                      {formatPurchaseDecimal(resolvedTaxSummary.itemCgstAmount)}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium text-text-secondary">
                      SGST (
                      {formatPurchaseDecimal(
                        resolvedTaxSummary.itemSgstRatePercent
                      )}
                      %)
                    </div>
                    <div className="text-sm font-semibold text-text-primary text-right">
                      {formatPurchaseDecimal(resolvedTaxSummary.itemSgstAmount)}
                    </div>
                  </div>
                </>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  Final item tax amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {formatPurchaseSummaryAmount(
                    resolvedTaxSummary.itemTaxAmount
                  )}
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
                          {formatPurchaseDecimal(row.amount)}
                        </div>
                      </div>
                      {row.splitMode === 'IGST' ? (
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-medium text-text-secondary">
                            IGST ({formatPurchaseDecimal(row.igstRatePercent)}%)
                          </div>
                          <div className="text-sm font-semibold text-text-primary text-right">
                            {formatPurchaseDecimal(row.igstAmount)}
                          </div>
                        </div>
                      ) : row.splitMode === 'CGST_SGST' ? (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-sm font-medium text-text-secondary">
                              CGST ({formatPurchaseDecimal(row.cgstRatePercent)}
                              %)
                            </div>
                            <div className="text-sm font-semibold text-text-primary text-right">
                              {formatPurchaseDecimal(row.cgstAmount)}
                            </div>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-sm font-medium text-text-secondary">
                              SGST ({formatPurchaseDecimal(row.sgstRatePercent)}
                              %)
                            </div>
                            <div className="text-sm font-semibold text-text-primary text-right">
                              {formatPurchaseDecimal(row.sgstAmount)}
                            </div>
                          </div>
                        </>
                      ) : null}
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-medium text-text-secondary">
                          Final charge amount
                        </div>
                        <div className="text-sm font-semibold text-text-primary text-right">
                          {formatPurchaseDecimal(row.totalAmount)}
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
                {formatPurchaseDecimal(resolvedTaxSummary.finalAmount)}
              </div>
            </div>
          </div>
        </CardSection>
      ) : null}

      {transactionType === TransactionTypeEnum.SALE && resolvedTcsSummary ? (
        <CardSection heading="TCS Summary" className="space-y-4">
          <div className="space-y-4 rounded-xl border border-border-primary bg-surface-primary px-4 py-4 shadow-sm">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-text-primary">
                TCS Breakdown
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  Pre-TCS final amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {formatPurchaseDecimal(resolvedTcsSummary.preTcsFinalAmount)}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  Loan amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {formatPurchaseDecimal(resolvedTcsSummary.loanAmount)}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  Declared amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {formatPurchaseDecimal(resolvedTcsSummary.declaredAmount)}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  Taxable amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {formatPurchaseDecimal(resolvedTcsSummary.taxableAmount)}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  TCS Rate (
                  {resolvedTcsSummary.tcsRateType === 'RUPEES'
                    ? 'Rupees'
                    : `${formatPurchaseDecimal(resolvedTcsSummary.tcsRatePercent)}%`}
                  )
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {resolvedTcsSummary.tcsRateType === 'RUPEES'
                    ? formatPurchaseDecimal(resolvedTcsSummary.tcsAmount)
                    : formatPurchaseDecimal(resolvedTcsSummary.tcsRatePercent)}
                </div>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm font-medium text-text-secondary">
                  TCS amount
                </div>
                <div className="text-sm font-semibold text-text-primary text-right">
                  {formatPurchaseDecimal(resolvedTcsSummary.tcsAmount)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-text-primary">
                TCS Breakdown Rows
              </div>
              {resolvedTcsSummary.breakdowns.length > 0 ? (
                resolvedTcsSummary.breakdowns.map((row, index) => (
                  <div
                    key={`${row.lineNo}-${index}`}
                    className="rounded-lg border border-border-secondary bg-surface-secondary/30 px-4 py-3"
                  >
                    <div className="mb-3 text-sm font-semibold text-text-primary">
                      TCS Row {index + 1}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-medium text-text-secondary">
                          Base amount
                        </div>
                        <div className="text-sm font-semibold text-text-primary text-right">
                          {formatPurchaseDecimal(row.baseAmount)}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-medium text-text-secondary">
                          Rate (
                          {row.rateType === 'RUPEES'
                            ? 'Rupees'
                            : `${formatPurchaseDecimal(row.ratePercent)}%`}
                          )
                        </div>
                        <div className="text-sm font-semibold text-text-primary text-right">
                          {row.rateType === 'RUPEES'
                            ? formatPurchaseDecimal(row.tcsAmount)
                            : formatPurchaseDecimal(row.ratePercent)}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm font-medium text-text-secondary">
                          TCS amount
                        </div>
                        <div className="text-sm font-semibold text-text-primary text-right">
                          {formatPurchaseDecimal(row.tcsAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-text-secondary">
                  No TCS breakdown rows available.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border-secondary pt-3">
              <div className="text-sm font-medium text-text-secondary">
                Final total amount
              </div>
              <div className="text-lg font-semibold text-text-primary text-right">
                {formatPurchaseDecimal(resolvedTcsSummary.finalAmount)}
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
        allowCashPayment={allowCashPayment}
        allowedPaymentMethods={
          resolvedPurchaseRulePreview?.paymentMethodsAllowed ?? undefined
        }
        disabled={isReadOnly}
        title="Payment Details"
        description="Store how this transaction will be settled. Payment accounts are filtered by ledger type and purchase/sale mode."
      />

      <CardSection heading="Transaction Documents" className="space-y-4">
        <p className="text-sm text-text-secondary">
          Attach any transaction documents now.
          {requiresApproval
            ? ' They will be saved together with the draft.'
            : ' They will be saved with the transaction.'}
        </p>

        {transactionDocumentProfiles.length > 0 ? (
          <div className="grid gap-4">
            {transactionDocumentProfiles.map(profile => {
              const existingDocument = existingDocumentsByProfileId.get(
                profile.id
              );

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
                    existingDocument
                      ? getDocumentDownloadUrl(existingDocument)
                      : undefined
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

      {isCombinedPartyProfilePage ? (
        <PassengerAmlVerificationModal
          key={`${selectedPartyProfile?.id ?? 'none'}-${resolvedPassengerEntityType ?? 'none'}-${transactionPartyProfileType || 'none'}`}
          open={isPassengerAmlModalOpen}
          onOpenChange={setIsPassengerAmlModalOpen}
          entityType={
            resolvedPassengerEntityType ||
            getPurchasePageEntityType(purchasePageType) ||
            undefined
          }
          selectedPartyProfile={
            resolvedPassengerEntityType === PassengerEntityTypeEnum.CORPORATE
              ? (selectedPartyProfile ?? null)
              : null
          }
          selectedPartyProfileLoading={
            Boolean(partyProfileId) &&
            resolvedPassengerEntityType === PassengerEntityTypeEnum.CORPORATE &&
            (isSelectedPartyProfileLoading || isSelectedPartyProfileFetching)
          }
          onVerified={() => {
            toast.success('AML verified successfully');
          }}
        />
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
  const { policyContext } = useAuth();
  const [draftDocuments, setDraftDocuments] = useState<
    Record<string, File | null>
  >({});
  const [isPurchaseRuleBlocked, setIsPurchaseRuleBlocked] = useState(false);
  const [purchaseRuleMeta, setPurchaseRuleMeta] = useState({
    allowed: true,
    requiresCdf: false,
    blockingReason: null as string | null,
    blockingReasons: [] as string[],
    cdfThresholdAmount: '',
    referenceCurrencyCode: '',
  });
  const [isCdfModalOpen, setIsCdfModalOpen] = useState(false);
  const [pendingSubmitPayload, setPendingSubmitPayload] =
    useState<IPurchaseFormValues | null>(null);
  const [cdfDeclarationValues, setCdfDeclarationValues] =
    useState<IPurchaseCdfDeclarationValues | null>(null);
  const transactionDatePolicy = useMemo(
    () => getTransactionDatePolicy(policyContext),
    [policyContext]
  );

  const handleSelectDraftDocument = async (
    documentProfileId: string,
    file: File
  ) => {
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

  const handleFormSubmit = async (values: IPurchaseFormValues) => {
    if (purchaseRuleMeta.requiresCdf && !cdfDeclarationValues) {
      setPendingSubmitPayload(values);
      setIsCdfModalOpen(true);
      return;
    }

    const mergedValues = cdfDeclarationValues
      ? {
          ...values,
          ...cdfDeclarationValues,
        }
      : values;

    await onSubmit(mergedValues, draftDocumentAttachments);
  };

  const handleConfirmCdfDeclaration = async (
    values: IPurchaseCdfDeclarationValues
  ) => {
    setCdfDeclarationValues(values);
    setIsCdfModalOpen(false);

    if (!pendingSubmitPayload) {
      return;
    }

    const mergedValues = {
      ...pendingSubmitPayload,
      ...values,
    };

    setPendingSubmitPayload(null);
    await onSubmit(mergedValues, draftDocumentAttachments);
  };

  const handleCdfModalOpenChange = (open: boolean) => {
    setIsCdfModalOpen(open);

    if (open) {
      return;
    }

    setPendingSubmitPayload(null);
  };

  const submitMessage = useMemo(() => {
    const messages: string[] = [];

    if (!transactionDatePolicy.canPunchTransactions) {
      messages.push(PURCHASE_RULE_TEXT.cannotPunchTransactions);
    }

    if (isPurchaseRuleBlocked) {
      const blockingMessages =
        purchaseRuleMeta.blockingReasons.length > 0
          ? purchaseRuleMeta.blockingReasons
          : [
              purchaseRuleMeta.blockingReason ||
                PURCHASE_RULE_TEXT.failedFallback,
            ];
      messages.push(...blockingMessages);
    } else if (purchaseRuleMeta.requiresCdf) {
      messages.push(
        PURCHASE_RULE_TEXT.cdfRequired(
          purchaseRuleMeta.cdfThresholdAmount,
          purchaseRuleMeta.referenceCurrencyCode
        )
      );
    }

    return messages.join(' ');
  }, [
    isPurchaseRuleBlocked,
    purchaseRuleMeta.blockingReason,
    purchaseRuleMeta.blockingReasons,
    purchaseRuleMeta.cdfThresholdAmount,
    purchaseRuleMeta.referenceCurrencyCode,
    purchaseRuleMeta.requiresCdf,
    transactionDatePolicy.canPunchTransactions,
  ]);

  return (
    <Form<IPurchaseFormValues>
      id="purchase-form"
      onSubmit={handleFormSubmit}
      onError={errors => {
        console.warn('[PurchaseForm] submit validation failed', errors);
      }}
      resolver={
        yupResolver(
          createPurchaseFormSchema(defaultValues.transactionType)
        ) as unknown as Resolver<IPurchaseFormValues>
      }
      defaultValues={defaultValues}
      mode="onBlur"
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: onCancel,
        onCancel,
        showSubmit: !readOnly,
        isSubmitDisabled:
          isPurchaseRuleBlocked || !transactionDatePolicy.canPunchTransactions,
        submitMessage: submitMessage || undefined,
      }}
    >
      <PurchaseFormBody
        purchasePageType={purchasePageType}
        pricingData={pricingData}
        partyProfileTypes={partyProfileTypes}
        requiresApproval={requiresApproval}
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
        onPurchaseRuleBlockChange={setIsPurchaseRuleBlocked}
        onPurchaseRuleMetaChange={setPurchaseRuleMeta}
        transactionDatePolicy={transactionDatePolicy}
      />

      <PurchaseCdfDeclarationModal
        open={isCdfModalOpen}
        onOpenChange={handleCdfModalOpenChange}
        initialValues={cdfDeclarationValues ?? undefined}
        onConfirm={values => {
          void handleConfirmCdfDeclaration(values);
        }}
      />
    </Form>
  );
};

export default PurchaseForm;
