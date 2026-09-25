import { useCallback, useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { counterProfileApi, menuApi } from '@/api';
import { useMasterPages } from '@/lib';
import type { IMasterPageTreeNode } from '@/modules/masterPages/types';
import { USER_RIGHTS_PERMISSION_COLUMNS } from '@/modules/userRole/constants';
import type { IMenu } from '@/types/menuTypes';
import type {
  UserRightsPermissionState,
  UserRightsRowState,
  UserRightsTreeNode,
} from '@/modules/userRole/types';
import {
  buildDefaultRowState,
  buildUserRightsPermissionGrid,
  filterSelectableRightsTreeNodes,
  findRightsTreeNodeById,
  findRightsTreeNodePathIds,
  flattenRightsLeafRows,
  flattenRightsLeafRowsFromNode,
  mapMasterPageTreeNodeToRightsTreeNode,
  mapMenuRecordToRightsTreeNode,
} from '@/modules/userRole/utils';

export type CounterPermissionGrid = Record<string, Record<string, boolean>>;

interface UseBranchCounterRightsMatrixResult {
  activeCounterId: string | null;
  counterOptions: Array<{ value: string; label: string }>;
  treeNodes: UserRightsTreeNode[];
  selectableTreeNodes: UserRightsTreeNode[];
  selectedNodeId: string | null;
  selectedNode: UserRightsTreeNode | undefined;
  selectedNodePathIds: string[];
  visibleRows: ReturnType<typeof flattenRightsLeafRows>;
  rowStateById: Record<string, UserRightsRowState>;
  isLoading: boolean;
  error: Error | null;
  selectCounter: (counterId: string) => void;
  selectNode: (nodeId: string) => void;
  toggleAllRowsSelected: (checked: boolean) => void;
  toggleRowSelected: (rowId: string, checked: boolean) => void;
  togglePermission: (
    rowId: string,
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => void;
  toggleColumnPermission: (
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => void;
  buildGridsForSelectedCounters: () => Record<string, CounterPermissionGrid>;
}

const defaultState = (checked: boolean): UserRightsPermissionState => ({
  add: checked,
  modify: checked,
  delete: checked,
  view: checked,
  export: checked,
  authorized: checked,
  rejected: checked,
});

const isExcludedProfile = (name: string, path?: string) => {
  const lowerName = name.toLowerCase();
  const lowerPath = path?.toLowerCase() || '';
  return (
    lowerName.includes('company') ||
    lowerName.includes('branch') ||
    lowerName.includes('counter') ||
    lowerPath.includes('company-profile') ||
    lowerPath.includes('branch-profile') ||
    lowerPath.includes('counter-profile')
  );
};

const isDashboardMenu = (name: string, path?: string) => {
  const lowerName = name.toLowerCase().trim();
  const lowerPath = (path ?? '').toLowerCase().trim();
  return (
    lowerName === 'dashboard' ||
    lowerPath === '/' ||
    lowerPath === '/dashboard'
  );
};

const filterRightsTreeNodes = (
  nodes: UserRightsTreeNode[]
): UserRightsTreeNode[] =>
  nodes
    .filter(node => !isDashboardMenu(node.label, node.path))
    .map(node => ({
      ...node,
      children: filterRightsTreeNodes(node.children),
    }));

export const useBranchCounterRightsMatrix = (
  counterIds: string[]
): UseBranchCounterRightsMatrixResult => {
  const { tree: createdPages } = useMasterPages();
  const [selectedCounterId, setSelectedCounterId] = useState<string | null>(
    null
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [rowStateOverridesByCounter, setRowStateOverridesByCounter] = useState<
    Record<string, Record<string, UserRightsRowState>>
  >({});

  const normalizedCounterIds = useMemo(
    () =>
      Array.from(
        new Set(counterIds.filter((id): id is string => Boolean(id?.trim())))
      ),
    [counterIds]
  );

  const activeCounterId = useMemo(() => {
    if (
      selectedCounterId &&
      normalizedCounterIds.includes(selectedCounterId)
    ) {
      return selectedCounterId;
    }
    return normalizedCounterIds[0] ?? null;
  }, [normalizedCounterIds, selectedCounterId]);

  const activeRowStateOverridesByCounter = useMemo(() => {
    const next: Record<string, Record<string, UserRightsRowState>> = {};
    for (const counterId of normalizedCounterIds) {
      if (rowStateOverridesByCounter[counterId]) {
        next[counterId] = rowStateOverridesByCounter[counterId];
      }
    }
    return next;
  }, [normalizedCounterIds, rowStateOverridesByCounter]);

  const {
    data: menuTree = [],
    isLoading: isLoadingMenu,
    error: menuError,
  } = useQuery({
    queryKey: ['menu-tree-for-rights'],
    queryFn: async () => {
      const response = await menuApi.getRightsTree();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
  });
  const counterDetailQueries = useQueries({
    queries: normalizedCounterIds.map(counterId => ({
      queryKey: ['counter-profile', counterId],
      queryFn: () => counterProfileApi.getCounterProfileById(counterId),
      enabled: Boolean(counterId),
    })),
  });

  const permissionQueries = useQueries({
    queries: normalizedCounterIds.map(counterId => ({
      queryKey: ['counter-permissions', counterId],
      queryFn: () => counterProfileApi.getCounterPermissions(counterId),
      enabled: Boolean(counterId),
    })),
  });

  const counterOptions = useMemo(
    () =>
      normalizedCounterIds.map((counterId, index) => {
        const counter = counterDetailQueries[index]?.data;
        const label = counter
          ? `${counter.counterNo} - ${counter.name}`
          : counterId;
        return { value: counterId, label };
      }),
    [counterDetailQueries, normalizedCounterIds]
  );

  const treeNodes = useMemo<UserRightsTreeNode[]>(() => {
    const filteredPages = (createdPages as IMasterPageTreeNode[]).filter(
      page =>
        !isExcludedProfile(page.pageName, page.slug) &&
        !isDashboardMenu(page.pageName, page.slug)
    );

    return filterRightsTreeNodes([
      ...(menuTree as IMenu[]).map(mapMenuRecordToRightsTreeNode),
      ...filteredPages.map(mapMasterPageTreeNodeToRightsTreeNode),
    ]);
  }, [createdPages, menuTree]);

  const selectableTreeNodes = useMemo(
    () => filterSelectableRightsTreeNodes(treeNodes),
    [treeNodes]
  );

  const defaultSelectedNode = useMemo(() => {
    const firstRootNode = selectableTreeNodes[0];
    if (!firstRootNode) {
      return undefined;
    }
    if (firstRootNode.children.length === 0) {
      return firstRootNode;
    }
    const firstActionableChild = firstRootNode.children.find(
      child => child.children.length > 0
    );
    return firstActionableChild ?? firstRootNode.children[0] ?? firstRootNode;
  }, [selectableTreeNodes]);

  const selectedNode = useMemo(
    () =>
      (selectedNodeId
        ? findRightsTreeNodeById(treeNodes, selectedNodeId)
        : undefined) ??
      (defaultSelectedNode
        ? findRightsTreeNodeById(treeNodes, defaultSelectedNode.id)
        : undefined),
    [defaultSelectedNode, selectedNodeId, treeNodes]
  );

  const selectedNodeIdValue = selectedNode?.id ?? null;

  const selectedNodePathIds = useMemo(
    () =>
      selectedNode
        ? (findRightsTreeNodePathIds(treeNodes, selectedNode.id) ?? [])
        : [],
    [selectedNode, treeNodes]
  );

  const rows = useMemo(() => flattenRightsLeafRows(treeNodes), [treeNodes]);

  const backendRowStateByCounter = useMemo(() => {
    const next: Record<string, Record<string, UserRightsRowState>> = {};

    normalizedCounterIds.forEach((counterId, index) => {
      const permissions = permissionQueries[index]?.data;
      if (!permissions) {
        next[counterId] = {};
        return;
      }

      const overrides: Record<string, UserRightsRowState> = {};
      for (const [menuId, perms] of Object.entries(permissions)) {
        const selected = USER_RIGHTS_PERMISSION_COLUMNS.every(
          column => perms[column.key]
        );
        overrides[menuId] = {
          selected,
          permissions: perms as unknown as UserRightsPermissionState,
        };
      }
      next[counterId] = overrides;
    });

    return next;
  }, [normalizedCounterIds, permissionQueries]);

  const currentCounterKey = activeCounterId ?? '__no_counter__';
  const rowStateOverrides =
    activeRowStateOverridesByCounter[currentCounterKey] ?? {};
  const backendRowStateOverrides =
    (activeCounterId && backendRowStateByCounter[activeCounterId]) || {};

  const visibleRows = useMemo(() => {
    if (!selectedNode) {
      return [];
    }
    return flattenRightsLeafRowsFromNode(selectedNode, []);
  }, [selectedNode]);

  const rowStateById = buildDefaultRowState(rows, {
    ...backendRowStateOverrides,
    ...rowStateOverrides,
  });

  const currentVisibleRows = useMemo(
    () =>
      visibleRows.map(row => ({
        ...row,
        ...rowStateById[row.id],
      })),
    [rowStateById, visibleRows]
  );

  const isLoadingPermissions = permissionQueries.some(
    query => query.isLoading || query.isFetching
  );
  const isLoadingCounters = counterDetailQueries.some(query => query.isLoading);
  const permissionsError = permissionQueries.find(query => query.error)?.error;

  const selectCounter = (counterId: string) => {
    if (normalizedCounterIds.includes(counterId)) {
      setSelectedCounterId(counterId);
    }
  };

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const toggleRowSelected = (rowId: string, checked: boolean) => {
    if (!activeCounterId) return;
    setRowStateOverridesByCounter(previousState => {
      const previousCounterState = previousState[activeCounterId] ?? {};
      return {
        ...previousState,
        [activeCounterId]: {
          ...previousCounterState,
          [rowId]: {
            selected: checked,
            permissions: defaultState(checked),
          },
        },
      };
    });
  };

  const toggleAllRowsSelected = (checked: boolean) => {
    if (!activeCounterId) return;
    setRowStateOverridesByCounter(previousState => {
      const previousCounterState = previousState[activeCounterId] ?? {};
      const nextState: Record<string, UserRightsRowState> = {
        ...previousCounterState,
      };
      currentVisibleRows.forEach(row => {
        nextState[row.id] = {
          selected: checked,
          permissions: defaultState(checked),
        };
      });
      return {
        ...previousState,
        [activeCounterId]: nextState,
      };
    });
  };

  const togglePermission = (
    rowId: string,
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => {
    if (!activeCounterId) return;
    setRowStateOverridesByCounter(previousState => {
      const previousCounterState = previousState[activeCounterId] ?? {};
      const previousRow = previousCounterState[rowId] ?? {
        selected: false,
        permissions: defaultState(false),
      };
      const nextPermissions = {
        ...previousRow.permissions,
        [permission]: checked,
      };
      const selected = USER_RIGHTS_PERMISSION_COLUMNS.every(
        column => nextPermissions[column.key]
      );
      return {
        ...previousState,
        [activeCounterId]: {
          ...previousCounterState,
          [rowId]: {
            selected,
            permissions: nextPermissions,
          },
        },
      };
    });
  };

  const toggleColumnPermission = (
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => {
    if (!activeCounterId) return;
    setRowStateOverridesByCounter(previousState => {
      const previousCounterState = previousState[activeCounterId] ?? {};
      const nextState: Record<string, UserRightsRowState> = {
        ...previousCounterState,
      };
      currentVisibleRows.forEach(row => {
        const previousRow = previousCounterState[row.id];
        const basePermissions = previousRow?.permissions ?? defaultState(false);
        const nextPermissions = {
          ...basePermissions,
          [permission]: checked,
        };
        const selected = USER_RIGHTS_PERMISSION_COLUMNS.every(
          column => nextPermissions[column.key]
        );
        nextState[row.id] = {
          selected,
          permissions: nextPermissions,
        };
      });
      return {
        ...previousState,
        [activeCounterId]: nextState,
      };
    });
  };

  const buildGridsForSelectedCounters = useCallback(() => {
    const grids: Record<string, CounterPermissionGrid> = {};

    for (const counterId of normalizedCounterIds) {
      const mergedRowState = buildDefaultRowState(rows, {
        ...(backendRowStateByCounter[counterId] ?? {}),
        ...(activeRowStateOverridesByCounter[counterId] ?? {}),
      });
      grids[counterId] = buildUserRightsPermissionGrid(mergedRowState);
    }

    return grids;
  }, [
    activeRowStateOverridesByCounter,
    backendRowStateByCounter,
    normalizedCounterIds,
    rows,
  ]);

  return {
    activeCounterId,
    counterOptions,
    treeNodes,
    selectableTreeNodes,
    selectedNodeId: selectedNodeIdValue,
    selectedNode,
    selectedNodePathIds,
    visibleRows,
    rowStateById,
    isLoading: isLoadingMenu || isLoadingPermissions || isLoadingCounters,
    error: (menuError || permissionsError) as Error | null,
    selectCounter,
    selectNode,
    toggleAllRowsSelected,
    toggleRowSelected,
    togglePermission,
    toggleColumnPermission,
    buildGridsForSelectedCounters,
  };
};
