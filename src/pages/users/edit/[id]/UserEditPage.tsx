import { useParams } from 'react-router-dom';
import { useEditUser } from '@/modules/user/hooks/useEditUser';
import { UserForm } from '@/modules/user/forms/UserForm';

const UserEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const { handleSubmit, isPending, data: user } = useEditUser(id ?? '');

  if (!id) {
    return (
      <div className="rounded-lg border border-border-primary bg-surface-primary p-6 shadow">
        <p className="text-sm text-text-secondary">User id is missing.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-primary bg-surface-primary p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        Edit User
      </h2>
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
