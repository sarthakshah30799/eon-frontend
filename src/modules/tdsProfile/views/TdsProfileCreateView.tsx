import { useNavigate } from 'react-router-dom';
import { TDS_PROFILE_TEXTS } from '../constants';
import {
  createEmptyTdsProfileFormValues,
  sanitizeTdsProfileFormValues,
} from '../utils';
import { useCreateTdsProfile } from '../hooks';
import { TdsProfileEditorView } from './TdsProfileEditorView';
import type { ICreateTdsProfile } from '../types';

export const TdsProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitTdsProfile, isPending } = useCreateTdsProfile();

  const handleSubmit = async (values: ICreateTdsProfile) => {
    await submitTdsProfile(sanitizeTdsProfileFormValues(values));
    navigate('/admin/tds-profile');
  };

  return (
    <div className="space-y-4">
      <TdsProfileEditorView
        submitLabel={TDS_PROFILE_TEXTS.CREATE_BUTTON}
        defaultValues={createEmptyTdsProfileFormValues()}
        onSubmitTdsProfile={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default TdsProfileCreateView;
