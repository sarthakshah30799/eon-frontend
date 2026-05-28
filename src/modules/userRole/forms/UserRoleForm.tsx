import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import {
  Form,
  FormFieldCheckbox,
  FormFieldInput,
} from '@/components/forms';
import { userRoleSchema } from '../schema';
import { USER_ROLE_TEXTS } from '../constants';
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
  submitLabel = USER_ROLE_TEXTS.CREATE_ROLE,
  isSubmitting = false,
}: UserRoleFormProps) => {
  return (
    <Form
      onSubmit={onSubmit}
      resolver={yupResolver(userRoleSchema)}
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldInput name="roleCode" label="Role Code" disabled={isSubmitting} />
        <FormFieldInput name="roleName" label="Role Name" disabled={isSubmitting} />
      </div>

      <div className="rounded-sm border border-border-primary bg-surface-secondary p-4">
        <FormFieldCheckbox name="isActive" label="Is Active" disabled={isSubmitting} />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
