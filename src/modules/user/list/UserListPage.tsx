import { useListUser } from '../hooks/useListUser';
import { Button } from '../../../components/ui/button1';
import type { User } from '../../../api/user/user.api';

export const UserListPage = () => {
  const { data: users, isLoading, error } = useListUser();

  if (isLoading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error loading users</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {users && users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user: User) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
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
        <div className="text-center py-8 text-gray-500">
          No users found. Create your first user!
        </div>
      )}
    </div>
  );
};
