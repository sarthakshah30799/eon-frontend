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
import { partyProfileApi } from '@/api/partyProfile';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { accountProfileApi } from '@/api/accountProfile';
import { branchProfileApi } from '@/api/branchProfile/branchProfile.api';
import { PartyProfileCommissionTypeEnum, type PartyProfileCommissionType } from '@/modules/partyProfiles/types/partyProfileTypes';
import type { ICategoryOption } from '@/types/categoryOptionTypes';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import { TransactionTypeEnum } from '@/modules/transactions';
import type { AsyncSelectResponse } from '@/components/ui';
import type { IUser } from '@/modules/users/types/userTypes';
import type { DefaultValues } from 'react-hook-form';
import type { IAd1FormValues } from '../types';

interface AD1FormProps {
  defaultValues: DefaultValues<IAd1FormValues>;
  onSubmit: (values: IAd1FormValues) => Promise<void> | void;
  onCancel: () => void;
  readOnly?: boolean;
  user: IUser | null;
}

export const AD1Form = ({
  defaultValues,
  onSubmit,
  onCancel,
  readOnly = false,
  user,
}: AD1FormProps) => {
  return (
    <Form<IAd1FormValues>
      id="ad1-form"
      onSubmit={onSubmit}
      resolver={yupResolver(ad1Schema)}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel: 'Create',
        backLabel: 'Back',
        onBackClick: onCancel,
        onCancel,
        showSubmit: !readOnly,
      }}
    >
      <AD1FormBody
        readOnly={readOnly}
        user={user}
      />
    </Form>
  );
};

interface AD1FormBodyProps {
  readOnly: boolean;
  user: IUser | null;
}

