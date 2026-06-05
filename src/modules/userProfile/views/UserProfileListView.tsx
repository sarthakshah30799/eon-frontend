import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDeleteUserProfile, useListUserProfiles } from '../hooks';
import { USER_PROFILE_TEXTS } from '../constants';
import { UserProfileTable } from '../components';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';

export const UserProfileListView = () => {
  const navigate = useNavigate();
  const { data: profiles = [], isLoading, error } = useListUserProfiles();
  const { deleteUserProfile, isPending: isDeleting } = useDeleteUserProfile();
  const { canAdd } = usePermission('/master/system-setups/user-profile');

  const handleDelete = async (id: string) => {
    await deleteUserProfile(id);
  };

  if (isLoading) {
    return <Loader />;
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
      {canAdd && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() =>
              navigate('/master/system-setups/user-profile/create')
            }
          >
            {USER_PROFILE_TEXTS.CREATE_USER}
          </Button>
        </div>
      )}

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <UserProfileTable
          profiles={profiles}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </section>
    </div >
  );
};
