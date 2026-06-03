import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
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
  heading,
  description,
  submitLabel,
  defaultValues,
  onSubmitCounter,
  isSubmitting = false,
}: CounterProfileEditorViewProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/admin/counter-profile')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <CounterProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCounter}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};
