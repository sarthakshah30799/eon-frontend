import { useListUser } from '../hooks/useListUser';
import { Button } from '../../../components/ui/button1';
import type { User } from '../../../api/user/user.api';
import { Loader } from '@/components/ui/loader';

export const UserListPage = () => {
  const { data: users, isLoading, error } = useListUser();

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-error-600">Error loading users</div>
    );
  }

  return (
    <div className="rounded-lg bg-surface-primary p-6 shadow">
      {users && users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user: User) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded border border-border-primary p-3"
            >
              <div>
                <h3 className="font-medium text-text-primary">{user.name}</h3>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-text-tertiary">
          No users found. Create your first user!
        </div>
      )}
    </div>
  );
};
