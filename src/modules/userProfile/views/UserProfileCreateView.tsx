import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { UserProfileForm } from '../forms';
import { createEmptyUserProfileFormValues } from '../utils';
import type { ICreateUserProfile } from '../types';
import { useCreateUserProfile } from '../hooks';
import { USER_PROFILE_TEXTS } from '../constants';

export const UserProfileCreateView = () => {
  const navigate = useNavigate();
  const { submitUserProfile, isPending } = useCreateUserProfile();

  const handleSubmit = async (values: ICreateUserProfile) => {
    await submitUserProfile(values);
    navigate('/master/system-setups/user-profile');
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6 space-y-4">
        <BackButton
          onClick={() => navigate('/master/system-setups/user-profile')}
          label="Back"
        />
      </div>

      <UserProfileForm
        defaultValues={createEmptyUserProfileFormValues()}
        onSubmit={handleSubmit}
        submitLabel={USER_PROFILE_TEXTS.CREATE_USER}
        isSubmitting={isPending}
      />
    </section>
  );
};
