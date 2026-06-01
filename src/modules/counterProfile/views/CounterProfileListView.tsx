import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import {
  useDeleteCounterProfile,
  useListCounterProfiles,
  useUpdateCounterProfileStatus,
} from '../hooks';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import { CounterProfileTable } from '../components';

export const CounterProfileListView = () => {
  const navigate = useNavigate();
  const { data: counters = [], isLoading, error } = useListCounterProfiles();
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
    return (
      <div className="py-6 text-center text-text-secondary">
        {COUNTER_PROFILE_TEXTS.LOADING_COUNTERS}
      </div>
    );
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
      <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
              System Setup
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-text-primary">
              {COUNTER_PROFILE_TEXTS.LIST_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              {COUNTER_PROFILE_TEXTS.LIST_SUBTITLE}
            </p>
          </div>

          <Button
            type="button"
            className="rounded-sm"
            onClick={() =>
              navigate('/master/system-setups/counter-profile/create')
            }
          >
            {COUNTER_PROFILE_TEXTS.CREATE_COUNTER}
          </Button>
        </div>
      </section>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <CounterProfileTable
          counters={counters}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          isUpdatingStatus={isUpdatingStatus}
        />
      </section>
    </div>
  );
};
