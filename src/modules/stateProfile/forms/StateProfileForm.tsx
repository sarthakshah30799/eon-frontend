import type { SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCountryDropdown, FormFieldInput } from '@/components/forms';
import { stateProfileSchema } from '../schema';
import { STATE_PROFILE_TEXTS } from '../constants';
import type { ICreateStateProfile } from '../types';

interface StateProfileFormProps {
  defaultValues: ICreateStateProfile;
  onSubmit: (values: ICreateStateProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const StateProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = STATE_PROFILE_TEXTS.CREATE_STATE,
  isSubmitting = false,
}: StateProfileFormProps) => {
  const handleSubmitErrors: SubmitErrorHandler<ICreateStateProfile> =
    errors => {
      console.log('StateProfileForm submit errors:', errors);
    };

  return (
    <Form
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(stateProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormFieldCountryDropdown
            name="countryId"
            label="Country"
            placeholder="Select country"
            disabled={isSubmitting}
          />
        </div>
        <FormFieldInput
          name="code"
          label="State Code"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="name"
          label="State Name"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="gstStateCode"
          label="GST State Code"
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="ctrStateCode"
          label="CTR State Code"
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
