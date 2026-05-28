import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { UserRoleForm } from '../forms';
import { useGetUserRole, useUpdateUserRole } from '../hooks';
import { USER_ROLE_TEXTS } from '../constants';
import { mapRecordToFormValues } from '../utils';
import type { UserRoleFormValues } from '../types';

export const UserRoleEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: role, isLoading } = useGetUserRole(id);
  const { submitUserRole, isPending } = useUpdateUserRole(id);

  if (isLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        Loading role...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Role not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: UserRoleFormValues) => {
    await submitUserRole(values);
    navigate('/master/system-setups/user-role');
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/user-role')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          System Setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {USER_ROLE_TEXTS.EDIT_ROLE}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Update the role details and active status.
        </p>
      </div>

      <UserRoleForm
        defaultValues={mapRecordToFormValues(role)}
        onSubmit={handleSubmit}
        submitLabel={USER_ROLE_TEXTS.SAVE_CHANGES}
        isSubmitting={isPending}
      />
    </section>
  );
};
