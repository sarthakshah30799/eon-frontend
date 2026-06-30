import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { Modal } from '@/components/ui/modal';
import { currencyProfileApi } from '@/api/currencyProfile';
import { currencyRatesApi } from '@/api/currencyRates';
import { productProfileApi } from '@/api/productProfile';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import type {
  ICurrencyRate,
  ICurrencyRateRule,
  ICurrencyRateGroup,
  IProductCurrencyRate,
  CurrencyRateMarginType,
  CurrencyRateProvider,
} from '../types/currencyRatesTypes';

type RateFormState = {
  currencyId: string;
  provider: CurrencyRateProvider | '';
  baseBuyRate: string;
  baseSaleRate: string;
  baseRate: string;
  notes: string;
};

type RuleFormState = {
  id: string;
  productId: string;
  currencyId: string;
  buy: ICurrencyRateRule['buy'];
  sale: ICurrencyRateRule['sale'];
  isActive: boolean;
};

type GroupFormState = {
  id: string;
  code: string;
  name: string;
  description: string;
  buyMarginType: CurrencyRateMarginType | '';
  buyMarginValue: string;
  saleMarginType: CurrencyRateMarginType | '';
  saleMarginValue: string;
  isActive: boolean;
};

const sectionClass = 'rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm space-y-4';
const inputClass = 'w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500';
const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary';

const emptyMargin = () => ({
  marginType: '' as CurrencyRateMarginType | '',
  marginValue: '',
  minRate: '',
  maxRate: '',
});

const createEmptyRule = (): RuleFormState => ({
  id: '',
  productId: '',
  currencyId: '',
  buy: emptyMargin(),
  sale: emptyMargin(),
  isActive: true,
});

