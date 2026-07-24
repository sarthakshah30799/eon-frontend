import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { PURPOSE_TEXTS } from '../constants/purposeConstants';
import { useGetPurpose, useUpdatePurpose } from '../hooks';
import { mapPurposeToFormValues, sanitizePurposeFormValues } from '../utils/purposeUtils';
import { PurposeEditorView } from './PurposeEditorView';
import type { ICreatePurpose } from '../types/purposeTypes';

export const PurposeEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: purpose,
    isLoading,
    error,
  } = useGetPurpose(id || '', Boolean(id));
  const { updatePurpose, isPending } = useUpdatePurpose();

  useEffect(() => {
    if (!id) {
      navigate('/admin/purpose');
    }
  }, [id, navigate]);

  const defaultValues: ICreatePurpose | null = purpose
    ? mapPurposeToFormValues(purpose)
    : null;

  const handleSubmit = async (values: ICreatePurpose) => {
    if (!id) {
      return;
    }

    await updatePurpose({
      id,
      data: sanitizePurposeFormValues(values),
    });
    navigate('/admin/purpose');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !defaultValues) {
    return (
      <div className="py-6 text-center text-error-600">
        {PURPOSE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <PurposeEditorView
        submitLabel={PURPOSE_TEXTS.SAVE_CHANGES}
        defaultValues={defaultValues}
        onSubmitPurpose={handleSubmit}
        isSubmitting={isPending}
      />
    </section>
  );
};

export default PurposeEditView;
