import { BranchProfileForm } from '../forms';
import { createEmptyBranchProfileFormValues } from '../utils';
import type { ICreateBranchProfile, IBranchProfileOption } from '../types';
import type { BranchCounterRightsApi } from '../types/branchCounterRightsTypes';
import type { MutableRefObject } from 'react';

interface BranchProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  backLabel?: string;
  onBackClick?: () => void;
  cancelLabel?: string;
  defaultValues?: ICreateBranchProfile;
  onSubmitBranch: (values: ICreateBranchProfile) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  branchAttachedToOptions: IBranchProfileOption[];
  currentId?: string;
  counterRightsApiRef?: MutableRefObject<BranchCounterRightsApi | null>;
}

export const BranchProfileEditorView = ({
  submitLabel,
  backLabel,
  onBackClick,
  cancelLabel,
  defaultValues = createEmptyBranchProfileFormValues(),
  onSubmitBranch,
  onCancel,
  isSubmitting = false,
  branchAttachedToOptions,
  currentId,
  counterRightsApiRef,
}: BranchProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-7xl rounded-xl border border-sky-100 bg-white/90 p-4 shadow-none backdrop-blur-sm">
      <BranchProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitBranch}
        submitLabel={submitLabel}
        backLabel={backLabel}
        onBackClick={onBackClick}
        cancelLabel={cancelLabel}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        branchAttachedToOptions={branchAttachedToOptions}
        currentId={currentId}
        counterRightsApiRef={counterRightsApiRef}
      />
    </section>
  );
};
