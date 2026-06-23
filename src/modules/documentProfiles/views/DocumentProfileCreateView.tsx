import { useNavigate } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { createEmptyDocumentProfileFormValues, normalizeDocumentProfileValues } from '../utils';
import { DocumentProfileForm } from '../forms';
import { useCreateDocumentProfile } from '../hooks';

export const DocumentProfileCreateView = () => {
  const navigate = useNavigate();
  const { createDocumentProfile, isPending } = useCreateDocumentProfile();

  const handleSubmit = async (values: ReturnType<typeof createEmptyDocumentProfileFormValues>) => {
    await createDocumentProfile(normalizeDocumentProfileValues(values));
    navigate('/admin/document-profile');
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <DocumentProfileForm
      defaultValues={createEmptyDocumentProfileFormValues()}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel="Create Document Profile"
    />
  );
};

export default DocumentProfileCreateView;

