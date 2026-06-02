import { useNavigate } from 'react-router-dom';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import { createEmptyCountryProfileFormValues } from '../utils';
import { useCreateCountryProfile } from '../hooks';
import { CountryProfileEditorView } from './CountryProfileEditorView';
import type { CountryProfileFormValues } from '../types';

export const CountryProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitCountryProfile, isPending } = useCreateCountryProfile();

  const handleSubmit = async (values: CountryProfileFormValues) => {
    await submitCountryProfile(values);
    navigate('/master/system-setups/country-profile');
  };

  return (
    <CountryProfileEditorView
      heading={COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY}
      description={COUNTRY_PROFILE_TEXTS.FORM_SUBTITLE}
      submitLabel={COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY}
      defaultValues={createEmptyCountryProfileFormValues()}
      onSubmitCountry={handleSubmit}
      isSubmitting={isPending}
    />
  );
};

export default CountryProfileCreateView;

