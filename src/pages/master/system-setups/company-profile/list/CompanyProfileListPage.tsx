import { Loader } from '@/components/ui/loader';
import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { CompanyProfileEditView } from '@/modules/companyProfile/views';
import { CompanyProfileForm } from '@/modules/companyProfile/forms';
import { createEmptyCompanyProfileFormValues } from '@/modules/companyProfile/utils';
import { useCreateCompanyProfile } from '@/modules/companyProfile/hooks';
import type { ICreateCompanyProfile } from '@/modules/companyProfile/types';

const CompanyProfileListPage = () => {
  const { data: companies = [], isLoading, error } = useListCompanyProfiles();
  const { createCompanyProfile, isPending: isCreating } =
    useCreateCompanyProfile();

  const handleCreate = async (values: ICreateCompanyProfile) => {
    await createCompanyProfile(values);
  };

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-error-500 bg-error-50 p-6 text-error-600 shadow-sm">
        <p className="text-sm">Unable to load company details.</p>
      </div>
    );
  }

  // If no company exists in the database, instruct the user to initialize it on the backend
  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-text-primary">
            Create Company Profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            No company was found, so you can initialize it here now.
          </p>
        </div>

        <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
          <CompanyProfileForm
            defaultValues={createEmptyCompanyProfileFormValues()}
            onSubmit={handleCreate}
            isSaving={isCreating}
          />
        </div>
      </div>
    );
  }

  // Otherwise, render the Edit Form directly for the single onboarded company
  return <CompanyProfileEditView id={companies[0].id} />;
};

export default CompanyProfileListPage;
