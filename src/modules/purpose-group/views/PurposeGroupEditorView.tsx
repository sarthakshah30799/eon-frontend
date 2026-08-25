import { PurposeGroupForm } from '../forms';
import type { ICreatePurposeGroup } from '../types/purposeGroupTypes';

interface PurposeGroupEditorViewProps {
  submitLabel: string;
  defaultValues: ICreatePurposeGroup;
  onSubmitPurposeGroup: (values: ICreatePurposeGroup) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const PurposeGroupEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitPurposeGroup,
  isSubmitting = false,
}: PurposeGroupEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-7xl rounded-md border border-border-primary bg-surface-primary p-3 shadow-none">
      <PurposeGroupForm
        defaultValues={defaultValues}
        onSubmit={onSubmitPurposeGroup}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};

export default PurposeGroupEditorView;
