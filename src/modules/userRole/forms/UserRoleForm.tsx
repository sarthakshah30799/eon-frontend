import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
} from '@/components/forms';
import { userRoleSchema } from '../schema';
import type { UserRoleFormValues } from '../types';

interface UserRoleFormProps {
  defaultValues: UserRoleFormValues;
  onSubmit: (values: UserRoleFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const UserRoleForm = ({
  defaultValues,
  onSubmit,
  submitLabel = 'Save User Group',
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
          User Group Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldInput name="userGroupCode" label="User Group Code" disabled={isSubmitting} />
          <FormFieldInput name="userGroupName" label="User Group Name" disabled={isSubmitting} />
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-secondary p-4 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          User Group Classifications
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormFieldCheckbox name="isAdminGrp" label="Is Admin Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isMdGroup" label="Is MD Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isComplianceGrp" label="Is Compliance Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isSrFinanceGrp" label="Is Sr Finance Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isFinanceGrp" label="Is Finance Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isBrnMgrGrp" label="Is Branch Manager Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isExecutiveGrp" label="Is Executive Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isCardStkGrp" label="Is Card Stock Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isDeliveryBoyGrp" label="Is Delivery Boy Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isCashierGrp" label="Is Cashier Group" disabled={isSubmitting} />
          <FormFieldCheckbox name="isSalesMgrGrp" label="Is Sales Manager Group" disabled={isSubmitting} />
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
