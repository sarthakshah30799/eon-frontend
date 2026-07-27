import { useMemo } from 'react';
import { Loader } from '@/components/ui/loader';
import { BranchUserAccessRulesManager } from '../components';
import {
  useCreateBackdateWindows,
  useListBackdateWindows,
  useRevokeBackdateWindow,
} from '../hooks';

export const MonthwiseLockingView = () => {
  const { data: windows = [], isLoading } = useListBackdateWindows();
  const { submitBackdateWindows, isPending: isCreating } = useCreateBackdateWindows();
  const { revokeBackdateWindow, isPending: isRevoking } = useRevokeBackdateWindow();

  const rows = useMemo(
    () =>
      windows
        .filter(window => window.isActive)
        .map(window => ({
          ...window,
          branchName: window.branchName ?? window.branchId,
          userName: window.userName ?? window.userId,
        })),
    [windows]
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <section className="space-y-6">
      <BranchUserAccessRulesManager
        title="Monthwise Locking"
        description="Allow specific branch and user combinations to punch back-date transactions within a controlled date range."
        rules={rows}
        loading={isLoading}
        isSubmitting={isCreating || isRevoking}
        showDateRange
        onCreateRules={submitBackdateWindows}
        onRevokeRule={revokeBackdateWindow}
        emptyMessage="No monthwise lock windows found."
      />
    </section>
  );
};

export default MonthwiseLockingView;
