import { useCallback, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormFieldAsyncSelect,
  FormFieldCheckbox,
  FormFieldCountryDropdown,
  FormFieldInput,
} from '@/components/forms';
import { CardSection } from '@/components/ui';
import type { AsyncSelectResponse } from '@/components/ui';
import {
  CURRENCY_CALCULATION_METHOD_OPTIONS,
  CURRENCY_GROUP_OPTIONS,
  CURRENCY_PRODUCT_ALLOWED_OPTIONS,
  CURRENCY_PROFILE_TEXTS,
} from '../constants';
import { currencyProfileSchema } from '../schema';
import type { ICreateCurrencyProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { currencyProfileApi } from '@/api/currencyProfile';
import { currencyRatesApi } from '@/api/currencyRates';
import { normalizeCodeValue } from '@/utils';

const loadCalculationMethodOptions =
  async (): Promise<AsyncSelectResponse> => ({
    options: CURRENCY_CALCULATION_METHOD_OPTIONS,
  });

const loadGroupOptions = async (): Promise<AsyncSelectResponse> => ({
  options: CURRENCY_GROUP_OPTIONS,
});

const loadProductAllowedOptions = async (): Promise<AsyncSelectResponse> => ({
  options: CURRENCY_PRODUCT_ALLOWED_OPTIONS,
});

const loadPricingGroupOptions = async (): Promise<AsyncSelectResponse> => {
  const groups = await currencyRatesApi.getGroups();
  return {
    options: groups.map(group => ({
      value: group.id,
      label: `${group.code} - ${group.name}`,
    })),
  };
};

interface CurrencyProfileFormProps {
  defaultValues: ICreateCurrencyProfile;
  onSubmit: (values: ICreateCurrencyProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
  currentId?: string;
}

const compactFieldClass = '';

const integerInputProps = {
  inputMode: 'numeric' as const,
  pattern: '[0-9]*',
};

export const CurrencyProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = CURRENCY_PROFILE_TEXTS.CREATE_CURRENCY,
  isSubmitting = false,
  readOnly = false,
  currentId,
}: CurrencyProfileFormProps) => {
  const navigate = useNavigate();
  const isDisabled = isSubmitting || readOnly;
  const validateCurrencyCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const currencies = await currencyProfileApi.getCurrencyProfiles();
      return currencies.some(
        currency =>
          normalizeCodeValue(currency.currencyCode) === normalizedCode &&
          currency.id !== currentId
      );
    },
    [currentId]
  );
  const onCancel = () => {
    navigate('/currency-profile');
  };
  return (
    <Form
      id="currency-profile-form"
      onSubmit={onSubmit}
      resolver={yupResolver(currencyProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-3"
      footer={{
        submitLabel,
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <CardSection heading={CURRENCY_PROFILE_TEXTS.BASIC_INFO_TITLE}>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="currencyCode"
            label="Currency Code"
            disabled={isDisabled || Boolean(currentId)}
            className={compactFieldClass}
            maxLength={3}
            asyncValidation={{
              enabled: !isDisabled,
              check: validateCurrencyCode,
              message: 'Currency code already exists',
              normalize: normalizeCodeValue,
            }}
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
      </CardSection>

      <CardSection heading={CURRENCY_PROFILE_TEXTS.RATE_CONFIGURATION_TITLE}>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <FormFieldInput
            name="priority"
            label="Priority"
            disabled={isDisabled}
            className={compactFieldClass}
            {...integerInputProps}
          />
          <FormFieldInput
            type="number"
            name="ratePer"
            label="Rate / Per"
            disabled={isDisabled}
            className={compactFieldClass}
          />
          <FormFieldInput
            type="number"
            name="defaultMinRate"
            label="Default Minimum Rate"
            disabled={isDisabled}
            className={compactFieldClass}
          />
          <FormFieldInput
            type="number"
            name="defaultMaxRate"
            label="Default Maximum Rate"
            disabled={isDisabled}
            className={compactFieldClass}
          />
          <FormFieldInput
            type="number"
            name="openRatePremium"
            label="Open Rate Premium"
            disabled={isDisabled}
            className={compactFieldClass}
          />
          <FormFieldInput
            type="number"
            name="gulfDiscFactor"
            label="Gulf Disc Factor"
            disabled={isDisabled}
            className={compactFieldClass}
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
          <FormFieldAsyncSelect
            name="pricingGroupId"
            label="Pricing Group"
            loadOptions={loadPricingGroupOptions}
            placeholder="Select pricing group"
            disabled={isDisabled}
            size="sm"
            isSearchable={false}
          />
        </div>
      </CardSection>

      <CardSection heading={CURRENCY_PROFILE_TEXTS.STATUS_TITLE}>
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

            <CurrencyProfileProductAllowedField isDisabled={isDisabled} />
          </div>
        </div>
      </CardSection>
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
