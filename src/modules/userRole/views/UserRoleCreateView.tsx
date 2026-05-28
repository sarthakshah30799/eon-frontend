import { useNavigate } from 'react-router-dom';
import { createEmptyUserRoleFormValues } from '../utils';
import { UserRoleForm } from '../forms';
import type { UserRoleFormValues } from '../types';
import { useCreateUserRole } from '../hooks';
import { USER_ROLE_TEXTS } from '../constants';

export const UserRoleCreateView = () => {
  const navigate = useNavigate();
  const { submitUserRole, isPending } = useCreateUserRole();

  const handleSubmit = async (values: UserRoleFormValues) => {
    await submitUserRole(values);
    navigate('/master/system-setups/roles-profile');
  };

  return (
    <section className="rounded-2xl border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          System Setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {USER_ROLE_TEXTS.CREATE_ROLE}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {USER_ROLE_TEXTS.FORM_SUBTITLE}
        </p>
      </div>

      <UserRoleForm
        defaultValues={createEmptyUserRoleFormValues()}
        onSubmit={handleSubmit}
        submitLabel={USER_ROLE_TEXTS.CREATE_ROLE}
        isSubmitting={isPending}
      />
    </section>
  );
};
