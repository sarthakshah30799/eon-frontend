import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import {
  useGetBranchProfile,
  useListBranchProfiles,
  useUpdateBranchProfile,
} from '../hooks';
import { mapRecordToFormValues, toBranchAttachedToOptions } from '../utils';
import type { ICreateBranchProfile } from '../types';
import { BranchProfileEditorView } from './BranchProfileEditorView';
import { Loader } from '@/components/ui/loader';

export const BranchProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: branchProfile, isLoading } = useGetBranchProfile(id);
  const { data: branches = [] } = useListBranchProfiles();
  const { submitBranchProfile, isPending } = useUpdateBranchProfile(id);

  const branchAttachedToOptions = useMemo(
    () => toBranchAttachedToOptions(branches, id),
    [branches, id]
  );

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (!branchProfile) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Branch not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: ICreateBranchProfile) => {
    await submitBranchProfile(values);
  };

  return (
    <div className="space-y-4">
      <BackButton
        onClick={() => navigate('/admin/branch-profile')}
        label="Back"
      />
      <BranchProfileEditorView
        heading={BRANCH_PROFILE_TEXTS.EDIT_BRANCH}
        description="Update the company branch profile and operational settings."
        submitLabel={BRANCH_PROFILE_TEXTS.SAVE_CHANGES}
        cancelLabel="Cancel"
        defaultValues={mapRecordToFormValues(branchProfile)}
        onSubmitBranch={handleSubmit}
        onCancel={() => navigate('/admin/branch-profile')}
        isSubmitting={isPending}
        branchAttachedToOptions={branchAttachedToOptions}
      />
    </div>
  );
};

export default BranchProfileEditView;
