import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { userProfileApi } from '@/api/userProfile';
import { useDeleteUserProfile } from '../hooks';
import { USER_PROFILE_TEXTS } from '../constants';
import { UserProfileTable } from '../components';

export const UserProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const filters = useMemo(
    () => ({
      activeOnly: false as const,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );
  const {
    rows: profiles,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useOffsetPaginatedList({
    queryKey: ['user-profiles'],
    queryFn: params => userProfileApi.getUserProfiles(params),
    filters,
  });
  const { deleteUserProfile, isPending: isDeleting } = useDeleteUserProfile();
  const { canAdd } = usePermission('/user-profile');

  const handleDelete = async (id: string) => {
    await deleteUserProfile(id);
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);
      if (value.trim()) {
        nextParams.set('search', value.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!nextParams.get('limit')) {
        nextParams.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
      }
      return nextParams;
    });
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {USER_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {canAdd && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => navigate('/user-profile/create')}
          >
            {USER_PROFILE_TEXTS.CREATE_USER}
          </Button>
        </div>
      )}

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <UserProfileTable
          profiles={profiles}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          loading={isLoading}
          isFetching={isFetching}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search user code, name, email, contact no, or designation"
          page={page}
          pageSize={limit}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>
    </div>
  );
};
