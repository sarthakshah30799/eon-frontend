import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, usePermission } from '@/hooks';
import { useDeleteUserProfile, useListUserProfiles } from '../hooks';
import { USER_PROFILE_TEXTS } from '../constants';
import { UserProfileTable } from '../components';
import { Loader } from '@/components/ui/loader';

export const UserProfileListView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => ({
      activeOnly: false,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );
  const { data: profiles = [], isLoading, isFetching, error } =
    useListUserProfiles(query);
  const { deleteUserProfile, isPending: isDeleting } = useDeleteUserProfile();
  const { canAdd } = usePermission('/user-profile');

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
              navigate('/user-profile/create')
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
          loading={isLoading || isFetching}
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder="Search user code, name, email, contact no, or designation"
        />
      </section>
    </div >
  );
};