const AD1FormBody = ({ readOnly, user }: AD1FormBodyProps) => {
  const form = useFormContext<IAd1FormValues>();
  const { control, setValue } = form;

  const transactionType = useWatch({ name: 'transactionType', control });
  const productId = useWatch({ name: 'productId', control });
  const currencyId = useWatch({ name: 'currencyId', control });
  const fxRefAgentId = useWatch({ name: 'fxRefAgentId', control });
  const branchId = useWatch({ name: 'branchId', control });
  const fcVolume = useWatch({ name: 'fcVolume', control });

  const [products, setProducts] = useState<ICategoryOption[]>([]);
  const [currencies, setCurrencies] = useState<ICurrencyProfile[]>([]);
  const [commGivenOptions, setCommGivenOptions] = useState<ICategoryOption[]>([]);
  const agentRuleRef = useRef<{ type: PartyProfileCommissionType; value: number } | null>(null);

  // Load products, currencies and commission options on mount
  useEffect(() => {
    categoryOptionsApi.getCategoryOptionsByCode(CategoryOptionCodeEnum.Product).then(setProducts).catch(console.error);
    currencyProfileApi.getCurrencyProfiles().then(res => setCurrencies(res.filter(c => c.active))).catch(console.error);
    categoryOptionsApi.getCategoryOptionsByCode(CategoryOptionCodeEnum.CommissionGiven).then(setCommGivenOptions).catch(console.error);
  }, []);

  // Fetch and apply agent's commission rule
  useEffect(() => {
    if (readOnly) return;
    if (!fxRefAgentId || !productId || !currencyId || products.length === 0 || currencies.length === 0 || commGivenOptions.length === 0) {
      agentRuleRef.current = null;
      return;
    }

    const fetchAgentRule = async () => {
      try {
        const agent = await partyProfileApi.getPartyProfileById(fxRefAgentId);
        if (!agent) {
          agentRuleRef.current = null;
          return;
        }

        const productVal = products.find(p => p.id === productId)?.value;
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
            const opt = commGivenOptions.find(o => String(o.value) === PartyProfileCommissionTypeEnum.PERCENTAGE);
            if (opt) {
              agentRuleRef.current = { type: PartyProfileCommissionTypeEnum.PERCENTAGE, value: ruleVal };
              setValue('commGivenId', opt.id, { shouldValidate: true });
              setValue('commPercentOnFe', rule.commissionValue, { shouldValidate: true });
              setValue('agentComm', '0', { shouldValidate: true });
            }
          } else if (rule.commissionType === PartyProfileCommissionTypeEnum.PAISA) {
            const opt = commGivenOptions.find(o => String(o.value) === PartyProfileCommissionTypeEnum.PAISA);
            if (opt) {
              agentRuleRef.current = { type: PartyProfileCommissionTypeEnum.PAISA, value: ruleVal };
              setValue('commGivenId', opt.id, { shouldValidate: true });
              setValue('commPercentOnFe', '0', { shouldValidate: true });
              const fc = parseFloat(fcVolume) || 0;
              const calculatedAgentComm = (ruleVal / 100) * fc;
              setValue('agentComm', calculatedAgentComm.toFixed(2), { shouldValidate: true });
            }
          }
        } else {
          agentRuleRef.current = null;
        }
      } catch (error) {
        console.error('Error fetching agent commission rule:', error);
        agentRuleRef.current = null;
      }
    };

    void fetchAgentRule();
  }, [fxRefAgentId, productId, currencyId, products, currencies, commGivenOptions, setValue, readOnly]);

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
      setValue('fxRefAgentId', '');
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
    return {
      options: res.map(a => ({
        value: a.id,
        label: `${a.code} - ${a.name}`,
      }))
    };
  }, [branchId]);

  const loadBranches = useCallback(async (search: string): Promise<AsyncSelectResponse> => {
    const branches = await branchProfileApi.getBranchProfiles({ activeOnly: true });
    const filtered = search
      ? branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase()))
      : branches;
    return {
      options: filtered.map(b => ({
        value: b.id,
        label: `${b.code} - ${b.name}`,
      }))
    };
  }, []);

  const loadBanks = useCallback(async (search: string): Promise<AsyncSelectResponse> => {
    const params: IAccountProfileListQuery = {
      search: search || undefined,
      limit: 100,
      active: true,
    };

    if (transactionType === TransactionTypeEnum.SALE) {
      params.bulkSale = true;
    } else if (transactionType === TransactionTypeEnum.PURCHASE) {
      params.bulkPurchase = true;
    }

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

  const canSelectBranch = Boolean(user?.isAdmin || user?.isHo || user?.isHoStaff);

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
          <FormFieldSelect
            name="branchId"
            label="Branch"
            loadOptions={loadBranches}
            disabled={readOnly || !canSelectBranch}
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
          <FormFieldCategoryOption name="productId" code={CategoryOptionCodeEnum.Product} label="Product" disabled={readOnly} />
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
          <FormFieldInput name="fcVolume" label="FC Volume" type="number" step="any" placeholder="0.0000000" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="saleRate" label="Sale Rate" type="number" step="any" placeholder="0.0000000" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="totalInrAmt" label="Total INR Amt." type="number" step="any" valueTransform="none" disabled={readOnly} placeholder="0.00" />
          <FormFieldInput name="gst" label="GST" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="bankCharges" label="Bank Charges" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="tcs" label="TCS" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="otherIncome" label="Other Income" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="finalAmount" label="Final Amount" type="number" step="any" valueTransform="none" disabled={readOnly} placeholder="0.00" />
          <FormFieldInput name="settlementRate" label="Settlement Rate" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="grossRevenue" label="Gross Revenue" type="number" step="any" valueTransform="none" disabled={readOnly} placeholder="0.00" />
          <FormFieldInput name="revenueReceivable" label="Revenue Receivable" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
        </div>
      </CardSection>

      {/* Agent Commissions section */}
      <CardSection heading="Agent Commissions">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldSelect key={`agent-${branchId || ''}`} name="fxRefAgentId" label="FX Ref Agents" loadOptions={loadAgents} disabled={readOnly} />
          <FormFieldCategoryOption name="commGivenId" code={CategoryOptionCodeEnum.CommissionGiven} label="Comm. Given" disabled={readOnly} />
          <FormFieldInput name="commPercentOnFe" label="Comm % on FE" type="number" step="any" placeholder="0.0000" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="agentComm" label="Agent Comm." type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="tds" label="TDS" type="number" step="any" placeholder="0.00" valueTransform="none" disabled={readOnly} />
          <FormFieldInput name="commissionPayable" label="Commission Payable" type="number" step="any" valueTransform="none" disabled={readOnly} placeholder="0.00" />
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
