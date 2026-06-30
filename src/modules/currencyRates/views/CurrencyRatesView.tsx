import { useState } from 'react';
import { Button } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { currencyRatesApi } from '@/api/currencyRates';
import {
  CurrencyRateGroupModal,
  CurrencyRateEntryModal,
  CurrencyRateOverridesSection,
  CurrencyRatesGroupsSection,
  CurrencyRatesRatesSection,
  CurrencyRateOverrideModal,
} from '../components';
import { useCurrencyRatesViewData } from '../hooks/useCurrencyRatesViewData';
import type {
  ICurrencyRate,
  ICurrencyRateEntryFormValues,
  ICurrencyRateGroup,
  ICurrencyRateGroupFormValues,
  IProductCurrencyRate,
  IProductCurrencyRateFormValues,
  ICurrencyRateMargin,
} from '../types/currencyRatesTypes';

type ActiveModal = 'group' | 'rate' | 'rule' | null;

const createEmptyMargin = (): ICurrencyRateMargin => ({
  marginType: '',
  marginValue: '',
  minRate: '',
  maxRate: '',
});

const createEmptyGroupForm = (): ICurrencyRateGroupFormValues => ({
  id: '',
  code: '',
  name: '',
  description: '',
  buyMarginType: '',
  buyMarginValue: '',
  saleMarginType: '',
  saleMarginValue: '',
  isActive: true,
});

const createEmptyRateForm = (): ICurrencyRateEntryFormValues => ({
  currencyId: '',
  provider: '',
  baseBuyRate: '',
  baseSaleRate: '',
  baseRate: '',
  notes: '',
});

const createEmptyRuleForm = (): IProductCurrencyRateFormValues => ({
  id: '',
  productId: '',
  currencyId: '',
  buy: createEmptyMargin(),
  sale: createEmptyMargin(),
  isActive: true,
});

const mapGroupToForm = (group: ICurrencyRateGroup): ICurrencyRateGroupFormValues => ({
  id: group.id,
  code: group.code,
  name: group.name,
  description: group.description || '',
  buyMarginType: group.buyMarginType ?? '',
  buyMarginValue: group.buyMarginValue ?? '',
  saleMarginType: group.saleMarginType ?? '',
  saleMarginValue: group.saleMarginValue ?? '',
  isActive: group.isActive,
});

const mapRateToForm = (rate: ICurrencyRate): ICurrencyRateEntryFormValues => ({
  currencyId: rate.currencyId,
  provider: rate.provider,
  baseBuyRate: rate.baseBuyRate || '',
  baseSaleRate: rate.baseSaleRate || '',
  baseRate: rate.baseRate || '',
  notes: rate.notes || '',
});

const mapRuleToForm = (rule: IProductCurrencyRate): IProductCurrencyRateFormValues => ({
  id: rule.id,
  productId: rule.productId,
  currencyId: rule.currencyId,
  buy: { ...rule.buy },
  sale: { ...rule.sale },
  isActive: rule.isActive,
});

