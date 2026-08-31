import { BRANCH_PROFILE_TEXTS } from '../constants';
import { createEmptyBranchProfileFormValues } from '../utils';
import type { ICreateBranchProfile } from '../types';
import { useCreateBranchProfile } from '../hooks';
import { BranchProfileEditorView } from './BranchProfileEditorView';
import { useNavigate } from 'react-router-dom';

export const BranchProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitBranchProfile, isPending } = useCreateBranchProfile();

  const handleSubmit = async (values: ICreateBranchProfile) => {
    await submitBranchProfile(values);
    navigate('/admin/branch-profile');
  };

  return (
    <BranchProfileEditorView
      heading={BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
      description={BRANCH_PROFILE_TEXTS.FORM_SUBTITLE}
      submitLabel="Submit"
      backLabel="Back"
      onBackClick={() => navigate('/admin/branch-profile')}
      cancelLabel="Cancel"
      defaultValues={createEmptyBranchProfileFormValues()}
      onSubmitBranch={handleSubmit}
      onCancel={() => navigate('/admin/branch-profile')}
      isSubmitting={isPending}
      branchAttachedToOptions={[]}
    />
  );
};

export default BranchProfileCreateView;
