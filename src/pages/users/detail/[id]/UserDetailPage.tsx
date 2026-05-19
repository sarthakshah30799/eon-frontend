import { useParams } from 'react-router-dom';
import { useGetUser } from '../../../../modules/user/hooks/useGetUser';

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useGetUser(id);

  if (isLoading) {
    return <div className="text-center py-4">Loading user...</div>;
  }

  if (!user) {
    return <div className="text-center py-4">User not found</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">User Details</h2>
      <div className="space-y-4">
        <div>
          <strong>Name:</strong> {user.name}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}
        </div>
        <div>
          <strong>Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
