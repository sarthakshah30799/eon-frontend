import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
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
  heading,
  description,
  submitLabel,
  defaultValues,
  onSubmitCode,
  isSubmitting = false,
  readOnly = false,
}: FinancialCodeEditorViewProps) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/admin/financial-profile')}
          label="Back"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Admin Menu
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {heading}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          {description}
        </p>
      </div>

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
