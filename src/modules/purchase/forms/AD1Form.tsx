import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  CardSection,
} from '@/components/ui';
import {
  Form,
  FormFieldInput,
  FormFieldDatePicker,
  FormFieldTextarea,
  FormFieldCategoryOption,
  FormFieldSelect,
} from '@/components/forms';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { AccountProfileLedgerLabelEnum } from '@/modules/accountProfile/utils/accountProfileLedgerLabels';
import type { IAccountProfileListQuery } from '@/modules/accountProfile/types/accountProfileTypes';
import { ad1Schema } from '../schema/ad1Schema';
import { TransactionProfileType } from './ad1ProfileType';
import { currencyProfileApi } from '@/api/currencyProfile';
import { currencyRatesApi } from '@/api/currencyRates/currencyRates.api';
import { partyProfileApi } from '@/api/partyProfile';
import { accountProfileApi } from '@/api/accountProfile';
import { productProfileApi } from '@/api/productProfile/productProfile.api';
import { PartyProfileCommissionTypeEnum, type PartyProfileCommissionType } from '@/modules/partyProfiles/types/partyProfileTypes';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import { TransactionTypeEnum } from '@/modules/transactions';
import type { AsyncSelectResponse } from '@/components/ui';
import type { DefaultValues } from 'react-hook-form';
import type { IAd1FormValues } from '../types';
import type { TransactionType } from '@/modules/transactions';
import {
  getPurchaseTransactionAccountFilter,
  getPurchaseTransactionProductFilter,
} from '../utils/purchaseUtils';
import { PurchaseWorkplaceFields } from '../components/PurchaseWorkplaceFields';
export { TransactionProfileType } from './ad1ProfileType';

interface AD1FormProps {
  defaultValues: DefaultValues<IAd1FormValues>;
  onSubmit: (values: IAd1FormValues) => Promise<void> | void;
  onCancel: () => void;
  readOnly?: boolean;
  allowWorkplaceSelection?: boolean;
  submitLabel?: string;
}

export const AD1Form = ({
  defaultValues,
  onSubmit,
  onCancel,
  readOnly = false,
  allowWorkplaceSelection = true,
  submitLabel = 'Save',
}: AD1FormProps) => {
  return (
    <Form<IAd1FormValues>
      id="ad1-form"
      onSubmit={onSubmit}
      resolver={yupResolver(ad1Schema)}
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
      <AD1FormBody readOnly={readOnly} allowWorkplaceSelection={allowWorkplaceSelection} />
    </Form>
  );
};

interface AD1FormBodyProps {
  readOnly: boolean;
  allowWorkplaceSelection: boolean;
}

