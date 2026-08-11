import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { useWatch, useFormContext, type SubmitErrorHandler } from 'react-hook-form';
import * as yup from 'yup';
import { CardSection } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import {
  Form,
  FormFieldCategoryOption,
  FormFieldDatePicker,
  FormFieldTextarea,
} from '@/components/forms';
import { DocumentRequirementCard } from '@/modules/documentProfiles/components';
import { useResolveDocumentProfiles } from '@/modules/documentProfiles/hooks';
import { SelectCurrencyProfiles } from '@/modules/currencyProfile/components';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import { useAuth } from '@/lib/AuthContext';
import { useGetBranchProfile } from '@/modules/branchProfile/hooks/useGetBranchProfile';
import { useCurrencyRatesViewData } from '@/modules/currencyRates/hooks/useCurrencyRatesViewData';
import { useListAdditionalSettings } from '@/modules/additionalSettings/hooks';
import { getAdditionalSettingBooleanValue } from '@/modules/additionalSettings/utils';
import { AdditionalSettingsCodeEnum } from '@/modules/additionalSettings/constants';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { PurchaseTransactionTable } from '@/modules/purchase/components/PurchaseTransactionTable';
import { createEmptyPurchaseFormValues } from '@/modules/purchase/utils/purchaseUtils';
import { TransactionTypeEnum, TradeModeEnum, TransactionTypeProfileEnum } from '@/modules/transactions';
import type { IPurchaseFormValues } from '@/modules/purchase/types/purchaseTypes';
import type { IPurchaseDraftDocumentAttachment } from '@/modules/purchase/types/purchaseTypes';
import { useCreateFakeCurrency } from '../hooks';
import { getTransactionDatePolicy } from '@/modules/transactionPolicies/utils/transactionDatePolicy';

const fakeCurrencySchema = yup.object({
  transactionDate: yup.string().required('Transaction date is required'),
  reasonId: yup.string().required('Reason is required'),
  remarks: yup.string().trim().nullable().default(''),
  transactions: yup.array().of(yup.object({
    currencyId: yup.string().required('Currency is required'),
    productId: yup.string().required('Product is required'),
    quantity: yup.string().required('Quantity is required'),
    rate: yup.string().required('Rate is required'),
  })).min(1, 'At least one transaction item is required').required(),
});

type FakeCurrencyFormValues = IPurchaseFormValues & { reasonId: string; remarks: string };

interface FakeCurrencyCreateViewProps {
  initialValues?: FakeCurrencyFormValues;
  readOnly?: boolean;
}

const FakeCurrencyTotal = () => {
  const rows = (useWatch({ name: 'transactions' }) as FakeCurrencyFormValues['transactions'] | undefined) ?? [];
  const total = rows.reduce((sum: number, row) => sum + Number(row?.finalAmount || 0), 0);
  return <div className="text-right text-lg font-semibold">{total.toFixed(2)}</div>;
};

const FakeCurrencyPicker = ({
  rowIndex,
  onClose,
}: {
  rowIndex: number | null;
  onClose: () => void;
}) => {
  const form = useFormContext<FakeCurrencyFormValues>();
  return (
    <SelectCurrencyProfiles
      open={rowIndex !== null}
      selectable
      multiple={false}
      title="Select Currency"
      description="Choose a currency for this fake-currency entry."
      onContinue={currencies => {
        const currency = currencies[0] as ICurrencyProfile | undefined;
        if (!currency || rowIndex === null) return;
        form.setValue(`transactions.${rowIndex}.currencyId`, currency.id, { shouldDirty: true, shouldValidate: true });
        form.setValue(`transactions.${rowIndex}.currencyCode`, currency.currencyCode, { shouldDirty: true });
        form.setValue(`transactions.${rowIndex}.currencyName`, currency.currencyName, { shouldDirty: true });
        onClose();
      }}
      onClose={onClose}
    />
  );
};

