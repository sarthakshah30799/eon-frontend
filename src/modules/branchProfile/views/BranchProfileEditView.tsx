import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  BRANCH_PROFILE_TEXTS,
} from '../constants';
import { useGetBranchProfile, useListBranchProfiles, useUpdateBranchProfile } from '../hooks';
import { mapRecordToFormValues, toBranchAttachedToOptions } from '../utils';
import type { BranchCounterRecord, BranchProfileFormValues } from '../types';
import { BranchProfileEditorView } from './BranchProfileEditorView';

export const BranchProfileEditView = () => {
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
      <div className="py-6 text-center text-text-secondary">
        Loading branch...
      </div>
    );
  }

  if (!branchProfile) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Branch not found</p>
      </div>
    );
  }

  const handleSubmit = async (
    values: BranchProfileFormValues,
    counters: BranchCounterRecord[]
  ) => {
    await submitBranchProfile({
      ...values,
      counters,
    });
  };

  return (
    <BranchProfileEditorView
      heading={BRANCH_PROFILE_TEXTS.EDIT_BRANCH}
      description="Update the branch profile, counter list, and operational settings."
      submitLabel={BRANCH_PROFILE_TEXTS.SAVE_CHANGES}
      defaultValues={mapRecordToFormValues(branchProfile)}
      initialCounters={branchProfile.counters}
      onSubmitBranch={handleSubmit}
      isSubmitting={isPending}
      branchAttachedToOptions={branchAttachedToOptions}
    />
  );
};

export default BranchProfileEditView;
