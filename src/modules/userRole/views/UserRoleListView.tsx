import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce } from '@/hooks';
import {
  useDeleteUserRole,
  useListUserRoles,
  useUpdateUserRoleStatus,
} from '../hooks';
import { USER_ROLE_TEXTS } from '../constants';
import { UserRoleTable } from '../components';

export const UserRoleListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim() || undefined,
    [debouncedSearch]
  );
  const { data: roles = [], isLoading, isFetching, error } =
    useListUserRoles(query);
  const { deleteUserRole, isPending: isDeleting } = useDeleteUserRole();
  const { updateUserRoleStatus, isPending: isUpdatingStatus } =
    useUpdateUserRoleStatus();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this role?'
    );
    if (confirmDelete) {
      await deleteUserRole(id);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await updateUserRoleStatus({ id, isActive });
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {USER_ROLE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => navigate('/admin/user-role/create')}
        >
          {USER_ROLE_TEXTS.CREATE_ROLE}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <UserRoleTable
          roles={roles}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          isUpdatingStatus={isUpdatingStatus}
          isDeleting={isDeleting}
          onSearch={value =>
            setSearchParams(prev => {
              const nextParams = new URLSearchParams(prev);

              if (value.trim()) {
                nextParams.set('search', value.trim());
              } else {
                nextParams.delete('search');
              }

              return nextParams;
            })
          }
          searchValue={search}
          searchPlaceholder="Search role code or role name"
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};
