import { useMemo } from 'react';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldCheckbox, FormFieldInput, FormFieldSelect } from '@/components/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import { userProfileSchema } from '../schema';
import type { UserProfileFormValues } from '../types';

interface UserProfileFormProps {
  defaultValues: UserProfileFormValues;
  onSubmit: (values: UserProfileFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  isCreate?: boolean;
}

export const UserProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save User',
  isSubmitting = false,
  isCreate = false,
}: UserProfileFormProps) => {
  const statusLoadOptions = useMemo(() => {
    return async () => {
      return {
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' },
        ],
      };
    };
  }, []);

  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(userProfileSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput 
          name="userCode" 
          label="User Code" 
          disabled={isSubmitting} 
          autoComplete="new-password"
        />
        {isCreate && (
          <FormFieldInput
            name="password"
            label="Password"
            type="password"
            disabled={isSubmitting}
            autoComplete="new-password"
          />
        )}
        <FormFieldInput name="firstName" label="First Name" disabled={isSubmitting} autoComplete="new-password" />
        <FormFieldInput name="lastName" label="Last Name" disabled={isSubmitting} autoComplete="new-password" />
        <FormFieldInput name="email" label="Email" type="email" disabled={isSubmitting} autoComplete="new-password" />
        <FormFieldInput name="countryCode" label="Country Code" disabled={isSubmitting} />
        <FormFieldInput name="phoneNumber" label="Phone Number" disabled={isSubmitting} />
        <FormFieldSelect
          name="status"
          label="Status"
          placeholder="Select status"
          loadOptions={statusLoadOptions}
          pagination={false}
          disabled={isSubmitting}
        />
      </div>

      <div className="rounded-2xl border border-border-primary bg-surface-secondary p-4">
        <FormFieldCheckbox name="isHo" label="Is Head Office (HO) User" disabled={isSubmitting} />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
