import { useNavigate } from 'react-router-dom';
import { PURPOSE_TEXTS } from '../constants/purposeConstants';
import { createEmptyPurposeFormValues, sanitizePurposeFormValues } from '../utils/purposeUtils';
import { useCreatePurpose } from '../hooks';
import { PurposeEditorView } from './PurposeEditorView';
import type { ICreatePurpose } from '../types/purposeTypes';

export const PurposeCreateView = () => {
  const navigate = useNavigate();
  const { submitPurpose, isPending } = useCreatePurpose();

  const handleSubmit = async (values: ICreatePurpose) => {
    await submitPurpose(sanitizePurposeFormValues(values));
    navigate('/admin/purpose');
  };

  return (
    <div className="space-y-4">
      <PurposeEditorView
        submitLabel={PURPOSE_TEXTS.CREATE_BUTTON}
        defaultValues={createEmptyPurposeFormValues()}
        onSubmitPurpose={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default PurposeCreateView;
