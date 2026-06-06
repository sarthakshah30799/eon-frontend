import { CountryProfileForm } from '../forms';
import type { ICreateCountryProfile } from '../types';

interface CountryProfileEditorViewProps {
  submitLabel: string;
  defaultValues: ICreateCountryProfile;
  onSubmitCountry: (values: ICreateCountryProfile) => void | Promise<void>;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export const CountryProfileEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitCountry,
  isSubmitting = false,
  readOnly = false,
}: CountryProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
      <CountryProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCountry}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        readOnly={readOnly}
      />
    </section>
  );
};
