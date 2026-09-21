import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Modal } from '@/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { formatDateTime } from '@/utils';
import {
  BUSINESS_DATE_DISPLAY_FORMAT,
  DAY_WORK_PROMPT_DISMISSED_STORAGE_KEY,
} from '../constants';

const DAY_START_PROMPT_STATES = new Set(['READY_TO_START', 'PENDING_BOD']);

const getLocalTodayDateOnly = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatBusinessDate = (value: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  return formatDateTime(value, BUSINESS_DATE_DISPLAY_FORMAT);
};

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

  const workflowState = policyContext?.workflowState ?? '';
  const currentBusinessDate = policyContext?.currentBusinessDate || '';
  const openBusinessDate =
    policyContext?.openBusinessDate || currentBusinessDate;
  const today = getLocalTodayDateOnly();
  const isPreviousDayEodPending =
    workflowState === 'PENDING_EOD' &&
    Boolean(openBusinessDate) &&
    openBusinessDate < today;
  const isDayStartRequired = DAY_START_PROMPT_STATES.has(workflowState);

  const shouldPrompt = Boolean(
    !isLoading &&
    !canBypassPrompt &&
    !isDismissed &&
    (isDayStartRequired || isPreviousDayEodPending) &&
    !location.pathname.includes('/day-end-start-process')
  );

  if (!shouldPrompt) {
    return null;
  }

  const displayDate = formatBusinessDate(openBusinessDate || today);
  const isPendingEod = isPreviousDayEodPending;

  const title = isPendingEod ? 'Pending Day End' : 'Day Start Required';
  const description = isPendingEod
    ? `The previous business date ${displayDate} is still open. You can start a new day or continue for now.`
    : `Please start your working day for ${displayDate} before creating or editing transactions.`;

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
