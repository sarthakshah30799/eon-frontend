import { StateProfileForm } from '../forms';
import type { ICreateStateProfile } from '../types';

interface StateProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues: ICreateStateProfile;
  onSubmitState: (values: ICreateStateProfile) => void | Promise<void>;
  isSubmitting?: boolean;
  readOnly?: boolean;
  currentId?: string;
}

export const StateProfileEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitState,
  isSubmitting = false,
  readOnly = false,
  currentId,
}: StateProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
      <StateProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitState}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        readOnly={readOnly}
        currentId={currentId}
      />
    </section>
  );
};
