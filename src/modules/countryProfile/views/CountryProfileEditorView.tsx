import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { CountryProfileForm } from '../forms';
import type { CountryProfileFormValues } from '../types';

interface CountryProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues: CountryProfileFormValues;
  onSubmitCountry: (values: CountryProfileFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const CountryProfileEditorView = ({
  heading,
  description,
  submitLabel,
  defaultValues,
  onSubmitCountry,
  isSubmitting = false,
}: CountryProfileEditorViewProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/country-profile')}
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

      <CountryProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCountry}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};

