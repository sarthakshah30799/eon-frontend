import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button1';
import { Form, FormFieldInput } from '@/components/forms';
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
  submitLabel = 'Create Role',
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
        <FormFieldInput name="code" label="Role Code" disabled={isSubmitting} />
        <FormFieldInput name="name" label="Role Name" disabled={isSubmitting} />
        <FormFieldInput name="description" label="Description" disabled={isSubmitting} />
      </div>

      <div className="flex justify-end border-t border-border-primary pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
};
