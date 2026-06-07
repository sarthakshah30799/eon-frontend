import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { CompanyProfileForm } from '../forms';
import { useGetCompanyProfile, useUpdateCompanyProfile, useListCompanyProfiles } from '../hooks';
import type { ICreateCompanyProfile } from '../types';
import { createEmptyCompanyProfileFormValues, mapCompanyProfileToFormValues } from '../utils';

interface CompanyProfileEditViewProps {
  id?: string;
}

export const CompanyProfileEditView = ({ id: propId }: CompanyProfileEditViewProps = {}) => {
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const { data: companies = [], isLoading: isListLoading, error: listError } = useListCompanyProfiles();
  
  const activeCompanyId = propId || paramId || companies[0]?.id;

  const { data, isLoading: isGetLoading, error: getError } = useGetCompanyProfile(activeCompanyId);
  const { updateCompanyProfile, isPending: isSaving } = useUpdateCompanyProfile(activeCompanyId || '');

  const isLoading = isListLoading || isGetLoading;
  const error = listError || getError;

  const handleSubmit = async (values: ICreateCompanyProfile) => {
    if (activeCompanyId) {
      await updateCompanyProfile(values);
      navigate('/admin/company-profile');
    }
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error || (!activeCompanyId && !isListLoading)) {
    return (
      <div className="rounded-sm border border-error-500 bg-error-50 p-6 text-error-600 shadow-sm">
        <p className="text-sm">Unable to load company profile. Make sure it is initialized in the database.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
        <CompanyProfileForm
          defaultValues={data ? mapCompanyProfileToFormValues(data) : createEmptyCompanyProfileFormValues()}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      </div>
    </section>
  );
};

export default CompanyProfileEditView;
