import { useNavigate } from 'react-router-dom';
import { COUNTER_PROFILE_TEXTS } from '../constants';
import { createEmptyCounterProfileFormValues } from '../utils';
import { useCreateCounterProfile } from '../hooks';
import { CounterProfileEditorView } from './CounterProfileEditorView';
import type { ICreateCounterProfile } from '../types';

export const CounterProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitCounterProfile, isPending } = useCreateCounterProfile();

  const handleSubmit = async (values: ICreateCounterProfile) => {
    await submitCounterProfile(values);
    navigate('/admin/counter-profile');
  };

  return (
    <div className="space-y-4">
      <CounterProfileEditorView
        heading={COUNTER_PROFILE_TEXTS.CREATE_COUNTER}
        description={COUNTER_PROFILE_TEXTS.FORM_SUBTITLE}
        submitLabel={COUNTER_PROFILE_TEXTS.CREATE_COUNTER}
        defaultValues={createEmptyCounterProfileFormValues()}
        onSubmitCounter={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default CounterProfileCreateView;
