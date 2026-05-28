import { useNavigate } from 'react-router-dom';
import { CompanyProfileForm } from '../forms';
import { useCreateCompanyProfile } from '../hooks';
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

export const CompanyProfileCreateView = () => {
  const navigate = useNavigate();
  const { createCompanyProfile, isPending: isSaving } = useCreateCompanyProfile();

  const handleSubmit = async (values: CompanyProfileFormValues) => {
    await createCompanyProfile(values);
    navigate('/master/system-setups/company-profile');
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Master / System setups
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          Create Company Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Add a new company profile to the system.
        </p>
      </div>

      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <CompanyProfileForm
          defaultValues={emptyProfile}
          onSubmit={handleSubmit}
          isSaving={isSaving}
        />
      </div>
    </section>
  );
};

export default CompanyProfileCreateView;
