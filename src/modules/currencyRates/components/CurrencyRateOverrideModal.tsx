import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { Button, Modal, AsyncSelect } from '@/components/ui';
import type {
  ICurrencyRate,
  ICurrencyRateComparisonPreview,
  IProductCurrencyRate,
  IProductCurrencyRateFormValues,
  CurrencyRateMarginType,
} from '../types/currencyRatesTypes';
import { CURRENCY_RATE_MARGIN_TYPE_OPTIONS } from '../types/currencyRatesTypes';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import { CurrencyRateComparisonPanel } from './CurrencyRateComparisonPanel';
import {
  buildCurrencyRateComparisonPreview,
  formatMarginValue,
  getCurrencyPricingGroup,
  getLatestRateForCurrency,
  getStoredBaseRateLabel,
} from '../utils/currencyRatesUtils';

interface CurrencyRateOverrideModalProps {
  open: boolean;
  form: IProductCurrencyRateFormValues;
  setForm: Dispatch<SetStateAction<IProductCurrencyRateFormValues>>;
  products: Array<{ id: string; productCode: string; productDescription: string }>;
  currencies: ICurrencyProfile[];
  rates: ICurrencyRate[];
  selectedRule: IProductCurrencyRate | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary';
const inputClass = 'w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500';
const loadMarginTypeOptions = async () => ({
  options: CURRENCY_RATE_MARGIN_TYPE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
  })),
  hasMore: false,
});

