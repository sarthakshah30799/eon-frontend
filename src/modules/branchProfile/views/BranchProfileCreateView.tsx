import { useMemo } from 'react';
import { useListBranchProfiles } from '../hooks';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import {
  createEmptyBranchProfileFormValues,
  toBranchAttachedToOptions,
} from '../utils';
import type { ICreateBranchProfile } from '../types';
import { useCreateBranchProfile } from '../hooks';
import { BranchProfileEditorView } from './BranchProfileEditorView';

export const BranchProfileCreateView = () => {
  const { data: branches = [] } = useListBranchProfiles();
  const { submitBranchProfile, isPending } = useCreateBranchProfile();

  const branchAttachedToOptions = useMemo(
    () => toBranchAttachedToOptions(branches),
    [branches]
  );

  const handleSubmit = async (values: ICreateBranchProfile) => {
    await submitBranchProfile(values);
  };

  return (
    <BranchProfileEditorView
      heading={BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
      description={BRANCH_PROFILE_TEXTS.FORM_SUBTITLE}
      submitLabel={BRANCH_PROFILE_TEXTS.CREATE_BRANCH}
      defaultValues={createEmptyBranchProfileFormValues()}
      onSubmitBranch={handleSubmit}
      isSubmitting={isPending}
      branchAttachedToOptions={branchAttachedToOptions}
    />
  );
};

export default BranchProfileCreateView;
