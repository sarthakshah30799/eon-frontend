import { useNavigate } from 'react-router-dom';
import { FINANCIAL_CODE_TEXTS } from '../constants/financialCodeConstants';
import { createEmptyFinancialCodeValues } from '../utils/financialCodeUtils';
import { useCreateFinancialCode } from '../hooks/useCreateFinancialCode';
import { FinancialCodeEditorView } from './FinancialCodeEditorView';
import type { ICreateFinancialCode } from '../types/financialCodeTypes';

export const FinancialCodeCreateView = () => {
  const navigate = useNavigate();
  const { submitFinancialCode, isPending } = useCreateFinancialCode();

  const handleSubmit = async (values: ICreateFinancialCode) => {
    await submitFinancialCode(values);
    navigate('/admin/financial-profile');
  };

  return (
    <FinancialCodeEditorView
      heading={FINANCIAL_CODE_TEXTS.CREATE_CODE}
      description={FINANCIAL_CODE_TEXTS.FORM_SUBTITLE}
      submitLabel={FINANCIAL_CODE_TEXTS.CREATE_CODE}
      defaultValues={createEmptyFinancialCodeValues()}
      onSubmitCode={handleSubmit}
      isSubmitting={isPending}
    />
  );
};
export default FinancialCodeCreateView;
