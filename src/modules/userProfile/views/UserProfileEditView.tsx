import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '@/components/ui';
import { UserProfileForm } from '../forms';
import { useGetUserProfile, useUpdateUserProfile } from '../hooks';
import { USER_PROFILE_TEXTS } from '../constants';
import { mapRecordToFormValues } from '../utils';
import type { ICreateUserProfile } from '../types';
import { Loader } from '@/components/ui/loader';

export const UserProfileEditView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const { data: userProfile, isLoading } = useGetUserProfile(id);
  const { submitUserProfile, isPending } = useUpdateUserProfile(id);

  if (isLoading) {
    return (
     <Loader />
    );
  }

  if (!userProfile) {
    return (
      <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
        <p className="text-center text-text-secondary">User not found</p>
      </div>
    );
  }

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

        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary">
          User Management
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-text-primary">
          {USER_PROFILE_TEXTS.EDIT_USER}
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Update the user details and control setup values.
        </p>
      </div>

      <UserProfileForm
        defaultValues={mapRecordToFormValues(userProfile)}
        onSubmit={handleSubmit}
        submitLabel={USER_PROFILE_TEXTS.SAVE_CHANGES}
        isSubmitting={isPending}
      />
    </section>
  );
};
