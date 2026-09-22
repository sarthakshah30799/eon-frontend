import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from '@/components/ui';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/lib/AuthContext';
import { formatDateTime } from '@/utils';
import { BUSINESS_DATE_DISPLAY_FORMAT } from '../constants';

interface DayStartEntryGuardProps {
  children: ReactNode;
}

const BLOCKED_WORKFLOW_STATES = new Set(['READY_TO_START', 'PENDING_BOD']);

const formatBusinessDate = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  return formatDateTime(value, BUSINESS_DATE_DISPLAY_FORMAT);
};

export const DayStartEntryGuard = ({ children }: DayStartEntryGuardProps) => {
  const navigate = useNavigate();
  const { isLoading, policyContext, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const canBypassDayStart = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );
  if (canBypassDayStart) {
    return <>{children}</>;
  }

  const requiresDayStart = Boolean(
    policyContext?.workflowState &&
    BLOCKED_WORKFLOW_STATES.has(policyContext.workflowState)
  );

  if (!requiresDayStart) {
    return <>{children}</>;
  }

  const currentBusinessDate = policyContext?.currentBusinessDate || '';
  const openBusinessDate =
    policyContext?.openBusinessDate || currentBusinessDate;
  const displayDate = openBusinessDate
    ? formatBusinessDate(openBusinessDate)
    : 'today';

  return (
    <Modal
      open
      onOpenChange={open => {
        if (!open) {
          navigate(-1);
        }
      }}
      title="Day Start Required"
      description={`Please start your working day for ${displayDate} before creating or editing transactions.`}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">
          You can still view lists and details, but transaction punching is
          blocked until the day is started.
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button
            type="button"
            onClick={() => navigate('/day-end-start-process')}
          >
            Go to Day Start
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DayStartEntryGuard;
