import { useCreateUser } from '../hooks/useCreateUser';
import { UserForm } from '../forms/UserForm';

export const UserCreatePage = () => {
  const { handleSubmit, isPending } = useCreateUser();

  return (
    <div className="rounded-lg border border-border-primary bg-surface-primary p-6 shadow">
      <UserForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
};
