import { useListUser } from '@/modules/user/hooks/useListUser';
import { UserList } from '@/modules/user/components/UserList';

const UserListPage = () => {
  const { data: users, isLoading, error } = useListUser();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <UserList users={users} isLoading={isLoading} error={error?.message || null} />
    </div>
  );
};

export default UserListPage;
