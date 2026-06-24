import { useNavigate } from 'react-router-dom';
import { useCreateAccountProfile } from '../hooks';
import { AccountProfileForm } from '../forms/AccountProfileForm';
import { createEmptyAccountProfileFormValues } from '../utils/accountProfileUtils';
import type { ICreateAccountProfile } from '../types/accountProfileTypes';

export const AccountProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitAccountProfile, isPending } = useCreateAccountProfile();

  const handleSubmit = async (values: ICreateAccountProfile) => {
    // Sanitize optional fields to avoid empty string database reference errors
    const sanitized = {
      ...values,
      financialSubProfileId: values.financialSubProfileId || undefined,
      branchIdToTransfer: values.branchIdToTransfer || undefined,
      mapToAccountId: values.mapToAccountId || undefined,
    } as ICreateAccountProfile;
    delete sanitized.financialType;
    await submitAccountProfile(sanitized);
    navigate('/admin/accounts-profile');
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-4 shadow-sm sm:p-6">
      <AccountProfileForm
        defaultValues={createEmptyAccountProfileFormValues()}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </section>
  );
};
export default AccountProfileCreateView;