export const CurrencyRatesView = () => {
  const { data, isLoading, isFetching, error, refetch } =
    useCurrencyRatesViewData();

  const groups = data?.groups ?? [];
  const products = data?.products ?? [];
  const currencies = data?.currencies ?? [];
  const rates = data?.rates ?? [];
  const productCurrencyRates = data?.productCurrencyRates ?? [];

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedGroup, setSelectedGroup] = useState<ICurrencyRateGroup | null>(null);
  const [selectedRate, setSelectedRate] = useState<ICurrencyRate | null>(null);
  const [selectedRule, setSelectedRule] = useState<IProductCurrencyRate | null>(null);
  const [groupForm, setGroupForm] = useState<ICurrencyRateGroupFormValues>(createEmptyGroupForm());
  const [rateForm, setRateForm] = useState<ICurrencyRateEntryFormValues>(createEmptyRateForm());
  const [ruleForm, setRuleForm] = useState<IProductCurrencyRateFormValues>(createEmptyRuleForm());
  const [savingTarget, setSavingTarget] = useState<ActiveModal>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isRefreshing = isFetching && !isLoading;

  const closeModal = () => {
    setActiveModal(null);
    setSelectedGroup(null);
    setSelectedRate(null);
    setSelectedRule(null);
    setSavingTarget(null);
    setActionError(null);
  };

  const openNewGroupModal = () => {
    setSelectedGroup(null);
    setGroupForm(createEmptyGroupForm());
    setActiveModal('group');
    setActionError(null);
  };

  const openEditGroupModal = (group: ICurrencyRateGroup) => {
    setSelectedGroup(group);
    setGroupForm(mapGroupToForm(group));
    setActiveModal('group');
    setActionError(null);
  };

  const openNewRateModal = () => {
    setSelectedRate(null);
    setRateForm(createEmptyRateForm());
    setActiveModal('rate');
    setActionError(null);
  };

  const openRateDetailModal = (rate: ICurrencyRate) => {
    setSelectedRate(rate);
    setRateForm(mapRateToForm(rate));
    setActiveModal('rate');
    setActionError(null);
  };

  const openNewRuleModal = () => {
    setSelectedRule(null);
    setRuleForm(createEmptyRuleForm());
    setActiveModal('rule');
    setActionError(null);
  };

  const openEditRuleModal = (rule: IProductCurrencyRate) => {
    setSelectedRule(rule);
    setRuleForm(mapRuleToForm(rule));
    setActiveModal('rule');
    setActionError(null);
  };

  const handleSaveGroup = async () => {
    setSavingTarget('group');
    setActionError(null);

    try {
      const payload = {
        code: groupForm.code.trim().toUpperCase(),
        name: groupForm.name.trim(),
        description: groupForm.description.trim() || undefined,
        buyMarginType: groupForm.buyMarginType || null,
        buyMarginValue: groupForm.buyMarginValue || null,
        saleMarginType: groupForm.saleMarginType || null,
        saleMarginValue: groupForm.saleMarginValue || null,
        isActive: groupForm.isActive,
      };

      if (groupForm.id) {
        await currencyRatesApi.updateGroup(groupForm.id, payload);
      } else {
        await currencyRatesApi.createGroup(payload);
      }

      await refetch();
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save group');
    } finally {
      setSavingTarget(null);
    }
  };

  const handleSaveRate = async () => {
    setSavingTarget('rate');
    setActionError(null);

    try {
      const payload =
        rateForm.provider === 'TICKER'
          ? {
              currencyId: rateForm.currencyId,
              provider: rateForm.provider,
              baseBuyRate: rateForm.baseBuyRate,
              baseSaleRate: rateForm.baseSaleRate,
              isActive: true,
              notes: rateForm.notes,
            }
          : {
              currencyId: rateForm.currencyId,
              provider: rateForm.provider,
              baseRate: rateForm.baseRate,
              isActive: true,
              notes: rateForm.notes,
            };

      await currencyRatesApi.createRateEntry(payload);
      await refetch();
      closeModal();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save rate');
    } finally {
      setSavingTarget(null);
    }
  };

  const handleSaveRule = async () => {
    setSavingTarget('rule');
    setActionError(null);

    try {
      const payload = {
        productId: ruleForm.productId,
        currencyId: ruleForm.currencyId,
        buy: ruleForm.buy,
        sale: ruleForm.sale,
        isActive: ruleForm.isActive,
      };

      if (ruleForm.id) {
        await currencyRatesApi.updateProductCurrencyRate(ruleForm.id, payload);
      } else {
        await currencyRatesApi.createProductCurrencyRate(payload);
      }

      await refetch();
      closeModal();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to save product override',
      );
    } finally {
      setSavingTarget(null);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border-primary bg-surface-primary p-5 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-text-primary">
            Currency Rates
          </h1>
          <p className="max-w-3xl text-sm text-text-secondary">
            Manage group pricing, manual rate entries, and product-currency overrides from one place.
          </p>
          {isRefreshing ? (
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Refreshing current data...
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="ghost" onClick={() => void refetch()}>
            Refresh
          </Button>
          <Button type="button" onClick={openNewGroupModal}>
            New Group
          </Button>
          <Button type="button" onClick={openNewRateModal}>
            New Rate
          </Button>
          <Button type="button" onClick={openNewRuleModal}>
            New Override
          </Button>
        </div>
      </div>

      {error || actionError ? (
        <div className="rounded-sm border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          {actionError || (error instanceof Error ? error.message : 'Failed to load currency rate data')}
        </div>
      ) : null}

      <CurrencyRatesGroupsSection
        groups={groups}
        loading={isLoading}
        refreshing={isRefreshing}
        onCreateGroup={openNewGroupModal}
        onOpenGroup={openEditGroupModal}
      />

      <CurrencyRatesRatesSection
        rates={rates}
        loading={isLoading}
        refreshing={isRefreshing}
        onOpenRate={openRateDetailModal}
      />

      <CurrencyRateOverridesSection
        currencies={currencies}
        rates={rates}
        rules={productCurrencyRates}
        loading={isLoading}
        refreshing={isRefreshing}
        onOpenRule={openEditRuleModal}
      />

      <CurrencyRateGroupModal
        open={activeModal === 'group'}
        mode={groupForm.id ? 'edit' : 'create'}
        form={groupForm}
        setForm={setGroupForm}
        selectedGroup={selectedGroup}
        isSubmitting={savingTarget === 'group'}
        onSubmit={handleSaveGroup}
        onClose={closeModal}
      />

      <CurrencyRateEntryModal
        open={activeModal === 'rate'}
        form={rateForm}
        setForm={setRateForm}
        currencies={currencies}
        selectedRate={selectedRate}
        isSubmitting={savingTarget === 'rate'}
        onSubmit={handleSaveRate}
        onClose={closeModal}
      />

      <CurrencyRateOverrideModal
        open={activeModal === 'rule'}
        form={ruleForm}
        setForm={setRuleForm}
        products={products}
        currencies={currencies}
        rates={rates}
        selectedRule={selectedRule}
        isSubmitting={savingTarget === 'rule'}
        onSubmit={handleSaveRule}
        onClose={closeModal}
      />
    </section>
  );
};

export default CurrencyRatesView;
