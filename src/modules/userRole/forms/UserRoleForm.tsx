import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { CardSection } from '@/components/ui';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { userRoleSchema } from '../schema';
import type { ICreateUserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { userRoleApi } from '@/api';
import { normalizeCodeValue } from '@/utils';

interface UserRoleFormProps {
  defaultValues: ICreateUserRole;
  onSubmit: (values: ICreateUserRole) => void | Promise<void>;
  children?: ReactNode;
  submitLabel?: string;
  isSubmitting?: boolean;
  showAdminControls?: boolean;
  currentId?: string;
}

export const UserRoleForm = ({
  defaultValues,
  onSubmit,
  children,
  submitLabel = 'Save Role',
  isSubmitting = false,
  showAdminControls,
  currentId,
}: UserRoleFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const canManageAdminControls = showAdminControls ?? user?.isAdmin === true;
  const handleSubmit = (values: ICreateUserRole) =>
    onSubmit(canManageAdminControls ? values : { ...values, isAdmin: false });
  const validateRoleCode = useCallback(
    async (value: string) => {
      const normalizedCode = normalizeCodeValue(value);
      if (!normalizedCode) {
        return false;
      }

      const roles = await userRoleApi.getUserRoles();
      return roles.some(
        role =>
          normalizeCodeValue(role.code) === normalizedCode && role.id !== currentId
      );
    },
    [currentId]
  );
  const onCancel = () => {
    navigate('/admin/user-role');
  };
  return (
    <Form
      id="user-role-form"
      onSubmit={handleSubmit}
      resolver={yupResolver(userRoleSchema)}
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
      <CardSection heading="Role Details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput
            name="code"
            label="Role Code"
            disabled={isSubmitting}
            asyncValidation={{
              enabled: !isSubmitting,
              check: validateRoleCode,
              message: 'Role code already exists',
              normalize: normalizeCodeValue,
            }}
          />
          <FormFieldInput
            name="name"
            label="Role Name"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Role Classifications">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {canManageAdminControls && (
            <FormFieldCheckbox
              name="isAdmin"
              label="Admin"
              disabled={isSubmitting}
            />
          )}
          <FormFieldCheckbox
            name="isMd"
            label="MD"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isCompliance"
            label="Compliance"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isSrFinance"
            label="Sr Finance"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isFinance"
            label="Finance"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isBrnMgr"
            label="Branch Manager"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isHoStaff"
            label="HO Staff"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isExecutive"
            label="Executive"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isCardStk"
            label="Card Stock"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDeliveryBoy"
            label="Delivery Boy"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isCashier"
            label="Cashier"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isSalesMgr"
            label="Sales Manager"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Portal & Application Access">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormFieldCheckbox
            name="isAeonAccess"
            label="AEON Access"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDelPortalAccess"
            label="Delivery Portal Access"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDelAppAccess"
            label="Delivery App Access"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Status">
        <FormFieldCheckbox
          name="isActive"
          label="Active"
          disabled={isSubmitting}
        />
      </CardSection>

      {children}

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
