import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import { useGetCounterProfile, useUpdateCounterProfile } from '../hooks';
import { mapRecordToFormValues } from '../utils';
import type { CounterProfileFormValues } from '../types';
import { CounterProfileEditorView } from './CounterProfileEditorView';

export const CounterProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: counter, isLoading } = useGetCounterProfile(id);
  const { submitCounterProfile, isPending } = useUpdateCounterProfile(id);

  if (isLoading) {
    return <Loader />;
  }

  if (!counter) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Counter not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: CounterProfileFormValues) => {
    await submitCounterProfile(values);
    navigate('/master/system-setups/counter-profile');
  };

  return (
    <CounterProfileEditorView
      heading={COUNTER_PROFILE_TEXTS.EDIT_COUNTER}
      description="Update the counter details."
      submitLabel={COUNTER_PROFILE_TEXTS.SAVE_CHANGES}
      defaultValues={mapRecordToFormValues(counter)}
      onSubmitCounter={handleSubmit}
      isSubmitting={isPending}
    />
  );
};

export default CounterProfileEditView;
