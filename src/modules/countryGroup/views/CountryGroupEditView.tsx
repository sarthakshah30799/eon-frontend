import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { COUNTRY_GROUP_TEXTS } from '../constants';
import { useGetCountryGroup, useUpdateCountryGroup } from '../hooks';
import {
  createEmptyCountryGroupFormValues,
  mapCountryGroupToFormValues,
} from '../utils';
import { CountryGroupEditorView } from './CountryGroupEditorView';
import type { ICountryGroupFormValues, ICreateCountryGroup } from '../types';

export const CountryGroupEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: group,
    isLoading,
    error,
  } = useGetCountryGroup(id || '', Boolean(id));
  const { submitCountryGroup, isPending } = useUpdateCountryGroup(id || '');

  useEffect(() => {
    if (!id) {
      navigate('/admin/country-group');
    }
  }, [id, navigate]);

  const defaultValues: ICountryGroupFormValues | null = group
    ? mapCountryGroupToFormValues(group)
    : null;

  const handleSubmit = async (values: ICreateCountryGroup) => {
    if (!id) {
      return;
    }

    await submitCountryGroup(values);
    navigate('/admin/country-group');
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !defaultValues) {
    return (
      <div className="py-6 text-center text-error-600">
        {COUNTRY_GROUP_TEXTS.LIST_ERROR}
      </div>
    );
  }

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <CountryGroupEditorView
        submitLabel={COUNTRY_GROUP_TEXTS.SAVE_CHANGES}
        defaultValues={defaultValues ?? createEmptyCountryGroupFormValues()}
        onSubmitCountryGroup={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => navigate('/admin/country-group')}
        currentId={id}
      />
    </section>
  );
};

export default CountryGroupEditView;
