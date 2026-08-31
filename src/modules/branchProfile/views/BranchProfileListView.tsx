import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { branchProfileApi } from '@/api/branchProfile';
import { useDeleteBranchProfile } from '../hooks';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import { BranchProfileTable } from '../components';

export const BranchProfileListView = () => {
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
    rows: branches,
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
    queryKey: ['branch-profiles'],
    queryFn: params => branchProfileApi.getBranchProfiles(params),
    filters,
  });
  const { deleteBranchProfile, isPending: isDeleting } =
    useDeleteBranchProfile();

  const handleDelete = async (id: string) => {
    await deleteBranchProfile(id);
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
        {BRANCH_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/branch-profile/create')}
        >
          {BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <BranchProfileTable
          branches={branches}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search branch code, name, city, state, or country"
          loading={isLoading}
          isFetching={isFetching}
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
