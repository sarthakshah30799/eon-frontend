import { CountryGroupForm } from '../forms';
import type { ICountryGroupFormValues, ICreateCountryGroup } from '../types';

interface CountryGroupEditorViewProps {
  submitLabel: string;
  defaultValues: ICountryGroupFormValues;
  onSubmitCountryGroup: (values: ICreateCountryGroup) => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  currentId?: string;
}

export const CountryGroupEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitCountryGroup,
  isSubmitting = false,
  onCancel,
  currentId,
}: CountryGroupEditorViewProps) => {
  return (
    <section className="mx-auto w-full max-w-7xl rounded-md border border-border-primary bg-surface-primary p-3 shadow-none">
      <CountryGroupForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCountryGroup}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        currentId={currentId}
      />
    </section>
  );
};

export default CountryGroupEditorView;
