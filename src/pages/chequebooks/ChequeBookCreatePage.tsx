import { useNavigate } from 'react-router-dom';
import { BulkDispatchForm } from '@/modules/chequebooks/BulkDispatchForm';

const ChequeBookCreatePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin/chequebooks');
  };

  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">Create ChequeBook</h1>
        <p className="text-sm text-text-secondary">Dispatch new chequebooks to a branch.</p>
      </div>
      <BulkDispatchForm onSuccess={handleSuccess} />
    </div>
  );
};

export default ChequeBookCreatePage;
