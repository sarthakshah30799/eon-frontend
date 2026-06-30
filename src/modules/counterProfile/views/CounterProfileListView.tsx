import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { useDebounce } from '@/hooks';
import {
  useDeleteCounterProfile,
  useListCounterProfiles,
  useUpdateCounterProfileStatus,
} from '../hooks';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import { CounterProfileTable } from '../components';
import { Loader } from '@/components/ui/loader';

export const CounterProfileListView = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const query = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch]
  );
  const {
    data: counters = [],
    isLoading,
    isFetching,
    error,
  } = useListCounterProfiles(query);
  const { deleteCounterProfile, isPending: isDeleting } =
    useDeleteCounterProfile();
  const { updateCounterProfileStatus, isPending: isUpdatingStatus } =
    useUpdateCounterProfileStatus();

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this counter?'
    );

    if (confirmDelete) {
      await deleteCounterProfile(id);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await updateCounterProfileStatus({ id, isActive });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {COUNTER_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => navigate('/admin/counter-profile/create')}
        >
          {COUNTER_PROFILE_TEXTS.CREATE_COUNTER}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CounterProfileTable
          counters={counters}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          isUpdatingStatus={isUpdatingStatus}
          loading={isLoading || isFetching}
          onSearch={value => setSearch(value)}
          searchValue={search}
          searchPlaceholder="Search counter name"
        />
      </section>
    </div>
  );
};

export default CounterProfileListView;
