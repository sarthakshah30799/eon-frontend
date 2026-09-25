import { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { counterProfileApi } from '@/api/counterProfile';
import { toast } from 'react-hot-toast';
import { BRANCH_PROFILE_TEXTS } from '../constants';
import type { BranchCounterRightsApi } from '../types/branchCounterRightsTypes';

export const useSaveBranchCounterPermissions = () => {
  const queryClient = useQueryClient();
  const counterRightsApiRef = useRef<BranchCounterRightsApi | null>(null);

  const saveCounterPermissionsForSelected = async () => {
    const api = counterRightsApiRef.current;
    if (!api) {
      return;
    }

    const grids = api.buildGridsForSelectedCounters();
    const entries = Object.entries(grids);

    try {
      for (const [counterId, grid] of entries) {
        await counterProfileApi.saveCounterPermissions(counterId, grid);
        await queryClient.invalidateQueries({
          queryKey: ['counter-permissions', counterId],
        });
      }
      if (entries.length > 0) {
        toast.success(BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SAVE_SUCCESS);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : BRANCH_PROFILE_TEXTS.COUNTER_RIGHTS_SAVE_ERROR;
      toast.error(message);
      throw error;
    }
  };

  return {
    counterRightsApiRef,
    saveCounterPermissionsForSelected,
  };
};
