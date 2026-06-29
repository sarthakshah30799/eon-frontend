import { useEffect, useMemo, useState } from 'react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button1';
import { currencyProfileApi } from '@/api/currencyProfile';
import { currencyRatesApi } from '@/api/currencyRates';
import type {
  ICurrencyRateGroup,
  ICurrencyRateQuote,
  ICurrencyRateSettings,
  ICurrencyRate,
} from '../types/currencyRatesTypes';
import { CurrencyRateProvider } from '../types/currencyRatesTypes';

const DEFAULT_SETTINGS: ICurrencyRateSettings = {
  defaultProvider: CurrencyRateProvider.TICKER,
  roundingScale: 4,
  global: {
    buy: {
      marginType: 'PERCENT',
      marginValue: '0',
      marginDirection: 'ADD',
      minRate: '0',
      maxRate: '999999999',
    },
    sale: {
      marginType: 'PERCENT',
      marginValue: '0',
      marginDirection: 'ADD',
      minRate: '0',
      maxRate: '999999999',
    },
  },
  groups: {},
  currencyOverrides: {},
};

const sectionClass =
  'rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm space-y-4';

const inputClass =
  'w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500';

const labelClass =
  'mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary';

function safeJsonParse(value: string): ICurrencyRateSettings | null {
  try {
    return JSON.parse(value) as ICurrencyRateSettings;
  } catch {
    return null;
  }
}

