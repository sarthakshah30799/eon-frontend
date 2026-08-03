import type { ICurrencyTransfer } from '../types';

export const TRANSFER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'HELD', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const canApproveTransfer = (params: {
  user?: {
    isAdmin?: boolean;
    isHo?: boolean;
    isHoStaff?: boolean;
  } | null;
  activeBranchId?: string | null;
  activeCounterId?: string | null;
  transfer?: Pick<
    ICurrencyTransfer,
    'destinationBranchId' | 'destinationCounterId' | 'status'
  > | null;
}) => {
  const { user, activeBranchId, activeCounterId, transfer } = params;
  if (!transfer) {
    return false;
  }

  if (user?.isAdmin || user?.isHo || user?.isHoStaff) {
    return true;
  }

  return Boolean(
    activeBranchId &&
      activeCounterId &&
      transfer.destinationBranchId === activeBranchId &&
      transfer.destinationCounterId === activeCounterId
  );
};

export const getTransferStatusLabel = (status: (typeof TRANSFER_STATUS_OPTIONS)[number]['value']) => {
  const option = TRANSFER_STATUS_OPTIONS.find(item => item.value === status);
  return option?.label ?? status;
};
