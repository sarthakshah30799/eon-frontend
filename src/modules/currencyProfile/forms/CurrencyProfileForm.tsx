import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { FormEvent } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldAsyncSelect,
  FormFieldCheckbox,
  FormFieldCountryDropdown,
  FormFieldInput,
} from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import {
  CURRENCY_CALCULATION_METHOD_OPTIONS,
  CURRENCY_GROUP_OPTIONS,
  CURRENCY_PRODUCT_ALLOWED_OPTIONS,
  CURRENCY_PROFILE_TEXTS,
} from '../constants';
import { currencyProfileSchema } from '../schema';
import type { ICreateCurrencyProfile } from '../types';

const loadCalculationMethodOptions = async (): Promise<AsyncSelectResponse> => ({
  options: CURRENCY_CALCULATION_METHOD_OPTIONS,
});

const loadGroupOptions = async (): Promise<AsyncSelectResponse> => ({
  options: CURRENCY_GROUP_OPTIONS,
});

const loadProductAllowedOptions = async (): Promise<AsyncSelectResponse> => ({
  options: CURRENCY_PRODUCT_ALLOWED_OPTIONS,
});

interface CurrencyProfileFormProps {
  defaultValues: ICreateCurrencyProfile;
  onSubmit: (values: ICreateCurrencyProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

const formCardClass =
  'rounded-sm border border-border-primary bg-surface-secondary p-3';
const compactFieldClass = '';

const numericInputProps = {
  inputMode: 'numeric' as const,
  pattern: '[0-9]*',
  onInput: (event: FormEvent<HTMLInputElement>) => {
    event.currentTarget.value = event.currentTarget.value.replace(
      /[^0-9]/g,
      ''
    );
  },
};

export const CurrencyProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY,
  isSubmitting = false,
  readOnly = false,
}: CurrencyProfileFormProps) => {
  const isDisabled = isSubmitting || readOnly;

  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(currencyProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-3"
    >
      <section className={formCardClass}>
        <h2 className="mb-2 text-[11px] font-bold uppercase text-black">
          {CURRENCY_PROFILE_TEXTS.BASIC_INFO_TITLE}
        </h2>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="currencyCode"
            label="Currency Code"
            disabled={isDisabled}
            className={compactFieldClass}
          />
          <FormFieldInput
            name="currencyName"
            label="Currency Name"
            disabled={isDisabled}
            className={compactFieldClass}
          />
          <FormFieldCountryDropdown
            name="countryId"
            label="Countries"
            disabled={isDisabled}
            size="sm"
          />
          <FormFieldInput
            name="amexMapCode"
            label="Amex Map Code"
            disabled={isDisabled}
            className={compactFieldClass}
          />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-2 text-[11px] font-bold uppercase text-black">
          {CURRENCY_PROFILE_TEXTS.RATE_CONFIGURATION_TITLE}
        </h2>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="priority"
            label="Priority"
            disabled={isDisabled}
            className={compactFieldClass}
            {...numericInputProps}
          />
          <FormFieldInput
            name="ratePer"
            label="Rate / Per"
            disabled={isDisabled}
            className={compactFieldClass}
            {...numericInputProps}
          />
          <FormFieldInput
            name="defaultMinRate"
            label="Default Min Rate"
            disabled={isDisabled}
            className={compactFieldClass}
            {...numericInputProps}
          />
          <FormFieldInput
            name="defaultMaxRate"
            label="Default Max Rate"
            disabled={isDisabled}
            className={compactFieldClass}
            {...numericInputProps}
          />
          <FormFieldInput
            name="openRatePremium"
            label="Open Rate Premium"
            disabled={isDisabled}
            className={compactFieldClass}
            {...numericInputProps}
          />
          <FormFieldInput
            name="gulfDiscFactor"
            label="Gulf Disc Factor"
            disabled={isDisabled}
            className={compactFieldClass}
            {...numericInputProps}
          />
          <FormFieldAsyncSelect
            name="calculationMethod"
            label="Calculation Method"
            loadOptions={loadCalculationMethodOptions}
            placeholder="Select calculation method"
            disabled={isDisabled}
            size="sm"
            isSearchable={false}
          />
          <FormFieldAsyncSelect
            name="group"
            label="Group"
            loadOptions={loadGroupOptions}
            placeholder="Select group"
            disabled={isDisabled}
            size="sm"
            isSearchable={false}
          />
        </div>
      </section>

      <section className={formCardClass}>
        <h2 className="mb-2 text-[11px] font-bold uppercase text-black">
          {CURRENCY_PROFILE_TEXTS.STATUS_TITLE}
        </h2>

        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-sm border border-border-primary bg-surface-primary p-2">
            <FormFieldCheckbox
              name="active"
              label="Active"
              disabled={isDisabled}
            />
          </div>

          <div className="rounded-sm border border-border-primary bg-surface-primary p-2">
            <FormFieldCheckbox
              name="onlyStocking"
              label="Only Stocking"
              disabled={isDisabled}
            />

            <CurrencyProfileProductAllowedField
              isDisabled={isDisabled}
            />
          </div>
        </div>
      </section>

      {!readOnly && (
        <div className="flex justify-end border-t border-border-primary pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      )}
    </Form>
  );
};

interface CurrencyProfileProductAllowedFieldProps {
  isDisabled: boolean;
}

const CurrencyProfileProductAllowedField = ({
  isDisabled,
}: CurrencyProfileProductAllowedFieldProps) => {
  const { control, setValue } = useFormContext<ICreateCurrencyProfile>();
  const onlyStocking = useWatch({
    control,
    name: 'onlyStocking',
  });

  useEffect(() => {
    if (!onlyStocking) {
      setValue('productAllowed', '');
    }
  }, [onlyStocking, setValue]);

  if (!onlyStocking) {
    return null;
  }

  return (
    <div className="mt-2">
      <FormFieldAsyncSelect
        name="productAllowed"
        label="Product Allowed"
        loadOptions={loadProductAllowedOptions}
        placeholder="Select product allowed"
        disabled={isDisabled}
        size="sm"
        isSearchable={false}
      />
    </div>
  );
};
