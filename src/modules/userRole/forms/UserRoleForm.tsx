import type { ReactNode } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { CardSection } from '@/components/ui';
import { Form, FormFieldCheckbox, FormFieldInput } from '@/components/forms';
import { useAuth } from '@/lib/AuthContext';
import { userRoleSchema } from '../schema';
import type { ICreateUserRole } from '../types';
import { useNavigate } from 'react-router-dom';

interface UserRoleFormProps {
  defaultValues: ICreateUserRole;
  onSubmit: (values: ICreateUserRole) => void | Promise<void>;
  children?: ReactNode;
  submitLabel?: string;
  isSubmitting?: boolean;
  showAdminControls?: boolean;
}

export const UserRoleForm = ({
  defaultValues,
  onSubmit,
  children,
  submitLabel = 'Save Role',
  isSubmitting = false,
  showAdminControls,
}: UserRoleFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const canManageAdminControls = showAdminControls ?? user?.isAdmin === true;
  const handleSubmit = (values: ICreateUserRole) =>
    onSubmit(canManageAdminControls ? values : { ...values, isAdmin: false });
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
          />
          <FormFieldInput
            name="name"
            label="Role Name"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Role Classifications">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {canManageAdminControls && (
            <FormFieldCheckbox
              name="isAdmin"
              label="Is Admin"
              disabled={isSubmitting}
            />
          )}
          <FormFieldCheckbox
            name="isMd"
            label="Is MD"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isCompliance"
            label="Is Compliance"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isSrFinance"
            label="Is Sr Finance"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isFinance"
            label="Is Finance"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isBrnMgr"
            label="Is Branch Manager"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isExecutive"
            label="Is Executive"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isCardStk"
            label="Is Card Stock"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDeliveryBoy"
            label="Is Delivery Boy"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isCashier"
            label="Is Cashier"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isSalesMgr"
            label="Is Sales Manager"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Portal & Application Access">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormFieldCheckbox
            name="isAeonAccess"
            label="Is AEON Access"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDelPortalAccess"
            label="Is Delivery Portal Access"
            disabled={isSubmitting}
          />
          <FormFieldCheckbox
            name="isDelAppAccess"
            label="Is Delivery App Access"
            disabled={isSubmitting}
          />
        </div>
      </CardSection>

      <CardSection heading="Status">
        <FormFieldCheckbox
          name="isActive"
          label="Is Active"
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
