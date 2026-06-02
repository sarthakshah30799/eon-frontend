import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import { useGetCountryProfile, useUpdateCountryProfile } from '../hooks';
import { createEmptyCountryProfileFormValues, mapRecordToFormValues } from '../utils';
import type { CountryProfileFormValues } from '../types';
import { CountryProfileEditorView } from './CountryProfileEditorView';

export const CountryProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: country, isLoading } = useGetCountryProfile(id);
  const { submitCountryProfile, isPending } = useUpdateCountryProfile(id);

  if (isLoading) {
    return <Loader />;
  }

  if (!country) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">Country not found</p>
      </div>
    );
  }

  const handleSubmit = async (values: CountryProfileFormValues) => {
    await submitCountryProfile(values);
    navigate('/master/system-setups/country-profile');
  };

  return (
    <CountryProfileEditorView
      heading={COUNTRY_PROFILE_TEXTS.EDIT_COUNTRY}
      description="Update the country details."
      submitLabel={COUNTRY_PROFILE_TEXTS.SAVE_CHANGES}
      defaultValues={country ? mapRecordToFormValues(country) : createEmptyCountryProfileFormValues()}
      onSubmitCountry={handleSubmit}
      isSubmitting={isPending}
    />
  );
};

export default CountryProfileEditView;

