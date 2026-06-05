import { BranchProfileForm } from '../forms';
import { createEmptyBranchProfileFormValues } from '../utils';
import type {
  ICreateBranchProfile,
  IBranchProfileOption,
} from '../types';

interface BranchProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  cancelLabel?: string;
  defaultValues?: ICreateBranchProfile;
  onSubmitBranch: (values: ICreateBranchProfile) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  isSubmitting?: boolean;
  branchAttachedToOptions: IBranchProfileOption[];
}

export const BranchProfileEditorView = ({
  submitLabel,
  cancelLabel,
  defaultValues = createEmptyBranchProfileFormValues(),
  onSubmitBranch,
  onCancel,
  isSubmitting = false,
  branchAttachedToOptions,
}: BranchProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-7xl rounded-xl border border-sky-100 bg-white/90 p-4 shadow-none backdrop-blur-sm">
      <BranchProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitBranch}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        branchAttachedToOptions={branchAttachedToOptions}
      />
    </section>
  );
};
