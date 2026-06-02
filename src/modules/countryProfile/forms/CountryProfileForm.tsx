import type { SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCheckbox, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import { countryProfileSchema } from '../schema';
import { COUNTRY_PROFILE_TEXTS, riskCategoryOptions } from '../constants';
import type { CountryProfileFormValues } from '../types';

const loadRiskCategoryOptions = async (): Promise<AsyncSelectResponse> => {
  return { options: riskCategoryOptions };
};

interface CountryProfileFormProps {
  defaultValues: CountryProfileFormValues;
  onSubmit: (values: CountryProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const CountryProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY,
  isSubmitting = false,
}: CountryProfileFormProps) => {
  const handleSubmitErrors: SubmitErrorHandler<CountryProfileFormValues> =
    errors => {
      console.log('CountryProfileForm submit errors:', errors);
    };

  return (
    <Form
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(countryProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="countryCode"
          label="Country Code"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="countryName"
          label="Country Name"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="lrsCountryCode"
          label="LRS Country Code"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="ctrCountryCode"
          label="CTR Country Code"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldSelect
          name="riskCategory"
          label="Risk Category"
          defaultOptions={riskCategoryOptions}
          loadOptions={loadRiskCategoryOptions}
          placeholder="Select risk category"
          disabled={isSubmitting}
          isClearable
          isSearchable={false}
        />
      </div>

      <div className="grid gap-3 rounded-sm border border-border-primary bg-surface-secondary p-4 sm:grid-cols-3">
        <FormFieldCheckbox
          name="restrictedCountry"
          label="Restricted Country"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="greyListCountry"
          label="Grey List Country"
          disabled={isSubmitting}
        />
        <FormFieldCheckbox
          name="baseCountry"
          label="Base Country"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
