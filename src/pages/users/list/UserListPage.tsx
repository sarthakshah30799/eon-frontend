import { useListUser } from '@/modules/user/hooks/useListUser';
import { UserList } from '@/modules/user/components/UserList';

const UserListPage = () => {
  const { data: users, isLoading, error } = useListUser();

  return (
    <div className="rounded-lg border border-border-primary bg-surface-primary p-6 shadow">
      <UserList
        users={users}
        isLoading={isLoading}
        error={error?.message || null}
      />
    </div>
  );
};

export default UserListPage;
