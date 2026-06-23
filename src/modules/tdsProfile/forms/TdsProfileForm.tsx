import { useCallback } from 'react';
import type { Resolver, SubmitErrorHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCheckbox,
  FormFieldDatePicker,
  FormFieldInput,
} from '@/components/forms';
import { tdsProfileSchema } from '../schema';
import type { ICreateTdsProfile } from '../types';
import { TDS_PROFILE_TEXTS } from '../constants';
import { tdsProfileApi } from '@/api/tdsProfile';
import { normalizeCodeValue } from '@/utils';

interface TdsProfileFormProps {
  defaultValues: ICreateTdsProfile;
  onSubmit: (values: ICreateTdsProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  currentId?: string;
}

export const TdsProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = TDS_PROFILE_TEXTS.SAVE_CHANGES,
  isSubmitting = false,
  currentId,
}: TdsProfileFormProps) => {
  const navigate = useNavigate();
  const validateCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const profiles = await tdsProfileApi.getTdsProfiles();
      return profiles.some(
        profile =>
          normalizeCodeValue(profile.code) === normalizedCode &&
          profile.id !== currentId
      );
    },
    [currentId]
  );

  const handleSubmitErrors: SubmitErrorHandler<ICreateTdsProfile> = errors => {
    console.log('TdsProfileForm submit errors:', errors);
  };

  return (
    <Form
      id="tds-profile-form"
      onSubmit={onSubmit}
      onError={handleSubmitErrors}
      resolver={yupResolver(tdsProfileSchema) as Resolver<ICreateTdsProfile>}
      defaultValues={defaultValues}
      className="space-y-6"
      footer={{
        submitLabel,
        backLabel: 'Back',
        onBackClick: () => {
          navigate('/admin/tds-profile');
        },
        onCancel: () => navigate('/admin/tds-profile'),
      }}
    >
      <CardSection heading="Profile Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="code"
            label="Code"
            placeholder="TDS-01"
            disabled={isSubmitting}
            asyncValidation={{
              enabled: !isSubmitting,
              check: validateCode,
              message: 'TDS profile code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          <FormFieldInput
            name="name"
            label="Name"
            placeholder="Standard TDS"
            disabled={isSubmitting}
          />
          <div className="md:col-span-2">
            <FormFieldInput
              name="description"
              label="Description"
              placeholder="Describe the TDS profile"
              disabled={isSubmitting}
            />
          </div>
          <FormFieldInput
            name="sortOrder"
            label="Sort Order"
            type="number"
            disabled={isSubmitting}
          />
          <FormFieldInput
            name="value"
            label="Value"
            type="number"
            disabled={isSubmitting}
            placeholder="0"
          />
        </div>
      </CardSection>

      <CardSection heading="Date Range">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldDatePicker
            name="from"
            label="From"
            disabled={isSubmitting}
          />
          <FormFieldDatePicker
            name="to"
            label="To"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Status">
        <div className="rounded-sm border border-border-primary bg-surface-primary p-3">
          <FormFieldCheckbox
            name="active"
            label="Active"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>
    </Form>
  );
};
