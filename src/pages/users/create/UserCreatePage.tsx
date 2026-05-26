import { useCreateUser } from '@/modules/user/hooks/useCreateUser';
import { UserForm } from '@/modules/user/forms/UserForm';

const UserCreatePage = () => {
  const { handleSubmit, isPending } = useCreateUser();

  return (
    <div className="rounded-lg border border-border-primary bg-surface-primary p-6 shadow">
      <UserForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
};

export default UserCreatePage;
