import type { SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Form,
  FormFieldCountryDropdown,
  FormFieldInput,
} from '@/components/forms';
import { stateProfileSchema } from '../schema';
import { STATE_PROFILE_TEXTS } from '../constants';
import type { ICreateStateProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface StateProfileFormProps {
  defaultValues: ICreateStateProfile;
  onSubmit: (values: ICreateStateProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export const StateProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = STATE_PROFILE_TEXTS.CREATE_STATE,
  isSubmitting = false,
  readOnly = false,
}: StateProfileFormProps) => {
  const navigate = useNavigate();

  const handleSubmitErrors: SubmitErrorHandler<
    ICreateStateProfile
  > = errors => {
    console.log('StateProfileForm submit errors:', errors);
  };

  const isDisabled = isSubmitting || readOnly;
  const onCancel = () => {
    navigate('/admin/state-profile');
  };
  return (
    <Form
      id="state-profile-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(stateProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        onBackClick: () => {
          void onCancel?.();
        },
        onCancel,
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormFieldCountryDropdown
            name="countryId"
            label="Country"
            placeholder="Select country"
            disabled={isDisabled}
          />
        </div>
        <FormFieldInput name="code" label="State Code" disabled={isDisabled} />
        <FormFieldInput name="name" label="State Name" disabled={isDisabled} />
        <FormFieldInput
          name="gstStateCode"
          label="GST State Code"
          disabled={isDisabled}
        />
        <FormFieldInput
          name="ctrStateCode"
          label="CTR State Code"
          disabled={isDisabled}
        />
      </div>
    </Form>
  );
};
