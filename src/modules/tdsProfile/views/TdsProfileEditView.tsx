import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { TDS_PROFILE_TEXTS } from '../constants';
import { useGetTdsProfile, useUpdateTdsProfile } from '../hooks';
import {
  mapTdsProfileToFormValues,
  sanitizeTdsProfileFormValues,
} from '../utils';
import { TdsProfileEditorView } from './TdsProfileEditorView';
import type { ICreateTdsProfile } from '../types';

export const TdsProfileEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: tdsProfile,
    isLoading,
    error,
  } = useGetTdsProfile(id || '', Boolean(id));
  const { updateTdsProfile, isPending } = useUpdateTdsProfile();

  useEffect(() => {
    if (!id) {
      navigate('/admin/tds-profile');
    }
  }, [id, navigate]);

  const defaultValues: ICreateTdsProfile | null = tdsProfile
    ? mapTdsProfileToFormValues(tdsProfile)
    : null;

  const handleSubmit = async (values: ICreateTdsProfile) => {
    if (!id) {
      return;
    }

    await updateTdsProfile({
      id,
      data: sanitizeTdsProfileFormValues(values),
    });
    navigate('/admin/tds-profile');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !defaultValues) {
    return (
      <div className="py-6 text-center text-error-600">
        {TDS_PROFILE_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <TdsProfileEditorView
        submitLabel={TDS_PROFILE_TEXTS.SAVE_CHANGES}
        defaultValues={defaultValues}
        onSubmitTdsProfile={handleSubmit}
        isSubmitting={isPending}
        currentId={id}
      />
    </section>
  );
};

export default TdsProfileEditView;
