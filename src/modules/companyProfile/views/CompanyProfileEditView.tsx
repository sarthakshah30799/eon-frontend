import { useParams } from 'react-router-dom';
import { CompanyProfileForm } from '../forms';
import { useGetCompanyProfile, useUpdateCompanyProfile } from '../hooks';
import type { CompanyProfileFormValues } from '../types';

const emptyProfile: CompanyProfileFormValues = {
  name: '',
  designation: '',
  rbiName: '',
  rbiPlace: '',
  address1: '',
  address2: '',
  address3: '',
  pincode: '',
  city: '',
  state: '',
  country: 'India',
};

interface CompanyProfileEditViewProps {
  id?: string;
}

export const CompanyProfileEditView = ({ id: propId }: CompanyProfileEditViewProps = {}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propId || paramId;
  const { data, isLoading, error } = useGetCompanyProfile(id);
  const { updateCompanyProfile, isPending: isSaving } = useUpdateCompanyProfile(id || '');

  if (!id) {
    return (
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-sm text-text-secondary">
          Company profile ID is missing.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-sm text-text-secondary">
          Loading company profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-error-500 bg-error-50 p-6 text-error-600 shadow-sm">
        <p className="text-sm">Unable to load company profile.</p>
      </div>
    );
  }

  const handleSubmit = async (values: CompanyProfileFormValues) => {
    await updateCompanyProfile(values);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Master / System setups
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          Edit Company Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Edit the company profile details.
        </p>
      </div>

      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
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
