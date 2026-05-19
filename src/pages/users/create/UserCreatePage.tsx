import { useCreateUser } from '@/modules/user/hooks/useCreateUser';
import { UserForm } from '@/modules/user/forms/UserForm';

const UserCreatePage = () => {
  const { handleSubmit, isPending } = useCreateUser();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <UserForm onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
};

export default UserCreatePage;
