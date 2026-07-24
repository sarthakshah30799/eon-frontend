import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce, usePermission } from '@/hooks';
import { PURPOSE_TEXTS } from '../constants/purposeConstants';
import { PurposeTable } from '../components/PurposeTable';
import { useDeletePurpose, useListPurposes } from '../hooks';

export const PurposeListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/purpose');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim() || undefined,
    [debouncedSearch]
  );

  const {
    data: purposes = [],
    isLoading,
    isFetching,
    error,
  } = useListPurposes(query);
  const { deletePurpose, isPending: isDeleting } = useDeletePurpose();

  const handleDelete = async (id: string) => {
    await deletePurpose(id);
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {PURPOSE_TEXTS.LIST_ERROR}
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
            onClick={() => navigate('/admin/purpose/create')}
          >
            {PURPOSE_TEXTS.CREATE_BUTTON}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <PurposeTable
          purposes={purposes}
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
          searchPlaceholder="Search code or description"
        />
      </section>
    </div>
  );
};

export default PurposeListView;
