import { useNavigate } from 'react-router-dom';
import { Button } from './button1';
import { PAGE_STATUS_TEXTS } from '@/constants';

export interface PageStatusStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

export const PageStatusState = ({
  title,
  message,
  actionLabel = PAGE_STATUS_TEXTS.GO_HOME,
  actionTo = '/',
}: PageStatusStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      <div className="mt-4">
        <Button type="button" onClick={() => navigate(actionTo)}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};

export default PageStatusState;
