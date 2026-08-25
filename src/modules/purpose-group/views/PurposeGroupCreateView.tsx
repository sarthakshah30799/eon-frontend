import { useNavigate } from 'react-router-dom';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';
import {
  createEmptyPurposeGroupFormValues,
  sanitizePurposeGroupFormValues,
} from '../utils/purposeGroupUtils';
import { useCreatePurposeGroup } from '../hooks';
import { PurposeGroupEditorView } from './PurposeGroupEditorView';
import type { ICreatePurposeGroup } from '../types/purposeGroupTypes';

export const PurposeGroupCreateView = () => {
  const navigate = useNavigate();
  const { submitPurposeGroup, isPending } = useCreatePurposeGroup();

  const handleSubmit = async (values: ICreatePurposeGroup) => {
    await submitPurposeGroup(sanitizePurposeGroupFormValues(values));
    navigate('/admin/purpose-group');
  };

  return (
    <div className="space-y-4">
      <PurposeGroupEditorView
        submitLabel={PURPOSE_GROUP_TEXTS.CREATE_BUTTON}
        defaultValues={createEmptyPurposeGroupFormValues()}
        onSubmitPurposeGroup={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default PurposeGroupCreateView;
