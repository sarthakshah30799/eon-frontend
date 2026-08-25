import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { PURPOSE_GROUP_TEXTS } from '../constants/purposeGroupConstants';
import { useGetPurposeGroup, useUpdatePurposeGroup } from '../hooks';
import {
  mapPurposeGroupToFormValues,
  sanitizePurposeGroupFormValues,
} from '../utils/purposeGroupUtils';
import { PurposeGroupEditorView } from './PurposeGroupEditorView';
import type { ICreatePurposeGroup } from '../types/purposeGroupTypes';

export const PurposeGroupEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: purposeGroup,
    isLoading,
    error,
  } = useGetPurposeGroup(id || '', Boolean(id));
  const { updatePurposeGroup, isPending } = useUpdatePurposeGroup();

  useEffect(() => {
    if (!id) {
      navigate('/admin/purpose-group');
    }
  }, [id, navigate]);

  const defaultValues: ICreatePurposeGroup | null = purposeGroup
    ? mapPurposeGroupToFormValues(purposeGroup)
    : null;

  const handleSubmit = async (values: ICreatePurposeGroup) => {
    if (!id) {
      return;
    }

    await updatePurposeGroup({
      id,
      data: sanitizePurposeGroupFormValues(values),
    });
    navigate('/admin/purpose-group');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !defaultValues) {
    return (
      <div className="py-6 text-center text-error-600">
        {PURPOSE_GROUP_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <PurposeGroupEditorView
        submitLabel={PURPOSE_GROUP_TEXTS.SAVE_CHANGES}
        defaultValues={defaultValues}
        onSubmitPurposeGroup={handleSubmit}
        isSubmitting={isPending}
      />
    </section>
  );
};

export default PurposeGroupEditView;
