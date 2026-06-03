import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { CurrencyProfileForm } from '../forms';
import type { ICreateCurrencyProfile } from '../types';

interface CurrencyProfileEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues: ICreateCurrencyProfile;
  onSubmitCurrency: (values: ICreateCurrencyProfile) => void | Promise<void>;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export const CurrencyProfileEditorView = ({
  heading,
  description,
  submitLabel,
  defaultValues,
  onSubmitCurrency,
  isSubmitting = false,
  readOnly = false,
}: CurrencyProfileEditorViewProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/currency-profile')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Master Profile
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <CurrencyProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCurrency}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        readOnly={readOnly}
      />
    </section>
  );
};
