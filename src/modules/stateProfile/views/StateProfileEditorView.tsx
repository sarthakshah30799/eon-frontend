import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { StateProfileForm } from '../forms';
import type { StateProfileFormValues } from '../types';

interface StateProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues: StateProfileFormValues;
  onSubmitState: (values: StateProfileFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const StateProfileEditorView = ({
  heading,
  description,
  submitLabel,
  defaultValues,
  onSubmitState,
  isSubmitting = false,
}: StateProfileEditorViewProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/state-profile')}
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

      <StateProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitState}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};

