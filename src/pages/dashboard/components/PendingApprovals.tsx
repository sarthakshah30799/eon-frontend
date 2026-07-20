import { Loader } from '@/components/ui/loader';
import { formatDateTime } from '@/utils';
import type { PendingApproval } from '@/api/dashboard/dashboard.api';

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  loading?: boolean;
  onItemClick: (id: string, type: string) => void;
}

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
        {approvals.slice(0, 5).map((profile) => (
          <div
            key={profile.id}
            className="cursor-pointer rounded-md border border-border-primary p-3 transition-colors hover:bg-surface-secondary"
            onClick={() => onItemClick(profile.id, profile.type)}
          >
            <div className="mb-1 flex items-start justify-between">
              <span className="font-mono text-xs text-primary">{profile.code}</span>
              <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Pending
              </span>
            </div>
            <p className="text-xs font-medium text-text-primary">{profile.name}</p>
            <p className="mt-0.5 text-xs text-text-tertiary">
              {profile.type} · {formatDateTime(profile.createdAt)}
            </p>
          </div>
        ))}
      </div>
    )}
  </section>
);

export default PendingApprovals;
