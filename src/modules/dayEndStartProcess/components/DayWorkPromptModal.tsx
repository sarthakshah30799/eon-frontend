import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { DAY_WORK_PROMPT_DISMISSED_STORAGE_KEY } from '../constants';

const PROMPT_WORKFLOW_STATES = new Set([
  'READY_TO_START',
  'PENDING_BOD',
  'PENDING_EOD',
]);

export const DayWorkPromptModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, policyContext, user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      window.sessionStorage.getItem(DAY_WORK_PROMPT_DISMISSED_STORAGE_KEY) ===
      '1'
    );
  });

  const canBypassPrompt = Boolean(
    user?.isAdmin || user?.isHo || user?.isHoStaff
  );

  const shouldPrompt = Boolean(
    !isLoading &&
    !canBypassPrompt &&
    !isDismissed &&
    policyContext?.workflowState &&
    PROMPT_WORKFLOW_STATES.has(policyContext.workflowState) &&
    !location.pathname.includes('/day-end-start-process')
  );

  if (!shouldPrompt) {
    return null;
  }

  const workflowState = policyContext?.workflowState ?? '';
  const currentBusinessDate = policyContext?.currentBusinessDate || 'today';
  const openBusinessDate =
    policyContext?.openBusinessDate || currentBusinessDate;
  const isPendingEod = workflowState === 'PENDING_EOD';

  const title = isPendingEod ? 'Pending Day End' : 'Day Start Required';
  const description = isPendingEod
    ? `The previous business date ${openBusinessDate} is still open. You can start a new day or continue for now.`
    : `Please start your working day for ${openBusinessDate} before creating or editing transactions.`;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DAY_WORK_PROMPT_DISMISSED_STORAGE_KEY, '1');
    }
    setIsDismissed(true);
  };

  const handleStartNow = () => {
    handleDismiss();
    navigate('/day-end-start-process', {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <Modal
      open={true}
      onOpenChange={open => {
        if (!open) {
          handleDismiss();
        }
      }}
      title={title}
      description={description}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800">
          You can ignore this for now and continue browsing. If you need to
          punch a transaction, the business date will still follow your current
          workflow rules.
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleDismiss}>
            Ignore
          </Button>
          <Button type="button" onClick={handleStartNow}>
            Start Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DayWorkPromptModal;
