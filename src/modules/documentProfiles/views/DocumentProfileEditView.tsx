import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { DocumentProfileForm } from '../forms';
import {
  createEmptyDocumentProfileFormValues,
  normalizeDocumentProfileValues,
} from '../utils';
import { useGetDocumentProfile, useUpdateDocumentProfile } from '../hooks';

export const DocumentProfileEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetDocumentProfile(id);
  const { updateDocumentProfile, isPending } = useUpdateDocumentProfile();

  const defaultValues = useMemo(() => {
    if (!data) {
      return createEmptyDocumentProfileFormValues();
    }

    return {
      documentCode: data.documentCode || '',
      documentDescription: data.documentDescription || '',
      documentType: Array.isArray(data.documentType) ? data.documentType : [],
      isRequired: data.isRequired,
      maxSizeMb: data.maxSizeMb,
      specificationType: data.specificationType || '',
      type: data.type?.id || '',
      groupSelection: data.groupSelection?.id || '',
      entitySelection: data.entitySelection?.id || '',
      financialYearSelection: data.financialYearSelection?.id || '',
      active: data.active,
      sortOrder: data.sortOrder,
    };
  }, [data]);

  useEffect(() => {
    if (!id) {
      navigate('/admin/document-profile');
    }
  }, [id, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="py-6 text-center text-error-600">
        Failed to load document profile details.
      </div>
    );
  }

  const handleSubmit = async (values: ReturnType<typeof createEmptyDocumentProfileFormValues>) => {
    if (!id) {
      return;
    }

    await updateDocumentProfile({
      id,
      values: normalizeDocumentProfileValues(values),
    });
    navigate('/admin/document-profile');
  };

  return (
    <DocumentProfileForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel="Update Document Profile"
    />
  );
};

export default DocumentProfileEditView;
