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
  const { canModify } = usePermission('/admin/country-profile');

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
    const {
      id,
      countryCode,
      countryName,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      country,
      ...payload
    } = values as any;
    await submitCountryProfile(payload);
    navigate('/admin/country-profile');
  };

  return (
    <div className="space-y-4">
      <CountryProfileEditorView
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
        currentId={id}
      />
    </div>
  );
};

export default CountryProfileEditView;
