import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDeleteUserRole, useListUserRoles } from '../hooks';
import { USER_ROLE_TEXTS } from '../constants';
import { UserRoleTable } from '../components';

export const UserRoleListView = () => {
  const navigate = useNavigate();
  const { data: roles = [], isLoading, error } = useListUserRoles();
  const { deleteUserRole, isPending: isDeleting } = useDeleteUserRole();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this role?');
    if (confirmDelete) {
      await deleteUserRole(id);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        {USER_ROLE_TEXTS.LOADING_ROLES}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {USER_ROLE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              System Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {USER_ROLE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {USER_ROLE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate('/master/system-setups/roles-profile/create')}
          >
            {USER_ROLE_TEXTS.CREATE_ROLE}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <UserRoleTable
          roles={roles}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </section>
    </div>
  );
};
