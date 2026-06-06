import { CounterProfileForm } from '../forms';
import type { ICreateCounterProfile } from '../types';

interface CounterProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues: ICreateCounterProfile;
  onSubmitCounter: (values: ICreateCounterProfile) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const CounterProfileEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitCounter,
  isSubmitting = false,
}: CounterProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
      <CounterProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCounter}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};
