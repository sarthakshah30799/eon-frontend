import { useCallback, useMemo } from 'react';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import { Form, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import { useListCurrencyProfiles } from '@/modules/currencyProfile/hooks';
import { createCurrencyOptionLabel, COUNTRY_GROUP_TEXTS } from '../constants';
import { countryGroupSchema } from '../schema';
import type { ICountryGroupFormValues, ICreateCountryGroup } from '../types';
import { sanitizeCountryGroupFormValues } from '../utils';

interface CountryGroupFormProps {
  defaultValues: ICountryGroupFormValues;
  onSubmit: (values: ICreateCountryGroup) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  currentId?: string;
  backLabel?: string;
  showFooter?: boolean;
}

export const CountryGroupForm = ({
  defaultValues,
  onSubmit,
  submitLabel = COUNTRY_GROUP_TEXTS.SAVE_GROUP,
  isSubmitting = false,
  onCancel,
  currentId,
  backLabel = 'Back',
  showFooter = true,
}: CountryGroupFormProps) => {
  const navigate = useNavigate();
  const { data: currencyProfiles = [], isLoading: isLoadingCurrencies } =
    useListCurrencyProfiles(undefined, true);

  const currencyOptions = useMemo<AsyncSelectOption[]>(
    () =>
      currencyProfiles.map(currency => ({
        value: currency.id,
        label: createCurrencyOptionLabel(currency.currencyCode, currency.currencyName),
      })),
    [currencyProfiles]
  );

  const loadCurrencyOptions = useCallback(
    async (inputValue: string): Promise<AsyncSelectResponse> => {
      const normalizedSearch = inputValue.trim().toLowerCase();
      const options = normalizedSearch
        ? currencyOptions.filter(option => option.label.toLowerCase().includes(normalizedSearch))
        : currencyOptions;
      return { options };
    },
    [currencyOptions]
  );

  const handleSubmitErrors: SubmitErrorHandler<ICountryGroupFormValues> = errors => {
    console.log('CountryGroupForm submit errors:', errors);
  };

  const handleCancel = onCancel ?? (() => navigate('/admin/country-group'));
  const isDisabled = isSubmitting;

  return (
    <Form
      id="country-group-form"
      onSubmit={values => onSubmit(sanitizeCountryGroupFormValues(values))}
      onError={handleSubmitErrors}
      resolver={yupResolver(countryGroupSchema) as Resolver<ICountryGroupFormValues>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={
        showFooter
          ? {
              submitLabel,
              backLabel,
              onBackClick: handleCancel,
              onCancel: handleCancel,
              isSubmitDisabled: isLoadingCurrencies,
            }
          : undefined
      }
    >
      <CardSection heading={COUNTRY_GROUP_TEXTS.DETAILS_TITLE}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="name"
            label="Name"
            placeholder="Europe"
            disabled={isDisabled}
            valueTransform="none"
          />
          <FormFieldInput
            name="code"
            label="Code"
            placeholder="EU"
            maxLength={2}
            disabled={isDisabled || Boolean(currentId)}
            valueTransform="uppercase"
          />
        </div>
      </CardSection>

      <CardSection heading={COUNTRY_GROUP_TEXTS.SALE_LIMIT_TITLE}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="sellLimitAmount"
            label="Sell Limit Amount"
            placeholder="1000000.00"
            type="text"
            inputMode="decimal"
            valueTransform="none"
            disabled={isDisabled}
          />
          <FormFieldSelect
            name="sellLimitCurrencyId"
            label="Sell Limit Currency"
            placeholder="Select currency"
            loadOptions={loadCurrencyOptions}
            defaultOptions={currencyOptions}
            isSearchable
            isCreatable={false}
            isClearable
            disabled={isDisabled}
            isLoading={isLoadingCurrencies}
          />
        </div>
      </CardSection>

      <CardSection heading={COUNTRY_GROUP_TEXTS.TRAVEL_DURATION_TITLE}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="minTravelDays"
            label="Minimum Travel Days"
            placeholder="1"
            type="text"
            inputMode="numeric"
            valueTransform="none"
            disabled={isDisabled}
          />
          <FormFieldInput
            name="maxTravelDays"
            label="Maximum Travel Days"
            placeholder="30"
            type="text"
            inputMode="numeric"
            valueTransform="none"
            disabled={isDisabled}
          />
        </div>
      </CardSection>
    </Form>
  );
};
