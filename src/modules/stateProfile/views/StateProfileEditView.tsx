import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { STATE_PROFILE_TEXTS } from '../constants';
import { useGetStateProfile, useUpdateStateProfile } from '../hooks';
import { createEmptyStateProfileFormValues } from '../utils';
import type { ICreateStateProfile } from '../types';
import { StateProfileEditorView } from './StateProfileEditorView';

export const StateProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: state, isLoading } = useGetStateProfile(id);
  const { submitStateProfile, isPending } = useUpdateStateProfile(id);
  const { canModify } = usePermission('/admin/state-profile');

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

  const handleSubmit = async (values: ICreateStateProfile) => {
    const {
      id,
      countryCode,
      countryName,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      country,
      ...payload
    } = values as any;
    await submitStateProfile(payload);
    navigate('/admin/state-profile');
  };

  return (
    <div className="space-y-4">
      <StateProfileEditorView
        heading={canModify ? STATE_PROFILE_TEXTS.EDIT_STATE : "View State Details"}
        description={canModify ? "Update the state details." : "View the state details."}
        submitLabel={STATE_PROFILE_TEXTS.SAVE_CHANGES}
        defaultValues={
          state
            ? {
                ...createEmptyStateProfileFormValues(),
                ...state,
                gstStateCode: state.gstStateCode ?? '',
                ctrStateCode: state.ctrStateCode ?? '',
              }
            : createEmptyStateProfileFormValues()
        }
        onSubmitState={handleSubmit}
        isSubmitting={isPending}
        readOnly={!canModify}
      />
    </div>
  );
};

export default StateProfileEditView;
