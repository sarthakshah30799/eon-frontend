import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { STATE_PROFILE_TEXTS } from '../constants';
import { createEmptyStateProfileFormValues } from '../utils';
import { useCreateStateProfile } from '../hooks';
import { StateProfileEditorView } from './StateProfileEditorView';
import type { ICreateStateProfile } from '../types';

export const StateProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitStateProfile, isPending } = useCreateStateProfile();

  const handleSubmit = async (values: ICreateStateProfile) => {
    await submitStateProfile(values);
    navigate('/master/system-setups/state-profile');
  };

  return (
    <div className="space-y-4">
      <BackButton
        onClick={() => navigate('/master/system-setups/state-profile')}
        label="Back"
      />
      <StateProfileEditorView
        heading={STATE_PROFILE_TEXTS.CREATE_STATE}
        description={STATE_PROFILE_TEXTS.FORM_SUBTITLE}
        submitLabel={STATE_PROFILE_TEXTS.CREATE_STATE}
        defaultValues={createEmptyStateProfileFormValues()}
        onSubmitState={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default StateProfileCreateView;
