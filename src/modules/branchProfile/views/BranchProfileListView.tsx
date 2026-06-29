import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce } from '@/hooks';
import { useDeleteBranchProfile, useListBranchProfiles } from '../hooks';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import { BranchProfileTable } from '../components';
import { Loader } from '@/components/ui/loader';

export const BranchProfileListView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const normalizedSearch = debouncedSearch.trim().toLowerCase();
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

  const filteredBranches = useMemo(() => {
    if (!normalizedSearch) {
      return branches;
    }

    return branches.filter(branch => {
      const haystack = [
        branch.code,
        branch.name,
        branch.branchNumber,
        branch.city,
        branch.contactName,
        branch.contactNo,
        branch.branchEmail,
        branch.country?.name,
        branch.state?.name,
        typeof branch.locationType === 'string'
          ? branch.locationType
          : branch.locationType?.label,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [branches, normalizedSearch]);

  const handleDelete = async (id: string) => {
    await deleteBranchProfile(id);
  };

  if (isLoading) {
    return <Loader />;
  }

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
          branches={filteredBranches}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder="Search branch code, name, city, state, or country"
          loading={isLoading || isFetching}
        />
      </section>
    </div>
  );
};
