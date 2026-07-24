import { Loader } from '@/components/ui/loader';
import { formatDateTime } from '@/utils';
import type { PendingApproval } from '@/api/dashboard/dashboard.api';

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  loading?: boolean;
  onItemClick: (item: PendingApproval) => void;
}

const entityLabels: Record<string, string> = {
  'party-profile': 'Party Profile',
  transaction: 'Transaction',
  chequebook: 'Cheque Book',
  'manual-book': 'Manual Bill',
};

const PendingApprovals = ({ approvals, loading = false, onItemClick }: PendingApprovalsProps) => (
  <section className="rounded-lg border border-border-primary bg-surface-primary p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-text-primary">Pending Approvals</h2>
      <span className="font-mono text-xs font-semibold text-amber-600">
        {approvals.length} items
      </span>
    </div>
    {loading ? (
      <Loader variant="inline" size="sm" />
    ) : approvals.length === 0 ? (
      <div className="py-6 text-center text-xs text-text-tertiary">No pending approvals</div>
    ) : (
      <div className="max-h-[280px] space-y-2.5 overflow-y-auto">
        {approvals.slice(0, 5).map((item) => (
          <div
            key={`${item.entityType}-${item.id}`}
            className="cursor-pointer rounded-md border border-border-primary p-3 transition-colors hover:bg-surface-secondary"
            onClick={() => onItemClick(item)}
          >
            <div className="mb-1 flex items-start justify-between">
              <span className="font-mono text-xs text-primary">{item.code}</span>
              <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Pending
              </span>
            </div>
            <p className="text-xs font-medium text-text-primary">{item.name || entityLabels[item.entityType] || item.entityType}</p>
            <p className="mt-0.5 text-xs text-text-tertiary">
              {entityLabels[item.entityType] || item.entityType}
              {item.subType ? ` · ${item.subType}` : ''}
              {' · '}
              {formatDateTime(item.createdAt)}
            </p>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default PendingApprovals;
