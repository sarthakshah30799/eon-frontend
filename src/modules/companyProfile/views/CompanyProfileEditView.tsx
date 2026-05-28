import { useParams } from 'react-router-dom';
import { CompanyProfileForm } from '../forms';
import { useCompanyProfile } from '../hooks';
import type { CompanyProfileFormValues } from '../types';

const emptyProfile: CompanyProfileFormValues = {
  companyName: '',
  rbiName: '',
  rbiDesignation: '',
  rbiPlace: '',
  rbiAddress1: '',
  rbiAddress2: '',
  rbiAddress3: '',
};

export const CompanyProfileEditView = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isSaving, handleSubmit, error } =
    useCompanyProfile(id);

  if (!id) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-sm text-text-secondary">
          Company profile id is missing.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-sm text-text-secondary">
          Loading company profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-error-500 bg-error-50 p-6 text-error-600 shadow-sm">
        <p className="text-sm">Unable to load company profile.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Master / System setups
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          Company Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Edit the company profile for record id{' '}
          <span className="font-semibold">{id}</span>.
        </p>
      </div>

      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <CompanyProfileForm
          defaultValues={data ?? emptyProfile}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      </div>
    </section>
  );
};

export default CompanyProfileEditView;
