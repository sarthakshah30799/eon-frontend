import type { Dispatch, SetStateAction } from 'react';
import {
  AsyncSelect,
  Button,
  Input,
  Modal,
  type AsyncSelectResponse,
} from '@/components/ui';
import type {
  CurrencyRateProvider,
  ICurrencyRate,
  ICurrencyRateEntryFormValues,
} from '../types/currencyRatesTypes';
import type { ICurrencyProfile } from '@/modules/currencyProfile/types';
import { CURRENCY_RATE_DECIMALS } from '../utils/currencyRatesUtils';

interface CurrencyRateEntryModalProps {
  open: boolean;
  form: ICurrencyRateEntryFormValues;
  setForm: Dispatch<SetStateAction<ICurrencyRateEntryFormValues>>;
  currencies: ICurrencyProfile[];
  selectedRate: ICurrencyRate | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary';
const inputClass = 'w-full rounded-sm border border-border-primary bg-surface-primary px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-500';
const rateStep = `0.${'0'.repeat(CURRENCY_RATE_DECIMALS - 1)}1`;
const providerOptions = [
  { value: 'TICKER', label: 'TICKER' },
  { value: 'FOREX', label: 'FOREX' },
  { value: 'MANUAL', label: 'MANUAL' },
] as const;

export const CurrencyRateEntryModal = ({
  open,
  form,
  setForm,
  currencies,
  selectedRate,
  isSubmitting,
  onSubmit,
  onClose,
}: CurrencyRateEntryModalProps) => {
  const isDetailView = Boolean(selectedRate);
  const isTicker = form.provider === 'TICKER';
  const isManualLike = form.provider === 'MANUAL' || form.provider === 'FOREX';
  const currencyOptions = currencies.map(currency => ({
    value: currency.id,
    label: `${currency.currencyCode} - ${currency.currencyName}`,
  }));
  const loadCurrencyOptions = async (): Promise<AsyncSelectResponse> => ({
    options: currencyOptions,
    hasMore: false,
  });
  const loadProviderOptions = async (): Promise<AsyncSelectResponse> => ({
    options: providerOptions.map(option => ({
      value: option.value,
      label: option.label,
    })),
    hasMore: false,
  });

  return (
    <Modal
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          onClose();
        }
      }}
      title={selectedRate ? 'Rate Detail' : 'Create Current Rate'}
      description="TICKER, FOREX, and MANUAL entries are stored here."
      size="lg"
    >
      <div className="space-y-6">
        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-sm text-text-secondary">
          <div className="font-medium text-text-primary">
            {selectedRate
              ? `${selectedRate.provider} for ${selectedRate.currency?.currencyCode || selectedRate.currencyId}`
              : 'New rate entry'}
          </div>
          {selectedRate ? (
            <div className="mt-2 grid gap-1">
              <div>Buy: {selectedRate.baseBuyRate || '-'}</div>
              <div>Sale: {selectedRate.baseSaleRate || '-'}</div>
              <div>Base Rate: {selectedRate.baseRate || '-'}</div>
            </div>
          ) : (
            <div className="mt-1">No stored rate selected yet.</div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Currency</label>
            <AsyncSelect
              value={
                currencyOptions.find(option => option.value === form.currencyId) ??
                null
              }
              onChange={option => {
                const nextOption = Array.isArray(option) ? option[0] : option;
                setForm(next => ({
                  ...next,
                  currencyId: nextOption ? String(nextOption.value) : '',
                }));
              }}
              loadOptions={loadCurrencyOptions}
              placeholder="Select currency"
              isDisabled={isDetailView}
              isSearchable={false}
            />
          </div>

          <div>
            <label className={labelClass}>Provider</label>
            <AsyncSelect
              value={
                providerOptions.find(option => option.value === form.provider) ??
                null
              }
              onChange={option => {
                const nextOption = Array.isArray(option) ? option[0] : option;
                setForm(next => ({
                  ...next,
                  provider:
                    (nextOption?.value as CurrencyRateProvider | undefined) ??
                    '',
                }));
              }}
              loadOptions={loadProviderOptions}
              placeholder="Select provider"
              isDisabled={isDetailView}
              isSearchable={false}
            />
          </div>

          {isTicker ? (
            <>
              <div>
                <label className={labelClass}>Base Buy Rate</label>
                <Input
                  type="number"
                  step={rateStep}
                  maxDecimalPlaces={CURRENCY_RATE_DECIMALS}
                  value={form.baseBuyRate}
                  disabled={isDetailView}
                  onChange={event => setForm(next => ({ ...next, baseBuyRate: event.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Base Sale Rate</label>
                <Input
                  type="number"
                  step={rateStep}
                  maxDecimalPlaces={CURRENCY_RATE_DECIMALS}
                  value={form.baseSaleRate}
                  disabled={isDetailView}
                  onChange={event => setForm(next => ({ ...next, baseSaleRate: event.target.value }))}
                  className={inputClass}
                />
              </div>
            </>
          ) : null}

          {isManualLike ? (
            <div className="md:col-span-2">
              <label className={labelClass}>Base Rate</label>
              <Input
                type="number"
                step={rateStep}
                maxDecimalPlaces={CURRENCY_RATE_DECIMALS}
                value={form.baseRate}
                disabled={isDetailView}
                onChange={event => setForm(next => ({ ...next, baseRate: event.target.value }))}
                className={inputClass}
              />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              disabled={isDetailView}
              onChange={event => setForm(next => ({ ...next, notes: event.target.value }))}
              className={inputClass}
              rows={2}
            />
          </div>
        </div>

        <div className="rounded-sm border border-border-primary bg-surface-secondary/20 p-4 text-xs text-text-secondary">
          {form.provider === 'TICKER'
            ? 'Ticker entries keep separate buy and sale base values.'
            : 'FOREX and MANUAL entries use one base rate value.'}
        </div>

        <div className="flex gap-3">
          {isDetailView ? null : (
            <Button type="button" onClick={() => void onSubmit()} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Rate'}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            {isDetailView ? 'Close' : 'Cancel'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