const createEmptyGroup = (): GroupFormState => ({
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

export const CurrencyRatesView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<ICurrencyRateGroup[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; productCode: string; productDescription: string }>>([]);
  const [currencies, setCurrencies] = useState<ICurrencyProfile[]>([]);
  const [rates, setRates] = useState<ICurrencyRate[]>([]);
  const [productCurrencyRates, setProductCurrencyRates] = useState<IProductCurrencyRate[]>([]);
  const [groupForm, setGroupForm] = useState<GroupFormState>(createEmptyGroup());
  const [activeModal, setActiveModal] = useState<'group' | 'rate' | 'rule' | null>(null);
  const [selectedRate, setSelectedRate] = useState<ICurrencyRate | null>(null);
  const [selectedRule, setSelectedRule] = useState<IProductCurrencyRate | null>(null);

  const [rateForm, setRateForm] = useState<RateFormState>({
    currencyId: '',
    provider: '' as CurrencyRateProvider | '',
    baseBuyRate: '',
    baseSaleRate: '',
    baseRate: '',
    notes: '',
  });

  const [ruleForm, setRuleForm] = useState<RuleFormState>(createEmptyRule());

  const selectedRuleCurrency = currencies.find(currency => currency.id === ruleForm.currencyId) ?? null;
  const latestRateForCurrency = rates.find(rate => rate.currencyId === ruleForm.currencyId) ?? null;
  

  const openNewGroupModal = () => {
    setGroupForm(createEmptyGroup());
    setActiveModal('group');
  };

  const openEditGroupModal = (group: ICurrencyRateGroup) => {
    setGroupForm({
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
    setActiveModal('group');
  };

  const openNewRateModal = () => {
    setRateForm({
      currencyId: '',
      provider: '',
      baseBuyRate: '',
      baseSaleRate: '',
      baseRate: '',
      notes: '',
    });
    setSelectedRate(null);
    setActiveModal('rate');
  };

  const openRateDetailModal = (rate: ICurrencyRate) => {
    setSelectedRate(rate);
    setRateForm({
      currencyId: rate.currencyId,
      provider: rate.provider,
      baseBuyRate: rate.baseBuyRate,
      baseSaleRate: rate.baseSaleRate,
      baseRate: rate.baseRate || '',
      notes: rate.notes || '',
    });
    setActiveModal('rate');
  };

  const openNewRuleModal = () => {
    setRuleForm(createEmptyRule());
    setSelectedRule(null);
    setActiveModal('rule');
  };

  const openEditRuleModal = (rule: IProductCurrencyRate) => {
    setSelectedRule(rule);
    setRuleForm({
      id: rule.id,
      productId: rule.productId,
      currencyId: rule.currencyId,
      buy: rule.buy,
      sale: rule.sale,
      isActive: rule.isActive,
    });
    setActiveModal('rule');
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const [groupsRes, productsRes, currenciesRes, ratesRes, rulesRes] = await Promise.all([
          currencyRatesApi.getGroups(),
          productProfileApi.getProductProfiles(),
          currencyProfileApi.getCurrencyProfiles(),
          currencyRatesApi.getLatestRates(),
          currencyRatesApi.getProductCurrencyRates(),
        ]);

        if (cancelled) return;

        setGroups(groupsRes);
        setProducts(productsRes.map(product => ({
          id: product.id,
          productCode: product.productCode,
          productDescription: product.productDescription,
        })));
        setCurrencies(currenciesRes);
        setRates(ratesRes);
        setProductCurrencyRates(rulesRes);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load currency rate data');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshData = async () => {
    try {
      setError(null);
      const [groupsRes, productsRes, currenciesRes, ratesRes, rulesRes] = await Promise.all([
        currencyRatesApi.getGroups(),
        productProfileApi.getProductProfiles(),
        currencyProfileApi.getCurrencyProfiles(),
        currencyRatesApi.getLatestRates(),
        currencyRatesApi.getProductCurrencyRates(),
      ]);

      setGroups(groupsRes);
      setProducts(productsRes.map(product => ({
        id: product.id,
        productCode: product.productCode,
        productDescription: product.productDescription,
      })));
      setCurrencies(currenciesRes);
      setRates(ratesRes);
      setProductCurrencyRates(rulesRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh currency rate data');
    }
  };

  const formatMarginValue = (
    marginType: string | null | undefined,
    value: string | null | undefined,
  ) => {
    if (!value) {
      return '';
    }

    return marginType === 'PERCENT' ? `${value}%` : value;
  };

  const getLatestRateForCurrency = (currencyId: string) =>
    rates.find(rate => rate.currencyId === currencyId) ?? null;

  const calculateMarginAmount = (
    baseRate: string | null | undefined,
    marginType: string | null | undefined,
    marginValue: string | null | undefined,
  ) => {
    if (!baseRate || !marginType || !marginValue) {
      return null;
    }

    const base = Number(baseRate);
    const margin = Number(marginValue);
    if (!Number.isFinite(base) || !Number.isFinite(margin)) {
      return null;
    }

    const amount = marginType === 'PERCENT' ? base * (margin / 100) : margin;
    return amount.toFixed(4);
  };

  const calculateFinalRate = (
    baseRate: string | null | undefined,
    marginType: string | null | undefined,
    marginValue: string | null | undefined,
    direction: 'add' | 'subtract',
  ) => {
    if (!baseRate) {
      return null;
    }

    const base = Number(baseRate);
    if (!Number.isFinite(base)) {
      return null;
    }

    if (!marginType || !marginValue) {
      return base.toFixed(4);
    }

    const marginAmount = calculateMarginAmount(baseRate, marginType, marginValue);
    if (!marginAmount) {
      return null;
    }

    const amount = Number(marginAmount);
    return (direction === 'subtract' ? base - amount : base + amount).toFixed(4);
  };

  const getSideBaseRate = (rate: ICurrencyRate | null, side: 'buy' | 'sale') => {
    if (!rate) return null;
    if (rate.provider === 'TICKER') {
      return side === 'buy' ? rate.baseBuyRate || null : rate.baseSaleRate || null;
    }
    return rate.baseRate || rate.baseBuyRate || rate.baseSaleRate || null;
  };

  const getStoredBaseRateLabel = (rate: ICurrencyRate | null) => {
    if (!rate) {
      return 'No stored rate yet';
    }

    if (rate.provider === 'TICKER') {
      return `Buy ${rate.baseBuyRate} | Sale ${rate.baseSaleRate}`;
    }

    const baseRate = rate.baseRate || rate.baseBuyRate || rate.baseSaleRate;
    return `Base ${baseRate}`;
  };

  const getCurrencyPricingGroup = (currencyId: string) =>
    currencies.find(currency => currency.id === currencyId)?.pricingGroup ?? null;

  const liveOverridePreview = (() => {
    if (!latestRateForCurrency || !ruleForm.productId || !ruleForm.currencyId) {
      return null;
    }

    const pricingGroup = getCurrencyPricingGroup(ruleForm.currencyId);
    const baseBuyRate = getSideBaseRate(latestRateForCurrency, 'buy');
    const baseSaleRate = getSideBaseRate(latestRateForCurrency, 'sale');
    const groupBuyMarginAmount = calculateMarginAmount(baseBuyRate, pricingGroup?.buyMarginType, pricingGroup?.buyMarginValue);
    const groupSaleMarginAmount = calculateMarginAmount(baseSaleRate, pricingGroup?.saleMarginType, pricingGroup?.saleMarginValue);
    const overrideBuyMarginAmount = calculateMarginAmount(baseBuyRate, ruleForm.buy.marginType, ruleForm.buy.marginValue);
    const overrideSaleMarginAmount = calculateMarginAmount(baseSaleRate, ruleForm.sale.marginType, ruleForm.sale.marginValue);
    const groupBuyFinalRate = calculateFinalRate(baseBuyRate, pricingGroup?.buyMarginType, pricingGroup?.buyMarginValue, 'subtract');
    const groupSaleFinalRate = calculateFinalRate(baseSaleRate, pricingGroup?.saleMarginType, pricingGroup?.saleMarginValue, 'add');
    const overrideBuyFinalRate = calculateFinalRate(baseBuyRate, ruleForm.buy.marginType, ruleForm.buy.marginValue, 'subtract');
    const overrideSaleFinalRate = calculateFinalRate(baseSaleRate, ruleForm.sale.marginType, ruleForm.sale.marginValue, 'add');

    return {
      currencyCode: latestRateForCurrency.currency?.currencyCode || latestRateForCurrency.currencyId,
      baseBuyRate,
      baseSaleRate,
      provider: latestRateForCurrency.provider,
      pricingGroup,
      buy: {
        groupMarginAmount: groupBuyMarginAmount,
        overrideMarginAmount: overrideBuyMarginAmount,
        groupFinalRate: groupBuyFinalRate,
        overrideFinalRate: overrideBuyFinalRate,
        appliedFinalRate: overrideBuyFinalRate || groupBuyFinalRate,
      },
      sale: {
        groupMarginAmount: groupSaleMarginAmount,
        overrideMarginAmount: overrideSaleMarginAmount,
        groupFinalRate: groupSaleFinalRate,
        overrideFinalRate: overrideSaleFinalRate,
        appliedFinalRate: overrideSaleFinalRate || groupSaleFinalRate,
      },
    };
  })();

  const handleSaveRate = async () => {
    const payload =
      rateForm.provider === 'MANUAL' || rateForm.provider === 'FOREX'
        ? {
            currencyId: rateForm.currencyId,
            provider: rateForm.provider,
            baseRate: rateForm.baseRate,
            isActive: true,
            notes: rateForm.notes,
          }
        : {
            currencyId: rateForm.currencyId,
            provider: rateForm.provider,
            baseBuyRate: rateForm.baseBuyRate,
            baseSaleRate: rateForm.baseSaleRate,
            isActive: true,
            notes: rateForm.notes,
          };

    await currencyRatesApi.createRateEntry(payload);
    await refreshData();
  };

  const handleSaveGroup = async () => {
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

    await refreshData();
    setActiveModal(null);
  };

  const handleSaveRule = async () => {
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

    await refreshData();
    setActiveModal(null);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-sm border border-error-200 bg-error-50 p-4 text-sm text-error-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Currency Rate Groups</h2>
            <p className="text-sm text-text-tertiary">
              Pick a group to view it, or create a new one in the modal.
            </p>
          </div>
          <Button type="button" onClick={openNewGroupModal}>
            New Group
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map(group => (
            <button
              key={group.id}
              type="button"
              onClick={() => openEditGroupModal(group)}
              className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-left transition hover:border-primary-300"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{group.code}</div>
                  <div className="text-sm text-text-secondary">{group.name}</div>
                </div>
                <span className={`text-xs ${group.isActive ? 'text-success-600' : 'text-error-600'}`}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 grid gap-1 text-xs text-text-secondary">
                <div>
                  Buy Margin: {group.buyMarginType || 'EMPTY'} {formatMarginValue(group.buyMarginType, group.buyMarginValue)}
                </div>
                <div>
                  Sale Margin: {group.saleMarginType || 'EMPTY'} {formatMarginValue(group.saleMarginType, group.saleMarginValue)}
                </div>
              </div>
            </button>
          ))}
          {!groups.length ? (
            <div className="rounded-sm border border-dashed border-border-primary p-4 text-sm text-text-tertiary">
              No groups yet. Create one to start pricing currencies.
            </div>
          ) : null}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Current Rates</h2>
            <p className="text-sm text-text-tertiary">
              Manual entries are listed here. Click a row to inspect the details.
            </p>
          </div>
          <Button type="button" onClick={openNewRateModal}>
            New Rate
          </Button>
        </div>

        <div className="overflow-hidden rounded-sm border border-border-primary">
          <table className="min-w-full divide-y divide-border-primary text-sm">
            <thead className="bg-surface-secondary/70 text-left text-xs uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Buy</th>
                <th className="px-4 py-3">Sale</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {rates.slice(0, 10).map(rate => {
                const buyBase = rate.provider === 'TICKER' ? rate.baseBuyRate : rate.baseRate || rate.baseBuyRate || rate.baseSaleRate;
                const saleBase = rate.provider === 'TICKER' ? rate.baseSaleRate : rate.baseRate || rate.baseSaleRate || rate.baseBuyRate;

                return (
                  <tr
                    key={rate.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer hover:bg-surface-secondary/30"
                    onClick={() => openRateDetailModal(rate)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        openRateDetailModal(rate);
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      {rate.currency?.currencyCode || rate.currencyId}
                    </td>
                    <td className="px-4 py-3">{rate.provider}</td>
                    <td className="px-4 py-3">{buyBase}</td>
                    <td className="px-4 py-3">{saleBase}</td>
                    <td className="px-4 py-3">{rate.isActive ? 'Active' : 'Inactive'}</td>
                  </tr>
                );
              })}
              {!rates.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-tertiary">
                    No rates recorded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Product Currency Overrides</h2>
            <p className="text-sm text-text-tertiary">
              Click a row to open the detail and edit view.
            </p>
          </div>
          <Button type="button" onClick={openNewRuleModal}>
            New Override
          </Button>
        </div>

        <div className="overflow-hidden rounded-sm border border-border-primary">
          <table className="min-w-full divide-y divide-border-primary text-sm">
            <thead className="bg-surface-secondary/70 text-left text-xs uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3">Base</th>
                <th className="px-4 py-3">Buy</th>
                <th className="px-4 py-3">Sale</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {productCurrencyRates.map(rule => {
                const latestRate = getLatestRateForCurrency(rule.currencyId);
                const currencyPricingGroup = getCurrencyPricingGroup(rule.currencyId);
                const groupBuyResult = calculateFinalRate(
                  getSideBaseRate(latestRate, 'buy'),
                  currencyPricingGroup?.buyMarginType ?? '',
                  currencyPricingGroup?.buyMarginValue ?? '',
                  'subtract',
                );
                const groupSaleResult = calculateFinalRate(
                  getSideBaseRate(latestRate, 'sale'),
                  currencyPricingGroup?.saleMarginType ?? '',
                  currencyPricingGroup?.saleMarginValue ?? '',
                  'add',
                );
                const overrideBuyResult = calculateFinalRate(
                  getSideBaseRate(latestRate, 'buy'),
                  rule.buy.marginType,
                  rule.buy.marginValue,
                  'subtract',
                );
                const overrideSaleResult = calculateFinalRate(
                  getSideBaseRate(latestRate, 'sale'),
                  rule.sale.marginType,
                  rule.sale.marginValue,
                  'add',
                );

                return (
                  <tr
                    key={rule.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer hover:bg-surface-secondary/30"
                    onClick={() => openEditRuleModal(rule)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        openEditRuleModal(rule);
                      }
                    }}
                  >
                    <td className="px-4 py-3">{rule.product?.productCode || rule.productId}</td>
                    <td className="px-4 py-3">{rule.currency?.currencyCode || rule.currencyId}</td>
                    <td className="px-4 py-3">
                      {getStoredBaseRateLabel(latestRate)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        Group: {currencyPricingGroup?.buyMarginType || 'EMPTY'} {formatMarginValue(currencyPricingGroup?.buyMarginType, currencyPricingGroup?.buyMarginValue)}
                      </div>
                      <div className="text-xs text-text-tertiary">Group Result: {groupBuyResult || '-'}</div>
                      <div className="mt-1">
                        Override: {rule.buy.marginType || 'EMPTY'} {formatMarginValue(rule.buy.marginType, rule.buy.marginValue)}
                      </div>
                      <div className="text-xs text-text-tertiary">Override Result: {overrideBuyResult || '-'}</div>
                      <div className="text-xs text-text-tertiary">Applied: {overrideBuyResult || groupBuyResult || '-'}</div>
                      <div className="mt-1 text-xs text-text-tertiary">
                        Min/Max: {rule.buy.minRate ?? ''} - {rule.buy.maxRate ?? ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        Group: {currencyPricingGroup?.saleMarginType || 'EMPTY'} {formatMarginValue(currencyPricingGroup?.saleMarginType, currencyPricingGroup?.saleMarginValue)}
                      </div>
                      <div className="text-xs text-text-tertiary">Group Result: {groupSaleResult || '-'}</div>
                      <div className="mt-1">
                        Override: {rule.sale.marginType || 'EMPTY'} {formatMarginValue(rule.sale.marginType, rule.sale.marginValue)}
                      </div>
                      <div className="text-xs text-text-tertiary">Override Result: {overrideSaleResult || '-'}</div>
                      <div className="text-xs text-text-tertiary">Applied: {overrideSaleResult || groupSaleResult || '-'}</div>
                      <div className="mt-1 text-xs text-text-tertiary">
                        Min/Max: {rule.sale.minRate ?? ''} - {rule.sale.maxRate ?? ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">{rule.isActive ? 'Active' : 'Inactive'}</td>
                  </tr>
                );
              })}
              {!productCurrencyRates.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-text-tertiary">
                    No product-currency overrides yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={activeModal === 'group'}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setActiveModal(null);
          }
        }}
        title={groupForm.id ? 'Edit Currency Group' : 'Create Currency Group'}
        description="Group pricing lives here. Fill only the values you want to store."
        size="xl"
      >
        <div className="space-y-6">
          <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
            <div className="font-medium text-text-primary">
              {groupForm.id ? `${groupForm.code || 'Group'} - ${groupForm.name || 'Unnamed'}` : 'New group'}
            </div>
            <div className="mt-1">
              {groupForm.id ? 'You are editing this group.' : 'No group is selected yet.'}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Group Code</label>
              <input
                value={groupForm.code}
                onChange={e => setGroupForm(form => ({ ...form, code: e.target.value }))}
                className={inputClass}
                placeholder="MAJOR"
              />
            </div>
            <div>
              <label className={labelClass}>Group Name</label>
              <input
                value={groupForm.name}
                onChange={e => setGroupForm(form => ({ ...form, name: e.target.value }))}
                className={inputClass}
                placeholder="Major"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={groupForm.description}
                onChange={e => setGroupForm(form => ({ ...form, description: e.target.value }))}
                className={inputClass}
                rows={2}
              />
            </div>
            <div>
              <label className={labelClass}>Buy Margin Type</label>
              <select
                value={groupForm.buyMarginType}
                onChange={e => setGroupForm(form => ({ ...form, buyMarginType: e.target.value as CurrencyRateMarginType | '' }))}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="PERCENT">PERCENT</option>
                <option value="RATE">RATE</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Buy Margin Value</label>
              <input
                value={groupForm.buyMarginValue}
                onChange={e => setGroupForm(form => ({ ...form, buyMarginValue: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sale Margin Type</label>
              <select
                value={groupForm.saleMarginType}
                onChange={e => setGroupForm(form => ({ ...form, saleMarginType: e.target.value as CurrencyRateMarginType | '' }))}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="PERCENT">PERCENT</option>
                <option value="RATE">RATE</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Sale Margin Value</label>
              <input
                value={groupForm.saleMarginValue}
                onChange={e => setGroupForm(form => ({ ...form, saleMarginValue: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={groupForm.isActive}
              onChange={e => setGroupForm(form => ({ ...form, isActive: e.target.checked }))}
            />
            Active
          </label>

          <div className="flex gap-3">
            <Button type="button" onClick={() => void handleSaveGroup()}>
              {groupForm.id ? 'Update Group' : 'Create Group'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={activeModal === 'rate'}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setActiveModal(null);
          }
        }}
        title={selectedRate ? 'Rate Detail' : 'Create Current Rate'}
        description="Manual, TICKER, and FOREX entries are stored here."
        size="lg"
      >
        <div className="space-y-6">
          <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
            <div className="font-medium text-text-primary">
              {selectedRate ? `${selectedRate.provider} for ${selectedRate.currency?.currencyCode || selectedRate.currencyId}` : 'New rate entry'}
            </div>
            {selectedRate ? (
              <div className="mt-2 grid gap-1">
                <div>Buy: {selectedRate.baseBuyRate}</div>
                <div>Sale: {selectedRate.baseSaleRate}</div>
                <div>Base Rate: {selectedRate.baseRate || '-'}</div>
              </div>
            ) : (
              <div className="mt-1">No stored rate selected yet.</div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={rateForm.currencyId}
                onChange={e => setRateForm(form => ({ ...form, currencyId: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select currency</option>
                {currencies.map(currency => (
                  <option key={currency.id} value={currency.id}>
                    {currency.currencyCode} - {currency.currencyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Provider</label>
              <select
                value={rateForm.provider}
                onChange={e => setRateForm(form => ({ ...form, provider: e.target.value as CurrencyRateProvider | '' }))}
                className={inputClass}
              >
                <option value="">Select provider</option>
                <option value="TICKER">TICKER</option>
                <option value="FOREX">FOREX</option>
                <option value="MANUAL">MANUAL</option>
              </select>
            </div>

            {rateForm.provider === 'TICKER' ? (
              <>
                <div>
                  <label className={labelClass}>Base Buy Rate</label>
                  <input
                    type="number"
                    value={rateForm.baseBuyRate}
                    onChange={e => setRateForm(form => ({ ...form, baseBuyRate: e.target.value }))}
                    className={inputClass}
                    placeholder=""
                  />
                </div>
                <div>
                  <label className={labelClass}>Base Sale Rate</label>
                  <input
                    type="number"
                    value={rateForm.baseSaleRate}
                    onChange={e => setRateForm(form => ({ ...form, baseSaleRate: e.target.value }))}
                    className={inputClass}
                    placeholder=""
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className={labelClass}>Base Rate</label>
                <input
                  type="number"
                  value={rateForm.baseRate}
                  onChange={e => setRateForm(form => ({ ...form, baseRate: e.target.value }))}
                  className={inputClass}
                  placeholder=""
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea
                value={rateForm.notes}
                onChange={e => setRateForm(form => ({ ...form, notes: e.target.value }))}
                className={inputClass}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" onClick={() => void handleSaveRate()}>
              Save Rate
            </Button>
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={activeModal === 'rule'}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setActiveModal(null);
          }
        }}
        title={selectedRule ? 'Override Detail' : 'Create Product Override'}
        description="This rule overrides the group default for one product and one currency."
        size="xl"
      >
        <div className="space-y-6">
          <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
            <div className="font-medium text-text-primary">
              {selectedRule
                ? `${selectedRule.product?.productCode || selectedRule.productId} + ${selectedRule.currency?.currencyCode || selectedRule.currencyId}`
                : 'New override'}
            </div>
            {selectedRule ? (
              <div className="mt-2 grid gap-1">
                <div>
                  Buy: {selectedRule.buy.marginType || 'EMPTY'} {formatMarginValue(selectedRule.buy.marginType, selectedRule.buy.marginValue)}
                </div>
                <div>
                  Sale: {selectedRule.sale.marginType || 'EMPTY'} {formatMarginValue(selectedRule.sale.marginType, selectedRule.sale.marginValue)}
                </div>
              </div>
            ) : (
              <div className="mt-1">No override selected yet.</div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Latest Stored Rate</div>
              <div className="mt-2 font-medium text-text-primary">
                {selectedRuleCurrency ? `${selectedRuleCurrency.currencyCode} - ${selectedRuleCurrency.currencyName}` : 'Select a currency'}
              </div>
              <div className="mt-1">{getStoredBaseRateLabel(latestRateForCurrency)}</div>
            </div>

            <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Fallback Group</div>
              <div className="mt-2 font-medium text-text-primary">
                {selectedRuleCurrency?.pricingGroup
                  ? `${selectedRuleCurrency.pricingGroup.code} - ${selectedRuleCurrency.pricingGroup.name}`
                  : 'No group selected'}
              </div>
              {selectedRuleCurrency?.pricingGroup ? (
                <div className="mt-2 grid gap-1">
                  <div>
                    Buy Margin: {selectedRuleCurrency.pricingGroup.buyMarginType || 'EMPTY'} {formatMarginValue(selectedRuleCurrency.pricingGroup.buyMarginType as CurrencyRateMarginType | null, selectedRuleCurrency.pricingGroup.buyMarginValue)}
                  </div>
                  <div>
                    Sale Margin: {selectedRuleCurrency.pricingGroup.saleMarginType || 'EMPTY'} {formatMarginValue(selectedRuleCurrency.pricingGroup.saleMarginType as CurrencyRateMarginType | null, selectedRuleCurrency.pricingGroup.saleMarginValue)}
                  </div>
                </div>
              ) : (
                <div className="mt-1">The group price source will appear here once the currency is assigned.</div>
              )}
            </div>
          </div>

          <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Calculated Preview</div>
            {!liveOverridePreview ? (
              <div className="mt-2">Select a product and currency to see the calculated final buy and sale prices.</div>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
                  <div className="text-xs text-text-tertiary">Buy</div>
                  <div className="mt-1 text-sm text-text-primary">Base: {liveOverridePreview.baseBuyRate}</div>
                  <div className="text-sm text-text-primary">
                    Group Margin: {liveOverridePreview.pricingGroup?.buyMarginType || 'EMPTY'} {formatMarginValue(liveOverridePreview.pricingGroup?.buyMarginType, liveOverridePreview.pricingGroup?.buyMarginValue)}
                  </div>
                  <div className="text-sm text-text-primary">
                    Group Amount: {liveOverridePreview.buy.groupMarginAmount || '-'}
                  </div>
                  <div className="text-sm text-text-primary">
                    Group Result: {liveOverridePreview.buy.groupFinalRate || '-'}
                  </div>
                  <div className="text-sm text-text-primary">
                    Override Margin: {ruleForm.buy.marginType || 'EMPTY'} {formatMarginValue(ruleForm.buy.marginType, ruleForm.buy.marginValue)}
                  </div>
                  <div className="text-sm text-text-primary">
                    Override Amount: {liveOverridePreview.buy.overrideMarginAmount || '-'}
                  </div>
                  <div className="text-sm text-text-primary">
                    Override Result: {liveOverridePreview.buy.overrideFinalRate || '-'}
                  </div>
                  <div className="text-base font-semibold text-text-primary">
                    Applied: {liveOverridePreview.buy.appliedFinalRate || '-'}
                  </div>
                </div>
                <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
                  <div className="text-xs text-text-tertiary">Sale</div>
                  <div className="mt-1 text-sm text-text-primary">Base: {liveOverridePreview.baseSaleRate}</div>
                  <div className="text-sm text-text-primary">
                    Group Margin: {liveOverridePreview.pricingGroup?.saleMarginType || 'EMPTY'} {formatMarginValue(liveOverridePreview.pricingGroup?.saleMarginType, liveOverridePreview.pricingGroup?.saleMarginValue)}
                  </div>
                  <div className="text-sm text-text-primary">
                    Group Amount: {liveOverridePreview.sale.groupMarginAmount || '-'}
                  </div>
                  <div className="text-sm text-text-primary">
                    Group Result: {liveOverridePreview.sale.groupFinalRate || '-'}
                  </div>
                  <div className="text-sm text-text-primary">
                    Override Margin: {ruleForm.sale.marginType || 'EMPTY'} {formatMarginValue(ruleForm.sale.marginType, ruleForm.sale.marginValue)}
                  </div>
                  <div className="text-sm text-text-primary">
                    Override Amount: {liveOverridePreview.sale.overrideMarginAmount || '-'}
                  </div>
                  <div className="text-sm text-text-primary">
                    Override Result: {liveOverridePreview.sale.overrideFinalRate || '-'}
                  </div>
                  <div className="text-base font-semibold text-text-primary">
                    Applied: {liveOverridePreview.sale.appliedFinalRate || '-'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Product</label>
              <select
                value={ruleForm.productId}
                onChange={e => setRuleForm(form => ({ ...form, productId: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.productCode} - {product.productDescription}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={ruleForm.currencyId}
                onChange={e => setRuleForm(form => ({ ...form, currencyId: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select currency</option>
                {currencies.map(currency => (
                  <option key={currency.id} value={currency.id}>
                    {currency.currencyCode} - {currency.currencyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <div>
                <label className={labelClass}>Buy Margin Type</label>
                <select
                  value={ruleForm.buy.marginType || ''}
                  onChange={e => setRuleForm(form => ({
                    ...form,
                    buy: { ...form.buy, marginType: e.target.value as CurrencyRateMarginType | '' },
                  }))}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="PERCENT">PERCENT</option>
                  <option value="RATE">RATE</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Buy Margin Value</label>
                <input
                  value={ruleForm.buy.marginValue ?? ''}
                  onChange={e => setRuleForm(form => ({ ...form, buy: { ...form.buy, marginValue: e.target.value } }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Buy Min Rate</label>
                <input
                  value={ruleForm.buy.minRate ?? ''}
                  onChange={e => setRuleForm(form => ({ ...form, buy: { ...form.buy, minRate: e.target.value } }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Buy Max Rate</label>
                <input
                  value={ruleForm.buy.maxRate ?? ''}
                  onChange={e => setRuleForm(form => ({ ...form, buy: { ...form.buy, maxRate: e.target.value } }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sale Margin Type</label>
                <select
                  value={ruleForm.sale.marginType || ''}
                  onChange={e => setRuleForm(form => ({
                    ...form,
                    sale: { ...form.sale, marginType: e.target.value as CurrencyRateMarginType | '' },
                  }))}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="PERCENT">PERCENT</option>
                  <option value="RATE">RATE</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Sale Margin Value</label>
                <input
                  value={ruleForm.sale.marginValue ?? ''}
                  onChange={e => setRuleForm(form => ({ ...form, sale: { ...form.sale, marginValue: e.target.value } }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sale Min Rate</label>
                <input
                  value={ruleForm.sale.minRate ?? ''}
                  onChange={e => setRuleForm(form => ({ ...form, sale: { ...form.sale, minRate: e.target.value } }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sale Max Rate</label>
                <input
                  value={ruleForm.sale.maxRate ?? ''}
                  onChange={e => setRuleForm(form => ({ ...form, sale: { ...form.sale, maxRate: e.target.value } }))}
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-text-primary md:col-span-2">
              <input
                type="checkbox"
                checked={ruleForm.isActive}
                onChange={e => setRuleForm(form => ({ ...form, isActive: e.target.checked }))}
              />
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="button" onClick={() => void handleSaveRule()}>
              {ruleForm.id ? 'Update Override' : 'Create Override'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