export const CurrencyRateOverrideModal = ({
  open,
  form,
  setForm,
  products,
  currencies,
  rates,
  selectedRule,
  isSubmitting,
  onSubmit,
  onClose,
}: CurrencyRateOverrideModalProps) => {
  const selectedCurrency = currencies.find(currency => currency.id === form.currencyId) ?? null;
  const selectedProduct = products.find(product => product.id === form.productId) ?? null;
  const latestRate = getLatestRateForCurrency(rates, form.currencyId);
  const currencyPricingGroup = getCurrencyPricingGroup(currencies, form.currencyId);

  const preview = useMemo<ICurrencyRateComparisonPreview | null>(() => {
    return buildCurrencyRateComparisonPreview({
      latestRate,
      pricingGroup: currencyPricingGroup,
      overrideBuy: form.buy,
      overrideSale: form.sale,
    });
  }, [currencyPricingGroup, form.buy, form.sale, latestRate]);

  return (
    <Modal
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
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
              ? `${selectedRule.product?.productCode || selectedRule.productId} + ${
                  selectedRule.currency?.currencyCode || selectedRule.currencyId
                }`
              : 'New override'}
          </div>
          {selectedRule ? (
            <div className="mt-2 grid gap-1">
              <div>
                Buy: {selectedRule.buy.marginType || 'EMPTY'}{' '}
                {formatMarginValue(
                  selectedRule.buy.marginType,
                  selectedRule.buy.marginValue,
                )}
              </div>
              <div>
                Sale: {selectedRule.sale.marginType || 'EMPTY'}{' '}
                {formatMarginValue(
                  selectedRule.sale.marginType,
                  selectedRule.sale.marginValue,
                )}
              </div>
            </div>
          ) : (
            <div className="mt-1">No override selected yet.</div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Latest Stored Rate
            </div>
            <div className="mt-2 font-medium text-text-primary">
              {selectedCurrency
                ? `${selectedCurrency.currencyCode} - ${selectedCurrency.currencyName}`
                : 'Select a currency'}
            </div>
            <div className="mt-1">{getStoredBaseRateLabel(latestRate)}</div>
          </div>

          <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
            <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Fallback Group
            </div>
            <div className="mt-2 font-medium text-text-primary">
              {currencyPricingGroup
                ? `${currencyPricingGroup.code} - ${currencyPricingGroup.name}`
                : 'No group selected'}
            </div>
            {currencyPricingGroup ? (
              <div className="mt-2 grid gap-1">
                <div>
                  Buy Margin: {currencyPricingGroup.buyMarginType || 'EMPTY'}{' '}
                  {formatMarginValue(
                    currencyPricingGroup.buyMarginType,
                    currencyPricingGroup.buyMarginValue,
                  )}
                </div>
                <div>
                  Sale Margin: {currencyPricingGroup.saleMarginType || 'EMPTY'}{' '}
                  {formatMarginValue(
                    currencyPricingGroup.saleMarginType,
                    currencyPricingGroup.saleMarginValue,
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-1">
                The group price source will appear here once the currency is assigned.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
          <div className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Calculated Preview
          </div>
          <div className="mt-2 text-sm text-text-secondary">
            {selectedProduct
              ? `Previewing ${selectedProduct.productCode} against ${selectedCurrency?.currencyCode || 'selected currency'}`
              : 'Select a product and currency to see the calculated final buy and sale prices.'}
          </div>
          <div className="mt-4">
            <CurrencyRateComparisonPanel preview={preview} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Product</label>
            <select
              value={form.productId}
              onChange={event => setForm(next => ({ ...next, productId: event.target.value }))}
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
              value={form.currencyId}
              onChange={event => setForm(next => ({ ...next, currencyId: event.target.value }))}
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
            <AsyncSelect
              value={
                CURRENCY_RATE_MARGIN_TYPE_OPTIONS.find(
                  option => option.value === form.buy.marginType
                ) ?? null
              }
              onChange={option => {
                const selectedOption = Array.isArray(option) ? option[0] : option;
                setForm(next => ({
                  ...next,
                  buy: {
                    ...next.buy,
                    marginType:
                      (selectedOption?.value as CurrencyRateMarginType | undefined) ??
                      '',
                  },
                }));
              }}
              loadOptions={loadMarginTypeOptions}
              placeholder="Select"
              isClearable
            />
          </div>
            <div>
              <label className={labelClass}>Buy Margin Value</label>
              <input
                value={form.buy.marginValue ?? ''}
                onChange={event =>
                  setForm(next => ({
                    ...next,
                    buy: { ...next.buy, marginValue: event.target.value },
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Buy Min Rate</label>
              <input
                value={form.buy.minRate ?? ''}
                onChange={event =>
                  setForm(next => ({
                    ...next,
                    buy: { ...next.buy, minRate: event.target.value },
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Buy Max Rate</label>
              <input
                value={form.buy.maxRate ?? ''}
                onChange={event =>
                  setForm(next => ({
                    ...next,
                    buy: { ...next.buy, maxRate: event.target.value },
                  }))
                }
                className={inputClass}
              />
            </div>
          <div>
            <label className={labelClass}>Sale Margin Type</label>
            <AsyncSelect
              value={
                CURRENCY_RATE_MARGIN_TYPE_OPTIONS.find(
                  option => option.value === form.sale.marginType
                ) ?? null
              }
              onChange={option => {
                const selectedOption = Array.isArray(option) ? option[0] : option;
                setForm(next => ({
                  ...next,
                  sale: {
                    ...next.sale,
                    marginType:
                      (selectedOption?.value as CurrencyRateMarginType | undefined) ??
                      '',
                  },
                }));
              }}
              loadOptions={loadMarginTypeOptions}
              placeholder="Select"
              isClearable
            />
          </div>
            <div>
              <label className={labelClass}>Sale Margin Value</label>
              <input
                value={form.sale.marginValue ?? ''}
                onChange={event =>
                  setForm(next => ({
                    ...next,
                    sale: { ...next.sale, marginValue: event.target.value },
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sale Min Rate</label>
              <input
                value={form.sale.minRate ?? ''}
                onChange={event =>
                  setForm(next => ({
                    ...next,
                    sale: { ...next.sale, minRate: event.target.value },
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Sale Max Rate</label>
              <input
                value={form.sale.maxRate ?? ''}
                onChange={event =>
                  setForm(next => ({
                    ...next,
                    sale: { ...next.sale, maxRate: event.target.value },
                  }))
                }
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-primary md:col-span-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={event => setForm(next => ({ ...next, isActive: event.target.checked }))}
            />
            Active
          </label>
        </div>

        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-xs text-text-secondary">
          If an override field is empty, the group rule remains the applied value.
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={() => void onSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : selectedRule ? 'Update Override' : 'Create Override'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
