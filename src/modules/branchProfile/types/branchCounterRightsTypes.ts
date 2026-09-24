import type { CounterPermissionGrid } from '../hooks/useBranchCounterRightsMatrix';

export type BranchCounterRightsApi = {
  buildGridsForSelectedCounters: () => Record<string, CounterPermissionGrid>;
  isLoading: boolean;
};
