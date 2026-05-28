import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { BranchProfileForm } from '../forms';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import {
  createEmptyBranchProfileFormValues,
  toBranchAttachedToOptions,
} from '../utils';
import type { BranchProfileFormValues } from '../types';
import { useCreateBranchProfile, useListBranchProfiles } from '../hooks';

export const BranchProfileCreateView = () => {
  const navigate = useNavigate();
  const { data: branches = [] } = useListBranchProfiles();
  const { submitBranchProfile, isPending } = useCreateBranchProfile();

  const branchAttachedToOptions = useMemo(
    () => toBranchAttachedToOptions(branches),
    [branches]
  );

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
          {BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {BRANCH_PROFILE_TEXTS.FORM_SUBTITLE}
        </p>
      </div>

      <BranchProfileForm
        defaultValues={createEmptyBranchProfileFormValues()}
        onSubmit={handleSubmit}
        submitLabel={BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
        isSubmitting={isPending}
        branchAttachedToOptions={branchAttachedToOptions}
      />
    </section>
  );
};
