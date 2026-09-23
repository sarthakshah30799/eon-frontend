import { useNavigate } from 'react-router-dom';
import { useCreateAccountProfile } from '../hooks';
import { AccountProfileForm } from '../forms/AccountProfileForm';
import { createEmptyAccountProfileFormValues } from '../utils/accountProfileUtils';
import type { ICreateAccountProfile } from '../types/accountProfileTypes';
import { SurfacePanel } from '@/components/ui';

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
    <SurfacePanel>
      <AccountProfileForm
        defaultValues={createEmptyAccountProfileFormValues()}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </SurfacePanel>
  );
};
export default AccountProfileCreateView;
