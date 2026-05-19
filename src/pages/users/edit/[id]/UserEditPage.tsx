import { useParams } from 'react-router-dom';
import { useEditUser } from '@/modules/user/hooks/useEditUser';
import { UserForm } from '@/modules/user/forms/UserForm';

const UserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { handleSubmit, isPending, data: user } = useEditUser(id);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Edit User</h2>
      <UserForm 
        onSubmit={handleSubmit} 
        isLoading={isPending}
        defaultValues={{
          name: user?.name || '',
          email: user?.email || '',
        }}
      />
    </div>
  );
};

export default UserEditPage;
