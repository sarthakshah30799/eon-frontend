import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
} from '@/components/forms';
import { userRoleSchema } from '../schema';
import type { ICreateUserRole } from '../types';

interface UserRoleFormProps {
  defaultValues: ICreateUserRole;
  onSubmit: (values: ICreateUserRole) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const UserRoleForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Role',
  isSubmitting = false,
}: UserRoleFormProps) => {
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(userRoleSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <section className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Role Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput name="code" label="Role Code" disabled={isSubmitting} />
          <FormFieldInput name="name" label="Role Name" disabled={isSubmitting} />
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Role Classifications
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormFieldCheckbox name="isAdmin" label="Is Admin" disabled={isSubmitting} />
          <FormFieldCheckbox name="isMd" label="Is MD" disabled={isSubmitting} />
          <FormFieldCheckbox name="isCompliance" label="Is Compliance" disabled={isSubmitting} />
          <FormFieldCheckbox name="isSrFinance" label="Is Sr Finance" disabled={isSubmitting} />
          <FormFieldCheckbox name="isFinance" label="Is Finance" disabled={isSubmitting} />
          <FormFieldCheckbox name="isBrnMgr" label="Is Branch Manager" disabled={isSubmitting} />
          <FormFieldCheckbox name="isExecutive" label="Is Executive" disabled={isSubmitting} />
          <FormFieldCheckbox name="isCardStk" label="Is Card Stock" disabled={isSubmitting} />
          <FormFieldCheckbox name="isDeliveryBoy" label="Is Delivery Boy" disabled={isSubmitting} />
          <FormFieldCheckbox name="isCashier" label="Is Cashier" disabled={isSubmitting} />
          <FormFieldCheckbox name="isSalesMgr" label="Is Sales Manager" disabled={isSubmitting} />
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Portal & Application Access
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormFieldCheckbox name="isAeonAccess" label="Is AEON Access" disabled={isSubmitting} />
          <FormFieldCheckbox name="isDelPortalAccess" label="Is Delivery Portal Access" disabled={isSubmitting} />
          <FormFieldCheckbox name="isDelAppAccess" label="Is Delivery App Access" disabled={isSubmitting} />
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-secondary p-4">
        <FormFieldCheckbox name="isActive" label="Is Active" disabled={isSubmitting} />
      </section>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
