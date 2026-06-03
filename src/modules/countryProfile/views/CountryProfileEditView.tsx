import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { usePermission } from '@/hooks';
import { COUNTRY_PROFILE_TEXTS } from '../constants';
import { useGetCountryProfile, useUpdateCountryProfile } from '../hooks';
import { createEmptyCountryProfileFormValues } from '../utils';
import type { ICreateCountryProfile } from '../types';
import { CountryProfileEditorView } from './CountryProfileEditorView';

export const CountryProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: country, isLoading } = useGetCountryProfile(id);
  const { submitCountryProfile, isPending } = useUpdateCountryProfile(id);
  const { canModify } = usePermission('/master/system-setups/country-profile');

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

  const handleSubmit = async (values: ICreateCountryProfile) => {
    await submitCountryProfile(values);
    navigate('/master/system-setups/country-profile');
  };

  return (
    <CountryProfileEditorView
      heading={canModify ? COUNTRY_PROFILE_TEXTS.EDIT_COUNTRY : "View Country Details"}
      description={canModify ? "Update the country details." : "View the country details."}
      submitLabel={COUNTRY_PROFILE_TEXTS.SAVE_CHANGES}
      defaultValues={
        country
          ? {
              ...createEmptyCountryProfileFormValues(),
              ...country,
              lrsCountryCode: country.lrsCountryCode ?? '',
              ctrCountryCode: country.ctrCountryCode ?? '',
            }
          : createEmptyCountryProfileFormValues()
      }
      onSubmitCountry={handleSubmit}
      isSubmitting={isPending}
      readOnly={!canModify}
    />
  );
};

export default CountryProfileEditView;
