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
      specificationType: data.specificationType || data.profileCode || '',
      transactionType: data.transactionType || data.profileName || '',
      active: data.active,
      sortOrder: data.sortOrder,
      rules:
        data.rules?.map(rule => ({
          documentCode: rule.documentCode,
          documentDescription: rule.documentDescription,
          documentType: Array.isArray(rule.documentType)
            ? rule.documentType
            : rule.documentType
              ? [rule.documentType]
              : ['ANY'],
          isRequired: rule.isRequired,
          maxSizeMb: rule.maxSizeMb,
          profileSelection: rule.profileSelection || '',
          entitySelection: rule.entitySelection || '',
          fieldSelection: rule.fieldSelection || '',
          fieldValue: rule.fieldValue || '',
          active: rule.active,
          sortOrder: rule.sortOrder,
        })) ?? createEmptyDocumentProfileFormValues().rules,
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
