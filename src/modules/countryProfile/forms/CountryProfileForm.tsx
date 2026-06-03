import type { SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCheckbox, FormFieldInput, FormFieldSelect } from '@/components/forms';
import type { AsyncSelectResponse } from '@/components/ui';
import { countryProfileSchema } from '../schema';
import { COUNTRY_PROFILE_TEXTS, riskCategoryOptions } from '../constants';
import type { ICreateCountryProfile } from '../types';

const loadRiskCategoryOptions = async (): Promise<AsyncSelectResponse> => {
  return { options: riskCategoryOptions };
};

interface CountryProfileFormProps {
  defaultValues: ICreateCountryProfile;
  onSubmit: (values: ICreateCountryProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export const CountryProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY,
  isSubmitting = false,
  readOnly = false,
}: CountryProfileFormProps) => {
  const handleSubmitErrors: SubmitErrorHandler<ICreateCountryProfile> =
    errors => {
      console.log('CountryProfileForm submit errors:', errors);
    };

  const isDisabled = isSubmitting || readOnly;

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
          name="code"
          label="Country Code"
          disabled={isDisabled}
        />
        <FormFieldInput
          name="name"
          label="Country Name"
          disabled={isDisabled}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput
          name="lrsCountryCode"
          label="LRS Country Code"
          disabled={isDisabled}
        />
        <FormFieldInput
          name="ctrCountryCode"
          label="CTR Country Code"
          disabled={isDisabled}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldSelect
          name="riskCategory"
          label="Risk Category"
          defaultOptions={riskCategoryOptions}
          loadOptions={loadRiskCategoryOptions}
          placeholder="Select risk category"
          disabled={isDisabled}
          isClearable
          isSearchable={false}
        />
      </div>

      <div className="grid gap-3 rounded-sm border border-border-primary bg-surface-secondary p-4 sm:grid-cols-3">
        <FormFieldCheckbox
          name="restrictedCountry"
          label="Restricted Country"
          disabled={isDisabled}
        />
        <FormFieldCheckbox
          name="greyListCountry"
          label="Grey List Country"
          disabled={isDisabled}
        />
        <FormFieldCheckbox
          name="baseCountry"
          label="Base Country"
          disabled={isDisabled}
        />
      </div>

      {!readOnly && (
        <div className="flex justify-end border-t border-border-primary pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      )}
    </Form>
  );
};
