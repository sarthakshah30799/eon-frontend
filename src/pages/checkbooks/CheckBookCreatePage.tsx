import { useNavigate } from 'react-router-dom';
import { BulkDispatchForm } from '@/modules/checkbooks/BulkDispatchForm';

const CheckBookCreatePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin/checkbooks');
  };

  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">Create Checkbook</h1>
        <p className="text-sm text-text-secondary">Dispatch new checkbooks to a branch.</p>
      </div>
      <BulkDispatchForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CheckBookCreatePage;
