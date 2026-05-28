import { useParams, useNavigate } from 'react-router-dom';
import { BranchProfileForm } from '../forms';
import { useGetBranchProfile, useUpdateBranchProfile } from '../hooks';
import type { BranchProfileFormValues } from '../types';

const emptyProfile: BranchProfileFormValues = {
  companyId: '',
  branchCode: '',
  branchNumber: 0,
  address1: '',
  address2: '',
  address3: '',
  pincode: '',
  city: '',
  state: '',
  country: 'India',
  stateCode: '',
  gstStateCode: '',
  phoneNumber1: '',
  phoneNumber2: '',
  contactPersonName: '',
  contactPersonPhone: '',
  operationGroup: '',
};

export const BranchProfileEditView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetBranchProfile(id);
  const { updateBranchProfile, isPending: isSaving } = useUpdateBranchProfile(id || '');

  if (!id) {
    return (
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-sm text-text-secondary">
          Branch profile ID is missing.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-sm text-text-secondary">
          Loading branch profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-error-500 bg-error-50 p-6 text-error-600 shadow-sm">
        <p className="text-sm">Unable to load branch profile.</p>
      </div>
    );
  }

  const handleSubmit = async (values: BranchProfileFormValues) => {
    await updateBranchProfile(values);
    navigate('/master/system-setups/branch-profile');
  };

  // Safe mapping of fetched data to form values
  const formValues: BranchProfileFormValues = data
    ? {
        companyId: data.companyId || '',
        branchCode: data.branchCode || '',
        branchNumber: data.branchNumber || 0,
        address1: data.address1 || '',
        address2: data.address2 || '',
        address3: data.address3 || '',
        pincode: data.pincode || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || 'India',
        stateCode: data.stateCode || '',
        gstStateCode: data.gstStateCode || '',
        phoneNumber1: data.phoneNumber1 || '',
        phoneNumber2: data.phoneNumber2 || '',
        contactPersonName: data.contactPersonName || '',
        contactPersonPhone: data.contactPersonPhone || '',
        operationGroup: data.operationGroup || '',
      }
    : emptyProfile;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Master / System setups
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          Edit Branch Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Update your branch configuration and contact details.
        </p>
      </div>

      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <BranchProfileForm
          defaultValues={formValues}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          submitLabel="Save Changes"
        />
      </div>
    </section>
  );
};

export default BranchProfileEditView;
