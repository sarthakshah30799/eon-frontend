import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import { CardSection } from '@/components/ui';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
} from '@/components/forms';
import { UserProfileAssignmentsSection } from '../components/UserProfileAssignmentsSection';
import type { ICreateUserProfile } from '../types';
import { userProfileSchema } from '../schema';
import { userProfileApi } from '@/api/userProfile';
import { normalizeCodeValue } from '@/utils';

interface UserProfileFormProps {
  defaultValues: ICreateUserProfile;
  onSubmit: (values: ICreateUserProfile) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  currentId?: string;
}

const UserProfileFormFields = ({
  isSubmitting,
  currentId,
}: {
  isSubmitting: boolean;
  currentId?: string;
}) => {
  const validateUserCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const users = await userProfileApi.getUserProfiles();
      return users.some(
        user =>
          normalizeCodeValue(user.code) === normalizedCode &&
          user.id !== currentId
      );
    },
    [currentId]
  );

  return (
    <div className="space-y-6">
      <CardSection heading="Identity">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <FormFieldInput
            name="code"
            label="User Code"
            disabled={isSubmitting}
            placeholder="e.g. ADM001"
            asyncValidation={{
              enabled: !isSubmitting,
              check: validateUserCode,
              message: 'User code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          <FormFieldInput
            name="name"
            label="User Name"
            disabled={isSubmitting}
            placeholder="Full Name"
          />
        </div>
      </CardSection>

      <UserProfileAssignmentsSection isSubmitting={isSubmitting} />

      <CardSection heading="ERP Details & Contact">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormFieldInput
            name="email"
            label="Email"
            type="email"
            disabled={isSubmitting}
            placeholder="e.g. sarthak@example.com"
          />
          <FormFieldInput
            name="contactNo"
            label="Contact No."
            disabled={isSubmitting}
            placeholder="Phone Number"
          />
          <FormFieldInput
            name="employeeNo"
            label="Employee No."
            disabled={isSubmitting}
            placeholder="e.g. EMP100"
          />
          <FormFieldInput
            name="designation"
            label="Designation"
            disabled={isSubmitting}
            placeholder="e.g. Regional Manager"
          />
          <FormFieldInput
            name="userLicNo"
            label="User License No."
            disabled={isSubmitting}
            placeholder="e.g. LIC-2900"
          />
        </div>
      </CardSection>

      <CardSection heading="Account Controls">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormFieldCheckbox
            name="isActive"
            label="Active Account"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isLocked"
            label="Locked"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDormant"
            label="Dormant"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>
    </div>
  );
};

export const UserProfileForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Create User',
  isSubmitting = false,
  currentId,
}: UserProfileFormProps) => {
  const navigate = useNavigate();

  const isEdit = !!defaultValues.code;
  const onCancel = () => {
    navigate('/user-profile');
  };

  return (
    <Form
      id="user-profile-form"
      onSubmit={onSubmit}
      resolver={
        yupResolver(userProfileSchema, {
          context: { isEdit },
        }) as Resolver<ICreateUserProfile>
      }
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
      <UserProfileFormFields
        isSubmitting={isSubmitting}
        currentId={currentId}
      />
    </Form>
  );
};
