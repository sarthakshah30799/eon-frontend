import { TdsProfileForm } from '../forms';
import type { ICreateTdsProfile } from '../types';

interface TdsProfileEditorViewProps {
  submitLabel: string;
  defaultValues: ICreateTdsProfile;
  onSubmitTdsProfile: (values: ICreateTdsProfile) => void | Promise<void>;
  isSubmitting?: boolean;
  currentId?: string;
}

export const TdsProfileEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitTdsProfile,
  isSubmitting = false,
  currentId,
}: TdsProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-7xl rounded-md border border-border-primary bg-surface-primary p-3 shadow-none">
      <TdsProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitTdsProfile}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        currentId={currentId}
      />
    </section>
  );
};

export default TdsProfileEditorView;
