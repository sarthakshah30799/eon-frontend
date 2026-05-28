import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDeleteUserProfile, useListUserProfiles } from '../hooks';
import { USER_PROFILE_TEXTS } from '../constants';
import { UserProfileTable } from '../components';

export const UserProfileListView = () => {
  const navigate = useNavigate();
  const { data: profiles = [], isLoading, error } = useListUserProfiles();
  const { deleteUserProfile, isPending: isDeleting } = useDeleteUserProfile();

  const handleDelete = async (id: string) => {
    await deleteUserProfile(id);
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center text-text-secondary">
        {USER_PROFILE_TEXTS.LOADING_USERS}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {USER_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              User Management
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {USER_PROFILE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {USER_PROFILE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button type="button" onClick={() => navigate('/master/system-setups/user-profile/create')}>
            {USER_PROFILE_TEXTS.CREATE_USER}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <UserProfileTable
          profiles={profiles}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </section>
    </div>
  );
};
