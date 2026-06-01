import { useParams } from 'react-router-dom';
import { useGetUser } from '../../../../modules/user/hooks/useGetUser';
import { Loader } from '@/components/ui/loader';

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useGetUser(id ?? '');

  if (!id) {
    return (
      <div className="rounded-lg border border-border-primary bg-surface-primary p-6 shadow">
        <p className="text-sm text-text-secondary">User id is missing.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (!user) {
    return (
      <div className="py-4 text-center text-text-secondary">User not found</div>
    );
  }

  return (
    <div className="rounded-lg border border-border-primary bg-surface-primary p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        User Details
      </h2>
      <div className="space-y-4 text-text-secondary">
        <div>
          <strong>Name:</strong> {user.name}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Created:</strong>{' '}
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
        <div>
          <strong>Updated:</strong>{' '}
          {new Date(user.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
