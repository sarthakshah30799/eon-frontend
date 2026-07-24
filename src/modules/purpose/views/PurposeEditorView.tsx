import { PurposeForm } from '../forms';
import type { ICreatePurpose } from '../types/purposeTypes';

interface PurposeEditorViewProps {
  submitLabel: string;
  defaultValues: ICreatePurpose;
  onSubmitPurpose: (values: ICreatePurpose) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const PurposeEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitPurpose,
  isSubmitting = false,
}: PurposeEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-7xl rounded-md border border-border-primary bg-surface-primary p-3 shadow-none">
      <PurposeForm
        defaultValues={defaultValues}
        onSubmit={onSubmitPurpose}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};

export default PurposeEditorView;
