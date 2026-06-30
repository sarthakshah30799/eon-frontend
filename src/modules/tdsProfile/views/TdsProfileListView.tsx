import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { useDebounce } from '@/hooks';
import { TDS_PROFILE_TEXTS } from '../constants';
import { TdsProfileTable } from '../components';
import { useDeleteTdsProfile, useListTdsProfiles } from '../hooks';

export const TdsProfileListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/admin/tds-profile');
  const [search, setSearch] = useState('');
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

  if (isLoading) {
    return <Loader />;
  }

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
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder="Search code, name, value, or sort order"
        />
      </section>
    </div>
  );
};

export default TdsProfileListView;
