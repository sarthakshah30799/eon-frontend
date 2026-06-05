import { useMemo } from 'react';
import { useListBranchProfiles } from '../hooks';
import { BackButton } from '@/components/ui';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import {
  createEmptyBranchProfileFormValues,
  toBranchAttachedToOptions,
} from '../utils';
import type { ICreateBranchProfile } from '../types';
import { useCreateBranchProfile } from '../hooks';
import { BranchProfileEditorView } from './BranchProfileEditorView';
import { useNavigate } from 'react-router-dom';

export const BranchProfileCreateView = () => {
  const navigate = useNavigate();
  const { data: branches = [] } = useListBranchProfiles();
  const { submitBranchProfile, isPending } = useCreateBranchProfile();

  const branchAttachedToOptions = useMemo(
    () => toBranchAttachedToOptions(branches),
    [branches]
  );

  const handleSubmit = async (values: ICreateBranchProfile) => {
    await submitBranchProfile(values);
    navigate('/admin/branch-profile');
  };

  return (
    <div className="space-y-2">
      <BackButton
        onClick={() => navigate('/admin/branch-profile')}
        label="Back"
      />
      <BranchProfileEditorView
        heading={BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
        description={BRANCH_PROFILE_TEXTS.FORM_SUBTITLE}
        submitLabel="Submit"
        cancelLabel="Cancel"
        defaultValues={createEmptyBranchProfileFormValues()}
        onSubmitBranch={handleSubmit}
        onCancel={() => navigate('/admin/branch-profile')}
        isSubmitting={isPending}
        branchAttachedToOptions={branchAttachedToOptions}
      />
    </div>
  );
};

export default BranchProfileCreateView;
