import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, useOffsetPaginatedList, usePermission } from '@/hooks';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import { purposeGroupApi } from '@/api/purpose-group';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';
import { PurposeGroupTable } from '../components/PurposeGroupTable';
import { useDeletePurposeGroup } from '../hooks';

export const PurposeGroupListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/purpose-group');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );
  const {
    rows: purposeGroups,
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
    queryKey: ['purpose-groups'],
    queryFn: params => purposeGroupApi.getPurposeGroups(params),
    filters,
  });
  const { deletePurposeGroup, isPending: isDeleting } = useDeletePurposeGroup();

  const handleDelete = async (id: string) => {
    await deletePurposeGroup(id);
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
        {PURPOSE_GROUP_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canAdd && (
          <Button
            type="button"
            className="rounded-sm"
            onClick={() => navigate('/admin/purpose-group/create')}
          >
            {PURPOSE_GROUP_TEXTS.CREATE_BUTTON}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-3 shadow-sm">
        <PurposeGroupTable
          purposeGroups={purposeGroups}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          loading={isLoading}
          isFetching={isFetching}
          onSearch={handleSearch}
          searchValue={search}
          searchPlaceholder="Search name or title"
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

export default PurposeGroupListView;
