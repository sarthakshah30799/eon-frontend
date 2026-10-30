import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SurfacePanel, Breadcrumb } from '@/components/ui';
import { useCreateAdvanceAdjustment } from '../hooks';
import { AdvanceAdjustmentForm } from '../forms/AdvanceAdjustmentForm';
import { ADVANCE_ADJUSTMENT_TEXT } from '../constants';
import type { CreateAdvanceAdjustmentPayload } from '../types';

export const AdvanceAdjustmentCreateView: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAdvanceAdjustment();

  const handleSubmit = async (payload: CreateAdvanceAdjustmentPayload) => {
    await createMutation.mutateAsync(payload);
    navigate('/advance-adjustments');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    {
      label: ADVANCE_ADJUSTMENT_TEXT.BREADCRUMB_LIST,
      href: '/advance-adjustments',
    },
    { label: ADVANCE_ADJUSTMENT_TEXT.BREADCRUMB_CREATE, active: true },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <SurfacePanel className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">
            {ADVANCE_ADJUSTMENT_TEXT.CREATE_TITLE}
          </h1>
          <p className="text-sm text-text-secondary">
            Apply adjustment amounts against outstanding sale bills for a party.
          </p>
        </div>

        <AdvanceAdjustmentForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          onCancel={() => navigate('/advance-adjustments')}
        />
      </SurfacePanel>
    </div>
  );
};

export default AdvanceAdjustmentCreateView;
