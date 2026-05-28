import { useListCompanyProfiles } from '@/modules/companyProfile/hooks';
import { CompanyProfileEditView } from '@/modules/companyProfile/views';

const CompanyProfileListPage = () => {
  const { data: companies = [], isLoading, error } = useListCompanyProfiles();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-sm text-text-secondary">
          Loading company details...
        </p>
      </div>
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
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-8 text-center shadow-sm max-w-2xl mx-auto mt-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 mx-auto text-amber-600 mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary">No Onboarded Company Found</h2>
        <p className="mt-2 text-sm text-text-secondary leading-6">
          The company details must be initialized and seeded from the database backend by the administrators. 
          Please contact your system developers to initialize the company details.
        </p>
      </div>
    );
  }

  // Otherwise, render the Edit Form directly for the single onboarded company
  return <CompanyProfileEditView id={companies[0].id} />;
};

export default CompanyProfileListPage;
