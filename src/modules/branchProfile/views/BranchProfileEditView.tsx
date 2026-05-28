import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { BranchProfileForm } from '../forms';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import { useGetBranchProfile, useListBranchProfiles, useUpdateBranchProfile } from '../hooks';
import { mapRecordToFormValues, toBranchAttachedToOptions } from '../utils';
import type { BranchProfileFormValues } from '../types';

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

  const handleSubmit = async (values: BranchProfileFormValues) => {
    await submitBranchProfile(values);
    navigate('/master/system-setups/branch-profile');
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/branch-profile')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          System Setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {BRANCH_PROFILE_TEXTS.EDIT_BRANCH}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Update the branch profile and operational settings.
        </p>
      </div>

      <BranchProfileForm
        defaultValues={mapRecordToFormValues(branchProfile)}
        onSubmit={handleSubmit}
        submitLabel={BRANCH_PROFILE_TEXTS.SAVE_CHANGES}
        isSubmitting={isPending}
        branchAttachedToOptions={branchAttachedToOptions}
      />
    </section>
  );
};