const AD1FormBody = ({ readOnly, allowWorkplaceSelection }: AD1FormBodyProps) => {
  const form = useFormContext<IAd1FormValues>();
  const { control, setValue } = form;

  const transactionType = useWatch({
    name: 'transactionType',
    control,
  }) as TransactionType;
  const productId = useWatch({ name: 'productId', control });
  const currencyId = useWatch({ name: 'currencyId', control });
  const agentId = useWatch({ name: 'agentId', control });
  const branchId = useWatch({ name: 'branchId', control });
  const fcVolume = useWatch({ name: 'fcVolume', control });
  const saleRate = useWatch({ name: 'saleRate', control });
  const bankCharges = useWatch({ name: 'bankCharges', control });
  const otherIncome = useWatch({ name: 'otherIncome', control });
  const watchedFinalAmount = useWatch({ name: 'finalAmount', control });
  const commPercentOnFe = useWatch({ name: 'commPercentOnFe', control });
  const watchedAgentComm = useWatch({ name: 'agentComm', control });
  const tds = useWatch({ name: 'tds', control });
  const tcs = useWatch({ name: 'tcs', control });

  const [productProfiles, setProductProfiles] = useState<import('@/modules/productProfile/types').IProductProfile[]>([]);
  const [currencies, setCurrencies] = useState<ICurrencyProfile[]>([]);
  const agentRuleRef = useRef<{ type: PartyProfileCommissionType; value: number } | null>(null);
  // Cache of full agent data (with commissionRules) keyed by agent ID
  const agentCacheRef = useRef<Map<string, import('@/modules/partyProfiles/types/partyProfileTypes').IPartyProfile>>(new Map());

  // Load product profiles and currencies on mount
  useEffect(() => {
    productProfileApi.getProductProfiles().then(setProductProfiles).catch(console.error);
    currencyProfileApi.getCurrencyProfiles().then(res => setCurrencies(res.filter(c => c.active))).catch(console.error);
  }, []);

  // Fetch and apply agent's commission rule
  useEffect(() => {
    if (readOnly) return;
    if (!agentId) {
      agentRuleRef.current = null;
      return;
    }
    // Need product and currency to match commission rules
    if (!productId || !currencyId || currencies.length === 0) {
      // Don't clear agentRuleRef — wait until product+currency are selected
      return;
    }

    const fetchAgentRule = async () => {
      try {
        // Only use cache if commissionRules was actually loaded (property exists).
        // The agents list endpoint omits commissionRules, so always fall back to
        // the full party profile fetch which includes them via relations.
        const cached = agentCacheRef.current.get(agentId);
        const agent = cached?.commissionRules !== undefined
          ? cached
          : await partyProfileApi.getPartyProfileById(agentId);
        if (!agent) {
          agentRuleRef.current = null;
          return;
        }

        // productId is now a product profile UUID — get productCode directly
        const productProfile = productProfiles.find(p => p.id === productId);
        const productVal = productProfile?.productCode;
        const currencyVal = currencies.find(c => c.id === currencyId)?.currencyCode;

        if (!productVal || !currencyVal) {
          agentRuleRef.current = null;
          return;
        }

        const rule = agent.commissionRules?.find(
          r =>
            String(r.productCode).toUpperCase() === String(productVal).toUpperCase() &&
            String(r.currencyCode).toUpperCase() === String(currencyVal).toUpperCase()
        );

        if (rule) {
          const ruleVal = parseFloat(rule.commissionValue) || 0;

          if (rule.commissionType === PartyProfileCommissionTypeEnum.PERCENTAGE) {
            agentRuleRef.current = { type: PartyProfileCommissionTypeEnum.PERCENTAGE, value: ruleVal };
            setValue('commGiven', PartyProfileCommissionTypeEnum.PERCENTAGE, { shouldValidate: false });
            setValue('commPercentOnFe', rule.commissionValue, { shouldValidate: false });
          } else if (rule.commissionType === PartyProfileCommissionTypeEnum.PAISA) {
            agentRuleRef.current = { type: PartyProfileCommissionTypeEnum.PAISA, value: ruleVal };
            setValue('commGiven', PartyProfileCommissionTypeEnum.PAISA, { shouldValidate: false });
            setValue('commPercentOnFe', '0', { shouldValidate: false });
            const fc = parseFloat(String(fcVolume)) || 0;
            setValue('agentComm', ((ruleVal / 100) * fc).toFixed(2), { shouldValidate: false });
          }
        } else {
          // No matching rule — default to PAISA
          agentRuleRef.current = null;
          setValue('commGiven', PartyProfileCommissionTypeEnum.PAISA, { shouldValidate: false });
          setValue('commPercentOnFe', '0', { shouldValidate: false });
          setValue('agentComm', '0', { shouldValidate: false });
        }
      } catch (error) {
        console.error('Error fetching agent commission rule:', error);
        agentRuleRef.current = null;
      }
    };

    void fetchAgentRule();
  }, [agentId, productId, currencyId, productProfiles, currencies, setValue, readOnly, fcVolume]);

  // Auto-calculate Total INR Amt = FC Volume × Sale Rate
  useEffect(() => {
    const fc = parseFloat(String(fcVolume)) || 0;
    const rate = parseFloat(String(saleRate)) || 0;
    const total = fc * rate;
    setValue('totalInrAmt', total === 0 ? '' : total.toFixed(2), { shouldValidate: false });
  }, [fcVolume, saleRate, setValue]);

  // Auto-fill sale rate from currency's latest rate when currency changes
  useEffect(() => {
    if (!currencyId || readOnly) return;
    const fetchRate = async () => {
      try {
        const rates = await currencyRatesApi.getLatestRates(currencyId);
        if (!rates.length) return;
        const latestRate = rates[0];
        const baseSale = parseFloat(latestRate.baseSaleRate) || 0;
        const currency = currencies.find(c => c.id === currencyId);
        const ratePer = parseFloat(currency?.ratePer ?? '1') || 1;
        const perUnit = ratePer / baseSale;
        if (perUnit > 0) {
          setValue('saleRate', perUnit.toFixed(7), { shouldValidate: false });
        }
      } catch {
        // ignore rate fetch errors
      }
    };
    void fetchRate();
  }, [currencyId, currencies, setValue, readOnly]);

  // Auto-calculate Final Amount based on transaction type (includes TCS)
  useEffect(() => {
    const fc = parseFloat(String(fcVolume)) || 0;
    const rate = parseFloat(String(saleRate)) || 0;
    const totalInr = fc * rate;
    const charges = parseFloat(String(bankCharges)) || 0;
    const income = parseFloat(String(otherIncome)) || 0;
    const tcsVal = parseFloat(String(tcs)) || 0;
    let final: number;
    if (transactionType === TransactionTypeEnum.PURCHASE) {
      final = totalInr - charges - income + tcsVal;
    } else {
      final = totalInr + charges + income + tcsVal;
    }
    setValue('finalAmount', final === 0 ? '' : final.toFixed(2), { shouldValidate: false });
  }, [fcVolume, saleRate, bankCharges, otherIncome, tcs, transactionType, setValue]);

  // Auto-calculate Agent Comm = Final Amount × Comm% / 100 (PERCENTAGE type only)
  useEffect(() => {
    if (readOnly) return;
    if (agentRuleRef.current?.type !== PartyProfileCommissionTypeEnum.PERCENTAGE) return;
    const finalAmt = parseFloat(String(watchedFinalAmount)) || 0;
    const pct = parseFloat(String(commPercentOnFe)) || 0;
    const comm = (finalAmt * pct) / 100;
    setValue('agentComm', comm === 0 ? '0' : comm.toFixed(2), { shouldValidate: false });
  }, [watchedFinalAmount, commPercentOnFe, readOnly, setValue]);

  // Auto-calculate Commission Payable = Agent Comm − TDS
  useEffect(() => {
    if (readOnly) return;
    const comm = parseFloat(String(watchedAgentComm)) || 0;
    const tdsVal = parseFloat(String(tds)) || 0;
    const payable = comm - tdsVal;
    setValue('commissionPayable', payable === 0 ? '0' : payable.toFixed(2), { shouldValidate: false });
  }, [watchedAgentComm, tds, readOnly, setValue]);

  // Reset Bank field if Type changes
  const prevTypeRef = useRef(transactionType);
  useEffect(() => {
    if (prevTypeRef.current !== transactionType) {
      setValue('bankNameId', '');
      prevTypeRef.current = transactionType;
    }
  }, [transactionType, setValue]);

  // Reset Agent if Branch changes
  const prevBranchRef = useRef(branchId);
  useEffect(() => {
    if (prevBranchRef.current !== branchId) {
      setValue('agentId', '');
      prevBranchRef.current = branchId;
    }
  }, [branchId, setValue]);

  const loadCurrencies = useCallback(async (search: string): Promise<AsyncSelectResponse> => {
    const currencies = await currencyProfileApi.getCurrencyProfiles(search);
    return {
      options: currencies
        .filter(c => c.active)
        .map(c => ({
          value: c.id,
          label: `${c.currencyCode} - ${c.currencyName}`,
        }))
    };
  }, []);

  const loadAgents = useCallback(async (search: string): Promise<AsyncSelectResponse> => {
    if (!branchId) return { options: [] };
    const res = await partyProfileApi.getAd1Agents({
      search: search || undefined,
      branchId,
    });
    // Cache full agent data (including commissionRules) for use when agent is selected
    res.forEach(a => agentCacheRef.current.set(a.id, a));
    return {
      options: res.map(a => ({
        value: a.id,
        label: `${a.code} - ${a.name}`,
      }))
    };
  }, [branchId]);

  const loadProducts = useCallback(async (search: string): Promise<AsyncSelectResponse> => {
    const products = await productProfileApi.getProductProfiles(
      getPurchaseTransactionProductFilter(transactionType)
    );
    const filtered = search
      ? products.filter(p =>
          p.productCode.toLowerCase().includes(search.toLowerCase()) ||
          (p.productDescription ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : products;
    return {
      options: filtered
        .filter(p => p.isActiveProduct)
        .map(p => ({
          value: p.id,
          label: `${p.productCode} - ${p.productDescription ?? p.productCode}`,
        }))
    };
  }, [transactionType]);

  const loadBanks = useCallback(async (search: string): Promise<AsyncSelectResponse> => {
    const params: IAccountProfileListQuery = {
      search: search || undefined,
      limit: 100,
      active: true,
    };
    Object.assign(params, getPurchaseTransactionAccountFilter(transactionType));

    const res = await accountProfileApi.getAccountProfiles(params);
    // Filter only Bank Ledger accounts
    const filtered = res.data.filter(
      b => b.accountType?.value === AccountProfileLedgerLabelEnum.BankLedger
    );

    return {
      options: filtered.map(b => ({
        value: b.id,
        label: `${b.accountCode} - ${b.accountName}`,
      }))
    };
  }, [transactionType]);

  const typeOptions = Object.values(TransactionTypeEnum).map(val => ({
    value: val,
    label: val === TransactionTypeEnum.SALE ? 'Sale' : 'Purchase',
  }));

  const profileTypeOptions = Object.values(TransactionProfileType).map(val => ({
    value: val,
    label: val,
  }));

  const maxDob = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }, []);

  return (
    <div className="space-y-6">
      <CardSection heading="Workplace">
        <PurchaseWorkplaceFields readOnly={readOnly || !allowWorkplaceSelection} />
      </CardSection>

      {/* Header section */}
      <CardSection heading="AD1 Header Details">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldSelect
            name="transactionType"
            label="Type"
            defaultOptions={typeOptions}
            loadOptions={async () => ({ options: typeOptions })}
            isSearchable={false}
            disabled={readOnly}
          />
          <FormFieldSelect
            name="profileType"
            label="Profile Type"
            defaultOptions={profileTypeOptions}
            loadOptions={async () => ({ options: profileTypeOptions })}
            isSearchable={false}
            disabled={readOnly}
          />
          <FormFieldInput name="dealId" label="Deal ID" placeholder="Deal ID" disabled={readOnly} />
          <FormFieldInput name="docNo" label="Doc No." placeholder="Doc No." disabled={readOnly} />
          <FormFieldDatePicker name="transactionDate" label="Transaction Date" disabled={readOnly} />
          <FormFieldCategoryOption name="marketingId" code={CategoryOptionCodeEnum.Marketing} label="Marketing" disabled={readOnly} />
          <FormFieldCategoryOption name="segmentId" code={CategoryOptionCodeEnum.Segment} label="Segment" disabled={readOnly} />
          <FormFieldInput name="servicedBy" label="Serviced By" placeholder="Serviced By" disabled={readOnly} />
          <FormFieldCategoryOption name="purposeId" code={CategoryOptionCodeEnum.Purpose} label="Purpose" disabled={readOnly} />
        </div>
      </CardSection>

      {/* Remitter section */}
      <CardSection heading="Remitter Details">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput name="remitterName" label="Remitter Name" placeholder="Remitter Name" disabled={readOnly} />
          <FormFieldInput name="contactNo" label="Contact No." placeholder="Contact No." disabled={readOnly} />
          <FormFieldInput name="email" label="E-mail" placeholder="E-mail" disabled={readOnly} />
          <div className="md:col-span-2 lg:col-span-3">
            <FormFieldTextarea name="address" label="Address" placeholder="Address" disabled={readOnly} />
          </div>
          <FormFieldInput name="pan" label="Pan" placeholder="PAN (e.g. ABCDE1234F)" disabled={readOnly} />
          <FormFieldDatePicker name="dateOfBirth" label="Date of Birth" maxDate={maxDob} disabled={readOnly} />
        </div>
      </CardSection>

      {/* Beneficiary section */}
      <CardSection heading="Beneficiary & Product Details">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldSelect key={`product-${transactionType}`} name="productId" label="Product" loadOptions={loadProducts} disabled={readOnly} />
          <FormFieldInput name="beneficiaryName" label="Beneficiary Name" placeholder="Beneficiary Name" disabled={readOnly} />
          <FormFieldInput name="beneAccountNumber" label="Bene. Account Number" placeholder="Bene. Account Number" disabled={readOnly} />
          <FormFieldInput name="beneBankName" label="Bene Bank Name" placeholder="Bene. Bank Name" disabled={readOnly} />
          <FormFieldInput name="swiftCode" label="Swift Code" placeholder="Swift Code" disabled={readOnly} />
          <FormFieldCategoryOption name="relationshipId" code={CategoryOptionCodeEnum.Relationship} label="Relationship" disabled={readOnly} />
          <FormFieldSelect name="currencyId" label="Currency Code" loadOptions={loadCurrencies} disabled={readOnly} />
          <div className="md:col-span-2 lg:col-span-3">
            <FormFieldTextarea name="beniAddress" label="Beni. Address" placeholder="Beneficiary Address" disabled={readOnly} />
          </div>
        </div>
      </CardSection>

      {/* Pricing calculations section */}
      <CardSection heading="Pricing & Calculations">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput name="fcVolume" label="Quantity" type="number" step="any" placeholder="0.0000000" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="saleRate" label="Sale Rate" type="number" step="any" placeholder="0.0000000" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="totalInrAmt" label="Total INR Amt." type="number" step="any" valueTransform="none" disabled placeholder="0.00" />
          <FormFieldInput name="gst" label="GST" type="number" step="any" placeholder="0.00" valueTransform="none" disabled />
          <FormFieldInput name="bankCharges" label="Bank Charges" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="tcs" label="TCS" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="otherIncome" label="Other Income" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="finalAmount" label="Final Amount" type="number" step="any" valueTransform="none" disabled placeholder="0.00" />
          <FormFieldInput name="settlementRate" label="Settlement Rate" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="grossRevenue" label="Gross Revenue" type="number" step="any" valueTransform="none" disabled={readOnly} placeholder="0.00" />
          <FormFieldInput name="revenueReceivable" label="Revenue Receivable" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
        </div>
      </CardSection>

      {/* Agent Commissions section */}
      <CardSection heading="Agent Commissions">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldSelect key={`agent-${branchId || ''}`} name="agentId" label="Agent" loadOptions={loadAgents} disabled={readOnly} />
          <FormFieldInput name="commGiven" label="Comm. Given" placeholder="—" disabled />
          <FormFieldInput name="commPercentOnFe" label="Comm % on FE" type="number" step="any" placeholder="0.0000" valueTransform="none" disabled />
          <FormFieldInput name="agentComm" label="Agent Comm." type="number" step="any" placeholder="0.00" valueTransform="none" disabled />
          <FormFieldInput name="tds" label="TDS" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="commissionPayable" label="Commission Payable" type="number" step="any" valueTransform="none" disabled placeholder="0.00" />
          <FormFieldInput name="netRevenue" label="Net Revenue" type="number" step="any" valueTransform="none" disabled={readOnly} placeholder="0.00" />
        </div>
      </CardSection>

      {/* Settlement section */}
      <CardSection heading="Bank & Settlement Reference">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldSelect name="bankNameId" label="Bank Name" loadOptions={loadBanks} disabled={readOnly} />
          <FormFieldInput name="rtgsImpsNeftRefNo" label="RTGS/IMPS/NEFT/Ref No" placeholder="RTGS/IMPS/NEFT/Ref No" disabled={readOnly} />
          <div className="md:col-span-2 lg:col-span-3">
            <FormFieldTextarea name="remarks" label="Remarks" placeholder="Remarks..." disabled={readOnly} />
          </div>
        </div>
      </CardSection>

    </div>
  );
};
