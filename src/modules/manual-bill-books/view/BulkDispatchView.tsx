import { BulkDispatchForm } from '../forms/BulkDispatchForm';

interface BulkDispatchViewProps {
  onSuccess: () => void;
  reassignId?: string;
}

export const BulkDispatchView = ({ onSuccess, reassignId }: BulkDispatchViewProps) => {
  const isReassign = !!reassignId;

  return (
    <div className="rounded-sm border border-border-primary bg-surface-primary p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          {isReassign ? 'Edit & Reassign Dispatch' : 'Create Manual Bill Book'}
        </h1>
        <p className="text-sm text-text-secondary">
          {isReassign
            ? 'Update the assignee and remarks for this rejected dispatch. All other fields are locked.'
            : 'Dispatch new manual bill books to a branch.'}
        </p>
      </div>
      <BulkDispatchForm onSuccess={onSuccess} reassignId={reassignId} />
    </div>
  );
};

export default BulkDispatchView;
