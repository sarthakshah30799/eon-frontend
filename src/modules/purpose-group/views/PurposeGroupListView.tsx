import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, usePermission } from '@/hooks';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';
import { PurposeGroupTable } from '../components/PurposeGroupTable';
import { useDeletePurposeGroup, useListPurposeGroups } from '../hooks';

export const PurposeGroupListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/purpose-group');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim() || undefined,
    [debouncedSearch],
  );

  const {
    data: purposeGroups = [],
    isLoading,
    isFetching,
    error,
  } = useListPurposeGroups(query);
  const { deletePurposeGroup, isPending: isDeleting } = useDeletePurposeGroup();

  const handleDelete = async (id: string) => {
    await deletePurposeGroup(id);
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {PURPOSE_GROUP_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <PurposeGroupTable
          purposeGroups={purposeGroups}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          loading={isLoading || isFetching}
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
          searchPlaceholder="Search name or title"
        />
      </section>
    </div>
  );
};

export default PurposeGroupListView;
