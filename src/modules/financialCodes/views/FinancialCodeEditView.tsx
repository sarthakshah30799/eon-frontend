import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import { useGetFinancialCode, useUpdateFinancialCode } from '../hooks';
import { createEmptyFinancialCodeValues } from '../utils/financialCodeUtils';
import type { ICreateFinancialCode } from '../types/financialCodeTypes';
import { FinancialCodeEditorView } from './FinancialCodeEditorView';

export const FinancialCodeEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: code, isLoading } = useGetFinancialCode(id);
  const { submitFinancialCodeUpdate, isPending } = useUpdateFinancialCode();
  const { canModify } = usePermission('/financial-profile');

  if (isLoading) {
    return <Loader />;
  }

  if (!code) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Financial Code not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: ICreateFinancialCode) => {
    await submitFinancialCodeUpdate({ id, values });
    navigate('/financial-profile');
  };

  return (
    <FinancialCodeEditorView
      heading={canModify ? FINANCIAL_CODE_TEXTS.EDIT_CODE : "View Financial Code"}
      description={canModify ? "Update the financial code details." : "View the financial code details."}
      submitLabel={FINANCIAL_CODE_TEXTS.SAVE_CHANGES}
      defaultValues={
        code
          ? {
              ...createEmptyFinancialCodeValues(),
              ...code,
            }
          : createEmptyFinancialCodeValues()
      }
      onSubmitCode={handleSubmit}
      isSubmitting={isPending}
      readOnly={!canModify}
      currentId={id}
    />
  );
};
export default FinancialCodeEditView;
