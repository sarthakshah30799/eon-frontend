import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { usePermission } from '@/hooks';
import { useDebounce } from '@/hooks';
import { TDS_PROFILE_TEXTS } from '../constants';
import { TdsProfileTable } from '../components';
import { useDeleteTdsProfile, useListTdsProfiles } from '../hooks';

export const TdsProfileListView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canAdd } = usePermission('/admin/tds-profile');
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => debouncedSearch.trim() || undefined,
    [debouncedSearch]
  );
  const { data: tdsProfiles = [], isLoading, isFetching, error } =
    useListTdsProfiles(query);
  const { deleteTdsProfile, isPending: isDeleting } = useDeleteTdsProfile();

  const handleDelete = async (id: string) => {
    await deleteTdsProfile(id);
  };

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {TDS_PROFILE_TEXTS.LIST_ERROR}
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
            onClick={() => navigate('/admin/tds-profile/create')}
          >
            {TDS_PROFILE_TEXTS.CREATE_BUTTON}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <TdsProfileTable
          tdsProfiles={tdsProfiles}
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
          searchPlaceholder="Search code, name, value, or sort order"
        />
      </section>
    </div>
  );
};

export default TdsProfileListView;
