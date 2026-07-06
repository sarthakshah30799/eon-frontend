import { useNavigate } from 'react-router-dom';
import { STATE_PROFILE_TEXTS } from '../constants';
import { createEmptyStateProfileFormValues } from '../utils';
import { useCreateStateProfile } from '../hooks';
import { StateProfileEditorView } from './StateProfileEditorView';
import type { ICreateStateProfile } from '../types';

export const StateProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitStateProfile, isPending } = useCreateStateProfile();

  const handleSubmit = async (values: ICreateStateProfile) => {
    const {
      ...payload
    } = values;
    await submitStateProfile(payload);
    navigate('/admin/state-profile');
  };

  return (
    <div className="space-y-4">
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
