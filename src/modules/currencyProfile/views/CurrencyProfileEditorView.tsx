import { CurrencyProfileForm } from '../forms';
import type { ICreateCurrencyProfile } from '../types';

interface CurrencyProfileEditorViewProps {
  submitLabel: string;
  defaultValues: ICreateCurrencyProfile;
  onSubmitCurrency: (values: ICreateCurrencyProfile) => void | Promise<void>;
  isSubmitting?: boolean;
  readOnly?: boolean;
  currentId?: string;
}

export const CurrencyProfileEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitCurrency,
  isSubmitting = false,
  readOnly = false,
  currentId,
}: CurrencyProfileEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-7xl rounded-md border border-border-primary bg-surface-primary p-3 shadow-none">
      <CurrencyProfileForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCurrency}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        readOnly={readOnly}
        currentId={currentId}
      />
    </section>
  );
};
