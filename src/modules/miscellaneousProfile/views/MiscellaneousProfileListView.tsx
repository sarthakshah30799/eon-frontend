import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button1';
import { Loader } from '@/components/ui/loader';
import { useListMiscellaneousProfiles } from '../hooks';
import { CATEGORY_OPTIONS_TEXTS } from '../constants';
import { MiscellaneousProfileTable } from '../components';

export const MiscellaneousProfileListView = () => {
  const navigate = useNavigate();
  const { data: options = [], isLoading, error } = useListMiscellaneousProfiles();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load miscellaneous profiles.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          className="rounded-sm"
          onClick={() => navigate('/admin/miscellaneous-profile/create')}
        >
          {CATEGORY_OPTIONS_TEXTS.CREATE_TITLE}
        </Button>
      </div>

      <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm">
        <MiscellaneousProfileTable options={options} />
      </section>
    </div>
  );
};

export default MiscellaneousProfileListView;
