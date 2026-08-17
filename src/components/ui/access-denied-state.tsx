import { PAGE_STATUS_TEXTS } from '@/constants';
import { PageStatusState } from './page-status-state';

interface AccessDeniedStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
}

export const AccessDeniedState = ({
  title = PAGE_STATUS_TEXTS.ACCESS_DENIED_TITLE,
  message = PAGE_STATUS_TEXTS.ACCESS_DENIED_MESSAGE,
  actionLabel,
  actionTo,
}: AccessDeniedStateProps) => {
  return (
    <PageStatusState
      title={title}
      message={message}
      actionLabel={actionLabel}
      actionTo={actionTo}
    />
  );
};

export default AccessDeniedState;
