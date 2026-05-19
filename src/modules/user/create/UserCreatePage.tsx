import { useCreateUser } from '../hooks/useCreateUser';
import { UserForm } from '../forms/UserForm';

export const UserCreatePage = () => {
  const { handleSubmit, isPending } = useCreateUser();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <UserForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
};
