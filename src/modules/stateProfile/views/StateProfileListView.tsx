import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { STATE_PROFILE_TEXTS } from '../constants';
import { StateProfileTable } from '../components';
import { useListStateProfiles } from '../hooks';

export const StateProfileListView = () => {
  const navigate = useNavigate();
  const { canAdd } = usePermission('/admin/state-profile');
  const { data: stateResponse, isLoading, error } = useListStateProfiles();
  const states = stateResponse?.data ?? [];

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        {STATE_PROFILE_TEXTS.LIST_ERROR}
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
            onClick={() =>
              navigate('/admin/state-profile/create')
            }
          >
            {STATE_PROFILE_TEXTS.CREATE_STATE}
          </Button>
        )}
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
        <StateProfileTable states={states} />
      </section>
    </div>
  );
};

export default StateProfileListView;