export const FakeCurrencyCreateView = ({
  initialValues,
  readOnly = false,
}: FakeCurrencyCreateViewProps) => {
  const navigate = useNavigate();
  const { activeBranchId, activeCounterId, policyContext } = useAuth();
  const transactionDatePolicy = useMemo(
    () => getTransactionDatePolicy(policyContext),
    [policyContext],
  );
  const [currencyPickerRowIndex, setCurrencyPickerRowIndex] = useState<number | null>(null);
  const [draftDocuments, setDraftDocuments] = useState<Record<string, File | null>>({});
  const { data: branch } = useGetBranchProfile(activeBranchId ?? '');
  const { data: pricingData, isLoading: pricingLoading } = useCurrencyRatesViewData();
  const { data: settings = [], isLoading: settingsLoading } = useListAdditionalSettings();
  const { data: transactionDocumentProfiles = [], isLoading: documentProfilesLoading } =
    useResolveDocumentProfiles({ specificationType: 'TRANSACTION', type: 'FAKE_CURRENCY' });
  const { createFakeCurrency, isPending } = useCreateFakeCurrency();
  const rateEditable = getAdditionalSettingBooleanValue(
    settings,
    AdditionalSettingsCodeEnum.FakeCurrency,
    AdditionalSettingsCodeEnum.FakeCurrencyRateEditable,
    false,
  );

  const generatedDefaultValues = useMemo<FakeCurrencyFormValues>(() => ({
    ...createEmptyPurchaseFormValues(
      TransactionTypeEnum.SALE,
      TradeModeEnum.RETAIL,
      TransactionTypeProfileEnum.FAKE_CURRENCY,
      branch ? { id: branch.id, code: branch.code, name: branch.name, label: `${branch.code} - ${branch.name}` } : null,
      activeBranchId ?? '',
      activeCounterId ?? '',
      transactionDatePolicy.defaultTransactionDate,
    ),
    reasonId: '',
    remarks: '',
  }), [activeBranchId, activeCounterId, branch, transactionDatePolicy.defaultTransactionDate]);
  const defaultValues = initialValues ?? generatedDefaultValues;

  const draftDocumentAttachments = useMemo<IPurchaseDraftDocumentAttachment[]>(
    () =>
      Object.entries(draftDocuments).flatMap(([documentProfileId, file]) =>
        file ? [{ documentProfileId, file }] : []
      ),
    [draftDocuments]
  );

  if (pricingLoading || settingsLoading || documentProfilesLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader /></div>;
  }

  const resolvedPricingData = pricingData ?? {
    groups: [], products: [], currencies: [], rates: [], latestRates: [], productCurrencyRates: [],
  };

  const onError: SubmitErrorHandler<FakeCurrencyFormValues> = errors => {
    console.error('[FakeCurrencyForm] validation failed', errors);
  };

  return (
    <Form<FakeCurrencyFormValues>
      id="fake-currency-form"
      defaultValues={defaultValues}
      resolver={yupResolver(fakeCurrencySchema) as never}
      mode="onChange"
      onError={onError}
      onSubmit={async values => {
        if (readOnly) {
          return;
        }
        await createFakeCurrency({
          transaction: {
            slug: 'FAKE_CURRENCY',
            branchSnapshot: values.branchSnapshot,
            requiresApproval: false,
            partyProfileId: null,
            reasonId: values.reasonId,
            reasonSnapshot: null,
            transactionType: TransactionTypeEnum.SALE,
            tradeMode: TradeModeEnum.RETAIL,
            transactionDate: values.transactionDate,
            remarks: values.remarks || null,
            items: values.transactions.map(row => ({
              currencyId: row.currencyId,
              productId: row.productId,
              quantity: row.quantity,
              per: row.per || '1',
              rate: row.rate,
              commission: '0',
              commissionSnapshot: null,
              remarks: null,
            })),
            documents: [],
            additionalCharges: [],
            payments: [],
          },
          attachments: draftDocumentAttachments,
        });
        navigate('/fake-currencies');
      }}
      footer={readOnly ? undefined : {
        submitLabel: isPending ? 'Saving...' : 'Save Fake Currency',
        isSubmitDisabled: isPending || !transactionDatePolicy.canPunchTransactions,
      }}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Fake Currencies</h1>
          <p className="text-sm text-text-secondary">Remove unusable currency from the selected counter stock.</p>
        </div>
        <CardSection heading="Fake Currency Details" className="grid gap-4 md:grid-cols-2">
          <FormFieldDatePicker name="transactionDate" label="Transaction Date" disabled={readOnly || !transactionDatePolicy.canPunchTransactions} minDate={transactionDatePolicy.minDate} maxDate={transactionDatePolicy.maxDate} />
          <FormFieldCategoryOption name="reasonId" code={CategoryOptionCodeEnum.FakeCurrencyReason} label="Reason" disabled={readOnly} />
          <FormFieldTextarea name="remarks" label="Remarks" className="md:col-span-2" disabled={readOnly} />
        </CardSection>
        <PurchaseTransactionTable
          branchId={initialValues?.branchId ?? activeBranchId ?? ''}
          counterId={initialValues?.counterId ?? activeCounterId ?? ''}
          pricingData={resolvedPricingData}
          agentCommissionRules={[]}
          onOpenCurrencyPicker={setCurrencyPickerRowIndex}
          disabled={readOnly}
          rateEditable={rateEditable}
          useAverageSellRate
        />
        <CardSection heading="Total Amount" className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Total fake currency value</span>
          <FakeCurrencyTotal />
        </CardSection>
        {!readOnly ? <CardSection heading="Transaction Documents" className="space-y-4">
          <p className="text-sm text-text-secondary">
            Attach optional supporting documents for this fake-currency entry.
          </p>
          {transactionDocumentProfiles.length > 0 ? (
            <div className="grid gap-4">
              {transactionDocumentProfiles.map(profile => (
                <DocumentRequirementCard
                  key={profile.id}
                  profile={profile}
                  selectedFile={draftDocuments[profile.id] ?? null}
                  onSelectFile={(documentProfileId, file) =>
                    setDraftDocuments(previous => ({ ...previous, [documentProfileId]: file }))
                  }
                  onClearFile={documentProfileId =>
                    setDraftDocuments(previous => {
                      const next = { ...previous };
                      delete next[documentProfileId];
                      return next;
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">No active document profiles found.</p>
          )}
        </CardSection> : null}
      </div>
      {!readOnly ? <FakeCurrencyPicker rowIndex={currencyPickerRowIndex} onClose={() => setCurrencyPickerRowIndex(null)} /> : null}
    </Form>
  );
};

export default FakeCurrencyCreateView;