export const CurrencyRatesView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ICurrencyRateSettings>(DEFAULT_SETTINGS);
  const [settingsText, setSettingsText] = useState(JSON.stringify(DEFAULT_SETTINGS, null, 2));
  const [groups, setGroups] = useState<ICurrencyRateGroup[]>([]);
  const [currencies, setCurrencies] = useState<Array<{
    id: string;
    currencyCode: string;
    currencyName: string;
    pricingGroup?: { id: string; code: string; name: string } | null;
  }>>([]);
  const [rates, setRates] = useState<ICurrencyRate[]>([]);

  const [groupForm, setGroupForm] = useState({
    id: '',
    code: '',
    name: '',
    description: '',
    isActive: true,
  });

  const [rateForm, setRateForm] = useState({
    currencyId: '',
    provider: CurrencyRateProvider.TICKER as (typeof CurrencyRateProvider)[keyof typeof CurrencyRateProvider],
    baseBuyRate: '',
    baseSaleRate: '',
    baseRate: '',
    notes: '',
  });

  const [previewQuote, setPreviewQuote] = useState<ICurrencyRateQuote | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [selectedPreviewCurrencyId, setSelectedPreviewCurrencyId] = useState('');

  const defaultCurrencyId = currencies[0]?.id ?? '';
  const effectiveRateCurrencyId = rateForm.currencyId || defaultCurrencyId;
  const effectivePreviewCurrencyId = selectedPreviewCurrencyId || defaultCurrencyId;

  const selectedCurrency = useMemo(
    () => currencies.find(currency => currency.id === effectiveRateCurrencyId) ?? null,
    [currencies, effectiveRateCurrencyId]
  );

  const loadAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [settingsRes, groupsRes, currenciesRes, ratesRes] = await Promise.all([
        currencyRatesApi.getSettings(),
        currencyRatesApi.getGroups(),
        currencyProfileApi.getCurrencyProfiles(),
        currencyRatesApi.getLatestRates(),
      ]);

      setSettings(settingsRes);
      setSettingsText(JSON.stringify(settingsRes, null, 2));
      setGroups(groupsRes);
      setCurrencies(currenciesRes);
      setRates(ratesRes);

      if (!groupForm.id && groupsRes.length > 0) {
        const first = groupsRes[0];
        setGroupForm({
          id: first.id,
          code: first.code,
          name: first.name,
          description: first.description || '',
          isActive: first.isActive,
        });
      }

      if (!rateForm.currencyId && currenciesRes.length > 0) {
        const firstCurrencyId = currenciesRes[0].id;
        setRateForm(form => ({ ...form, currencyId: firstCurrencyId }));
        setSelectedPreviewCurrencyId(firstCurrencyId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load currency rate data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [settingsRes, groupsRes, currenciesRes, ratesRes] = await Promise.all([
          currencyRatesApi.getSettings(),
          currencyRatesApi.getGroups(),
          currencyProfileApi.getCurrencyProfiles(),
          currencyRatesApi.getLatestRates(),
        ]);

        if (cancelled) {
          return;
        }

        setSettings(settingsRes);
        setSettingsText(JSON.stringify(settingsRes, null, 2));
        setGroups(groupsRes);
        setCurrencies(currenciesRes);
        setRates(ratesRes);

        if (groupsRes.length > 0) {
          const first = groupsRes[0];
          setGroupForm({
            id: first.id,
            code: first.code,
            name: first.name,
            description: first.description || '',
            isActive: first.isActive,
          });
        }

        if (currenciesRes.length > 0) {
          const firstCurrencyId = currenciesRes[0].id;
          setRateForm(form => ({ ...form, currencyId: firstCurrencyId }));
          setSelectedPreviewCurrencyId(firstCurrencyId);
        }
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

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveSettings = async () => {
    const parsed = safeJsonParse(settingsText);
    if (!parsed) {
      setError('Settings JSON is invalid');
      return;
    }

    const saved = await currencyRatesApi.saveSettings(parsed);
    setSettings(saved);
    setSettingsText(JSON.stringify(saved, null, 2));
    await loadAll();
  };

  const handleSaveGroup = async () => {
    const payload = {
      code: groupForm.code,
      name: groupForm.name,
      description: groupForm.description,
      isActive: groupForm.isActive,
    };

    if (groupForm.id) {
      await currencyRatesApi.updateGroup(groupForm.id, payload);
    } else {
      await currencyRatesApi.createGroup(payload);
    }

    await loadAll();
  };

  const handleLoadGroupForEdit = (group: ICurrencyRateGroup) => {
    setGroupForm({
      id: group.id,
      code: group.code,
      name: group.name,
      description: group.description || '',
      isActive: group.isActive,
    });
  };

  const handleSaveRate = async () => {
    const payload =
      rateForm.provider === CurrencyRateProvider.FOREX
        ? {
            currencyId: effectiveRateCurrencyId,
            provider: rateForm.provider,
            baseRate: rateForm.baseRate,
            isActive: true,
            notes: rateForm.notes,
          }
        : {
            currencyId: effectiveRateCurrencyId,
            provider: rateForm.provider,
            baseBuyRate: rateForm.baseBuyRate,
            baseSaleRate: rateForm.baseSaleRate,
            isActive: true,
            notes: rateForm.notes,
          };

    await currencyRatesApi.createRateEntry(payload);
    await loadAll();
  };

  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      setPreviewError(null);
      const preview = await currencyRatesApi.preview({
        currencyId: effectivePreviewCurrencyId,
        provider: rateForm.provider,
        baseBuyRate:
          rateForm.provider === CurrencyRateProvider.FOREX
            ? rateForm.baseRate
            : rateForm.baseBuyRate,
        baseSaleRate:
          rateForm.provider === CurrencyRateProvider.FOREX
            ? rateForm.baseRate
            : rateForm.baseSaleRate,
      });
      setPreviewQuote(preview);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Failed to preview rate');
    } finally {
      setPreviewLoading(false);
    }
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
            <h2 className="text-lg font-semibold text-text-primary">Currency Rates Settings</h2>
            <p className="text-sm text-text-tertiary">
              Stored inside advanced settings as one structured JSON config.
              <span className="ml-2 font-medium text-text-secondary">
                Default provider: {settings.defaultProvider} | rounding scale: {settings.roundingScale}
              </span>
            </p>
          </div>
          <Button type="button" onClick={() => void handleSaveSettings()}>
            Save Settings
          </Button>
        </div>
        <textarea
          value={settingsText}
          onChange={e => setSettingsText(e.target.value)}
          className={`${inputClass} min-h-[360px] font-mono text-xs`}
          spellCheck={false}
        />
      </section>

      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Currency Rate Groups</h2>
            <p className="text-sm text-text-tertiary">
              Major, Minor, Exotic, or any business group you need.
            </p>
          </div>
          <Button
            type="button"
            onClick={() =>
              setGroupForm({ id: '', code: '', name: '', description: '', isActive: true })
            }
          >
            New Group
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-sm border border-border-primary">
            <table className="min-w-full divide-y divide-border-primary text-sm">
              <thead className="bg-surface-secondary/70 text-left text-xs uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {groups.map(group => (
                  <tr key={group.id}>
                    <td className="px-4 py-3 font-medium">{group.code}</td>
                    <td className="px-4 py-3">{group.name}</td>
                    <td className="px-4 py-3">{group.isActive ? 'Active' : 'Inactive'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-primary-600 hover:underline"
                        onClick={() => handleLoadGroupForEdit(group)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!groups.length ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-text-tertiary" colSpan={4}>
                      No rate groups yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 rounded-sm border border-border-primary p-4">
            <div>
              <label className={labelClass}>Code</label>
              <input
                value={groupForm.code}
                onChange={e => setGroupForm(form => ({ ...form, code: e.target.value.toUpperCase() }))}
                className={inputClass}
                placeholder="MAJOR"
              />
            </div>
            <div>
              <label className={labelClass}>Name</label>
              <input
                value={groupForm.name}
                onChange={e => setGroupForm(form => ({ ...form, name: e.target.value }))}
                className={inputClass}
                placeholder="Major"
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={groupForm.description}
                onChange={e => setGroupForm(form => ({ ...form, description: e.target.value }))}
                className={inputClass}
                rows={3}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={groupForm.isActive}
                onChange={e => setGroupForm(form => ({ ...form, isActive: e.target.checked }))}
              />
              Active
            </label>
            <Button type="button" onClick={() => void handleSaveGroup()}>
              {groupForm.id ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Manual Rate Entry</h2>
          <p className="text-sm text-text-tertiary">
            Enter a provider type now, even though the rate is typed manually.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className={labelClass}>Currency</label>
            <select
              value={effectiveRateCurrencyId}
              onChange={e => {
                const value = e.target.value;
                setRateForm(form => ({ ...form, currencyId: value }));
                setSelectedPreviewCurrencyId(value);
              }}
              className={inputClass}
            >
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
              onChange={e =>
                setRateForm(form => ({
                  ...form,
                  provider: e.target.value as CurrencyRateProvider,
                }))
              }
              className={inputClass}
            >
              <option value={CurrencyRateProvider.TICKER}>TICKER</option>
              <option value={CurrencyRateProvider.FOREX}>FOREX</option>
            </select>
          </div>
          {rateForm.provider === CurrencyRateProvider.FOREX ? (
            <div>
              <label className={labelClass}>Base Rate</label>
              <input
                type="number"
                value={rateForm.baseRate}
                onChange={e => setRateForm(form => ({ ...form, baseRate: e.target.value }))}
                className={inputClass}
                placeholder="82.00"
              />
            </div>
          ) : (
            <>
              <div>
                <label className={labelClass}>Base Buy Rate</label>
                <input
                  type="number"
                  value={rateForm.baseBuyRate}
                  onChange={e => setRateForm(form => ({ ...form, baseBuyRate: e.target.value }))}
                  className={inputClass}
                  placeholder="82.00"
                />
              </div>
              <div>
                <label className={labelClass}>Base Sale Rate</label>
                <input
                  type="number"
                  value={rateForm.baseSaleRate}
                  onChange={e => setRateForm(form => ({ ...form, baseSaleRate: e.target.value }))}
                  className={inputClass}
                  placeholder="82.10"
                />
              </div>
            </>
          )}
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={rateForm.notes}
            onChange={e => setRateForm(form => ({ ...form, notes: e.target.value }))}
            className={inputClass}
            rows={2}
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={() => void handleSaveRate()}>
            Save Rate
          </Button>
          <Button type="button" onClick={() => void handlePreview()}>
            Preview Calculation
          </Button>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">Preview Result</h2>
            <div>
            <label className={labelClass}>Preview Currency</label>
            <select
              value={effectivePreviewCurrencyId}
              onChange={e => setSelectedPreviewCurrencyId(e.target.value)}
              className={inputClass}
            >
                {currencies.map(currency => (
                  <option key={currency.id} value={currency.id}>
                    {currency.currencyCode} - {currency.currencyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" onClick={() => void handlePreview()}>
                Run Preview
              </Button>
              {previewLoading ? <span className="text-sm text-text-tertiary">Calculating...</span> : null}
            </div>

            {previewError ? (
              <div className="rounded-sm border border-error-200 bg-error-50 p-3 text-sm text-error-700">
                {previewError}
              </div>
            ) : null}

            {previewQuote ? (
              <div className="space-y-4 rounded-sm border border-border-primary bg-surface-secondary/20 p-4">
                <div className="text-sm text-text-secondary">
                  Effective source: <span className="font-medium text-text-primary">{previewQuote.effectiveSource}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
                    <div className="text-xs uppercase tracking-wider text-text-tertiary">Buy</div>
                    <div className="mt-2 text-lg font-semibold text-text-primary">{previewQuote.buy.finalRate}</div>
                    <div className="text-xs text-text-tertiary">
                      Base {previewQuote.buy.baseRate} | Margin {previewQuote.buy.marginAmount}
                    </div>
                    <div className={`mt-2 text-sm ${previewQuote.buy.isValid ? 'text-success-600' : 'text-error-600'}`}>
                      {previewQuote.buy.isValid ? 'Valid' : previewQuote.buy.reason || 'Invalid'}
                    </div>
                  </div>
                  <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
                    <div className="text-xs uppercase tracking-wider text-text-tertiary">Sale</div>
                    <div className="mt-2 text-lg font-semibold text-text-primary">{previewQuote.sale.finalRate}</div>
                    <div className="text-xs text-text-tertiary">
                      Base {previewQuote.sale.baseRate} | Margin {previewQuote.sale.marginAmount}
                    </div>
                    <div className={`mt-2 text-sm ${previewQuote.sale.isValid ? 'text-success-600' : 'text-error-600'}`}>
                      {previewQuote.sale.isValid ? 'Valid' : previewQuote.sale.reason || 'Invalid'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">Latest Manual Rates</h2>
            <div className="overflow-hidden rounded-sm border border-border-primary">
              <table className="min-w-full divide-y divide-border-primary text-sm">
                <thead className="bg-surface-secondary/70 text-left text-xs uppercase tracking-wider text-text-secondary">
                  <tr>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Buy</th>
                    <th className="px-4 py-3">Sale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  {rates.slice(0, 8).map(rate => (
                    <tr key={rate.id}>
                      <td className="px-4 py-3">{rate.provider}</td>
                      <td className="px-4 py-3">{rate.baseBuyRate}</td>
                      <td className="px-4 py-3">{rate.baseSaleRate}</td>
                    </tr>
                  ))}
                  {!rates.length ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-text-tertiary" colSpan={3}>
                        No rates recorded yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {selectedCurrency ? (
              <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-3 text-sm text-text-secondary">
                Selected currency: <span className="font-medium text-text-primary">{selectedCurrency.currencyCode}</span>
                <div className="mt-1">
                  Currency rate group:{' '}
                  <span className="font-medium text-text-primary">
                    {selectedCurrency.pricingGroup?.name || 'Not assigned'}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};
