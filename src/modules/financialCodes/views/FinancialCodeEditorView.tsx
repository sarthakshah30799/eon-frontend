import { FinancialCodeForm } from '../forms/FinancialCodeForm';
import type { ICreateFinancialCode } from '../types/financialCodeTypes';

interface FinancialCodeEditorViewProps {
  heading: string;
  description: string;
  submitLabel: string;
  defaultValues: ICreateFinancialCode;
  onSubmitCode: (values: ICreateFinancialCode) => void | Promise<void>;
  isSubmitting?: boolean;
  readOnly?: boolean;
}

export const FinancialCodeEditorView = ({
  submitLabel,
  defaultValues,
  onSubmitCode,
  isSubmitting = false,
  readOnly = false,
}: FinancialCodeEditorViewProps) => {
  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <FinancialCodeForm
        defaultValues={defaultValues}
        onSubmit={onSubmitCode}
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        readOnly={readOnly}
      />
    </section>
  );
};
export default FinancialCodeEditorView;
