import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { BranchProfileForm } from '../forms';
import { createEmptyBranchProfileFormValues } from '../utils';
import type {
  BranchProfileFormValues,
  BranchProfileOption,
} from '../types';

interface BranchProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues?: BranchProfileFormValues;
  onSubmitBranch: (values: BranchProfileFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  branchAttachedToOptions: BranchProfileOption[];
}

export const BranchProfileEditorView = ({
  heading,
  description,
  submitLabel,
  defaultValues = createEmptyBranchProfileFormValues(),
  onSubmitBranch,
  isSubmitting = false,
  branchAttachedToOptions,
}: BranchProfileEditorViewProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() =>
            navigate('/master/system-setups/branch-profile')
          }
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          System Setup
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <BranchProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitBranch}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        branchAttachedToOptions={branchAttachedToOptions}
      />
    </section>
  );
};
