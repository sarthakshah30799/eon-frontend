import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce } from '@/hooks';
import { useDeleteBranchProfile, useListBranchProfiles } from '../hooks';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import { BranchProfileTable } from '../components';

export const BranchProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => ({
      activeOnly: false,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );
  const {
    data: branches = [],
    isLoading,
    isFetching,
    error,
  } = useListBranchProfiles(query);
  const { deleteBranchProfile, isPending: isDeleting } =
    useDeleteBranchProfile();

  const handleDelete = async (id: string) => {
    await deleteBranchProfile(id);
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {BRANCH_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/branch-profile/create')}
        >
          {BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <BranchProfileTable
          branches={branches}
          onDelete={handleDelete}
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
          searchPlaceholder="Search branch code, name, city, state, or country"
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};
