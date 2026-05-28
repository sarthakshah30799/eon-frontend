import { useNavigate } from 'react-router-dom';
import { BranchProfileForm } from '../forms';
import { useCreateBranchProfile } from '../hooks';
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

export const BranchProfileCreateView = () => {
  const navigate = useNavigate();
  const { createBranchProfile, isPending: isSaving } = useCreateBranchProfile();

  const handleSubmit = async (values: BranchProfileFormValues) => {
    await createBranchProfile(values);
    navigate('/master/system-setups/branch-profile');
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          Master / System setups
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          Create Branch Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Add a new branch profile linked to a company.
        </p>
      </div>

      <div className="rounded-3xl border border-border-primary bg-surface-primary p-6 shadow-sm">
        <BranchProfileForm
          defaultValues={emptyProfile}
          onSubmit={handleSubmit}
          isSubmitting={isSaving}
          submitLabel="Create Branch"
        />
      </div>
    </section>
  );
};

export default BranchProfileCreateView;
