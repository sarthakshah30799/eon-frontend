import { BulkDispatchForm } from '../forms/BulkDispatchForm';

interface BulkDispatchViewProps {
  onSuccess: () => void;
}

export const BulkDispatchView = ({ onSuccess }: BulkDispatchViewProps) => {
  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          Create Manual Bill Book
        </h1>
        <p className="text-sm text-text-secondary">
          Dispatch new manual bill books to a branch.
        </p>
      </div>
      <BulkDispatchForm onSuccess={onSuccess} />
    </div>
  );
};

export default BulkDispatchView;
