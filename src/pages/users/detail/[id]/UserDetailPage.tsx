import { useParams } from 'react-router-dom';
import { useGetUser } from '../../../../modules/user/hooks/useGetUser';
import { Loader } from '@/components/ui/loader';
import { formatDateTime } from '@/utils';

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
      <div className="space-y-4 text-text-secondary">
        <div>
          <strong>Name:</strong> {user.name}
        </div>
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>Created:</strong>{' '}
          {formatDateTime(user.createdAt)}
        </div>
        <div>
          <strong>Updated:</strong>{' '}
          {formatDateTime(user.updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
