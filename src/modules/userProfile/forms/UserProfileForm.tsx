import { useMemo } from 'react';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldDatePicker,
  FormFieldCheckbox,
  FormFieldInput,
  FormFieldSelect,
} from '@/components/forms';
import {
  BRANCH_OPTIONS,
  CONTROL_SETUP_ITEMS,
  CORPORATE_CLIENT_OPTIONS,
  GROUP_OPTIONS,
  PURPOSE_OPTIONS,
  USER_PROFILE_TEXTS,
  createStaticLoadOptions,
} from '../constants';
import type { UserProfileFormValues } from '../types';
import { yupResolver } from '@hookform/resolvers/yup';
import { userProfileSchema } from '../schema';

interface UserProfileFormProps {
  defaultValues: UserProfileFormValues;
  onSubmit: (values: UserProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const UserProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = USER_PROFILE_TEXTS.CREATE_USER,
  isSubmitting = false,
}: UserProfileFormProps) => {
  const corporateClientLoadOptions = useMemo(
    () => createStaticLoadOptions(CORPORATE_CLIENT_OPTIONS),
    []
  );
  const branchLoadOptions = useMemo(
    () => createStaticLoadOptions(BRANCH_OPTIONS),
    []
  );
  const groupLoadOptions = useMemo(
    () => createStaticLoadOptions(GROUP_OPTIONS),
    []
  );
  const purposeLoadOptions = useMemo(
    () => createStaticLoadOptions(PURPOSE_OPTIONS),
    []
  );

  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(userProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldSelect
          name="corporateClientId"
          label="Corporate Client"
          placeholder="Select corporate client"
          loadOptions={corporateClientLoadOptions}
          pagination={false}
          disabled={isSubmitting}
        />
        <FormFieldInput name="code" label="Code" disabled={isSubmitting} />
        <FormFieldInput name="name" label="Name" disabled={isSubmitting} />
        <FormFieldInput name="cellNo" label="Cell No" disabled={isSubmitting} />
        <FormFieldInput
          name="emailId"
          label="Email ID"
          type="email"
          disabled={isSubmitting}
        />
        <FormFieldSelect
          name="branchId"
          label="Branch"
          placeholder="Select branch"
          loadOptions={branchLoadOptions}
          pagination={false}
          disabled={isSubmitting}
        />
        <FormFieldDatePicker
          name="idWillExpireOn"
          label="ID will expire on"
          disabled={isSubmitting}
        />
        <FormFieldSelect
          name="groupId"
          label="Groups"
          placeholder="Select group"
          loadOptions={groupLoadOptions}
          pagination={false}
          disabled={isSubmitting}
        />
        <FormFieldSelect
          name="purposeId"
          label="Purpose"
          placeholder="Select purpose"
          loadOptions={purposeLoadOptions}
          pagination={false}
          disabled={isSubmitting}
        />
        <FormFieldInput
          name="mpUsername"
          label="MP Username"
          disabled={isSubmitting}
        />
      </div>

      <div className="rounded-2xl border border-border-primary bg-surface-secondary p-4">
        <p className="mb-4 text-sm font-semibold text-text-primary">
          Control Setup
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONTROL_SETUP_ITEMS.map(item => (
            <FormFieldCheckbox
              key={item.key}
              name={`controlSetup.${item.key}`}
              label={item.label}
              disabled={isSubmitting}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
