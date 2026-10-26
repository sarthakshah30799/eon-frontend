import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SurfacePanel, Breadcrumb } from '@/components/ui';
import { useCreateAdvanceRefund } from '../hooks';
import { AdvanceRefundForm } from '../forms/AdvanceRefundForm';
import { ADVANCE_REFUND_TEXT } from '../constants';
import type { CreateAdvanceRefundPayload } from '../types';

export const AdvanceRefundCreateView: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAdvanceRefund();

  const handleSubmit = async (payload: CreateAdvanceRefundPayload) => {
    await createMutation.mutateAsync(payload);
    navigate('/advance-refunds');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: ADVANCE_REFUND_TEXT.BREADCRUMB_LIST, href: '/advance-refunds' },
    { label: ADVANCE_REFUND_TEXT.BREADCRUMB_CREATE, active: true },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <SurfacePanel className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {ADVANCE_REFUND_TEXT.CREATE_TITLE}
          </h1>
          <p className="text-sm text-text-secondary">
            Resolve pending customer advances by refunding via bank or knocking off against income.
          </p>
        </div>

        <AdvanceRefundForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          onCancel={() => navigate('/advance-refunds')}
        />
      </SurfacePanel>
    </div>
  );
};
export default AdvanceRefundCreateView;
