import { useNavigate } from 'react-router-dom';
import { CompanyProfileForm } from '../forms';
import { useCreateCompanyProfile } from '../hooks';
import type { ICreateCompanyProfile } from '../types';
import { createEmptyCompanyProfileFormValues } from '../utils';

export const CompanyProfileCreateView = () => {
  const navigate = useNavigate();
  const { createCompanyProfile, isPending: isSaving } = useCreateCompanyProfile();

  const handleSubmit = async (values: ICreateCompanyProfile) => {
    await createCompanyProfile(values);
    navigate('/admin/company-profile');
  };

  return (
    <section className="space-y-6">
      <div className="mx-auto w-full max-w-6xl rounded-md border border-border-primary bg-surface-primary p-5 shadow-sm">
        <CompanyProfileForm
          defaultValues={createEmptyCompanyProfileFormValues()}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      </div>
    </section>
  );
};
