import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { STATE_PROFILE_TEXTS } from '../constants';
import { useGetStateProfile, useUpdateStateProfile } from '../hooks';
import { createEmptyStateProfileFormValues, mapRecordToFormValues } from '../utils';
import type { StateProfileFormValues } from '../types';
import { StateProfileEditorView } from './StateProfileEditorView';

export const StateProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: state, isLoading } = useGetStateProfile(id);
  const { submitStateProfile, isPending } = useUpdateStateProfile(id);

  if (isLoading) {
    return <Loader />;
  }

  if (!state) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">State not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: StateProfileFormValues) => {
    await submitStateProfile(values);
    navigate('/master/system-setups/state-profile');
  };

  return (
    <StateProfileEditorView
      heading={STATE_PROFILE_TEXTS.EDIT_STATE}
      description="Update the state details."
      submitLabel={STATE_PROFILE_TEXTS.SAVE_CHANGES}
      defaultValues={
        state ? mapRecordToFormValues(state) : createEmptyStateProfileFormValues()
      }
      onSubmitState={handleSubmit}
      isSubmitting={isPending}
    />
  );
};

export default StateProfileEditView;

