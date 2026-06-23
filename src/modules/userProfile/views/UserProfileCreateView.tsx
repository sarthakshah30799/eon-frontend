import { useNavigate } from 'react-router-dom';
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
    navigate('/admin/user-profile');
  };

  return (
    <section className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <UserProfileForm
        defaultValues={createEmptyUserProfileFormValues()}
        onSubmit={handleSubmit}
        submitLabel={USER_PROFILE_TEXTS.CREATE_USER}
        isSubmitting={isPending}
        currentId={undefined}
      />
    </section>
  );
};
