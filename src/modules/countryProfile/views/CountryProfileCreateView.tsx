import { useNavigate } from 'react-router-dom';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import { createEmptyCountryProfileFormValues } from '../utils';
import { useCreateCountryProfile } from '../hooks';
import { CountryProfileEditorView } from './CountryProfileEditorView';
import type { ICreateCountryProfile } from '../types';

export const CountryProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitCountryProfile, isPending } = useCreateCountryProfile();

  const handleSubmit = async (values: ICreateCountryProfile) => {
    await submitCountryProfile(values);
    navigate('/master/system-setups/country-profile');
  };

  return (
    <div className="space-y-4">
      <CountryProfileEditorView
        submitLabel={COUNTRY_PROFILE_TEXTS.CREATE_COUNTRY}
        defaultValues={createEmptyCountryProfileFormValues()}
        onSubmitCountry={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default CountryProfileCreateView;
