import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { menuApi, userRoleApi } from '@/api';
import { useMasterPages } from '@/lib';
import type { MenuRecord } from '@/api/menu/menu.api';
import type { MasterPageTreeNode } from '@/modules/masterPages/types';
import { USER_RIGHTS_PERMISSION_COLUMNS } from '../constants';
import toast from 'react-hot-toast';
import type {
  UserRightsPermissionState,
  UserRightsRowState,
  UserRightsTreeNode,
} from '../types';
import {
  buildDefaultRowState,
  flattenRightsLeafRows,
  filterSelectableRightsTreeNodes,
  findRightsTreeNodeById,
  findRightsTreeNodePathIds,
  flattenRightsLeafRowsFromNode,
  mapMasterPageTreeNodeToRightsTreeNode,
  mapMenuRecordToRightsTreeNode,
} from '../utils';

interface UseUserRightsMatrixResult {
  treeNodes: UserRightsTreeNode[];
  selectableTreeNodes: UserRightsTreeNode[];
  selectedNodeId: string | null;
  selectedNode: UserRightsTreeNode | undefined;
  selectedNodePathIds: string[];
  rows: ReturnType<typeof flattenRightsLeafRows>;
  visibleRows: ReturnType<typeof flattenRightsLeafRows>;
  rowStateById: Record<string, UserRightsRowState>;
  isLoading: boolean;
  error: Error | null;
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
  savePermissions: () => Promise<void>;
  isSaving: boolean;
}

const defaultState = (
  checked: boolean
): UserRightsPermissionState => ({
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

const filterMenuRecord = (menu: MenuRecord): MenuRecord | null => {
  if (isExcludedProfile(menu.name, menu.path ?? undefined)) {
    return null;
  }
  const copy = { ...menu };
  if (copy.children && copy.children.length > 0) {
    copy.children = copy.children
      .map(filterMenuRecord)
      .filter((c): c is MenuRecord => c !== null);
  }
  return copy;
};

export const useUserRightsMatrix = (roleId: string | null): UseUserRightsMatrixResult => {
  const { tree: createdPages } = useMasterPages();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [rowStateOverrides, setRowStateOverrides] = useState<
    Record<string, UserRightsRowState>
  >({});

  const {
    data: menuTree = [],
    isLoading: isLoadingMenu,
    error: menuError,
  } = useQuery({
    queryKey: ['menu-tree'],
    queryFn: async () => {
      const response = await menuApi.getMenuTree();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
  });

  // Query to fetch permissions for the active role from the backend
  const {
    data: activeRolePermissions,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      if (!roleId) return null;
      return await userRoleApi.getRolePermissions(roleId);
    },
    enabled: !!roleId,
  });

  // Set the grid overrides state when new permissions are loaded from the backend
  useEffect(() => {
    if (activeRolePermissions) {
      const nextOverrides: Record<string, UserRightsRowState> = {};
      for (const [menuId, perms] of Object.entries(activeRolePermissions)) {
        const selected = USER_RIGHTS_PERMISSION_COLUMNS.every(
          column => perms[column.key]
        );
        nextOverrides[menuId] = {
          selected,
          permissions: perms as unknown as UserRightsPermissionState,
        };
      }
      setRowStateOverrides(nextOverrides);
    } else {
      setRowStateOverrides({});
    }
  }, [activeRolePermissions]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!roleId) {
        throw new Error('Please select a role first to save permissions.');
      }
      const grid: Record<string, Record<string, boolean>> = {};
      for (const [menuId, state] of Object.entries(rowStateById)) {
        const hasAnyActive = Object.values(state.permissions).some(v => v);
        if (hasAnyActive) {
          grid[menuId] = state.permissions as any;
        }
      }
      await userRoleApi.saveRolePermissions(roleId, grid);
    },
    onSuccess: () => {
      toast.success('Permissions saved successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save permissions');
    },
  });

  const treeNodes = useMemo<UserRightsTreeNode[]>(
    () => {
      const filteredMenus = (menuTree as MenuRecord[])
        .map(filterMenuRecord)
        .filter((m): m is MenuRecord => m !== null);

      const filteredPages = (createdPages as MasterPageTreeNode[])
        .filter(p => !isExcludedProfile(p.pageName, p.slug));

      return [
        ...filteredMenus.map(mapMenuRecordToRightsTreeNode),
        ...filteredPages.map(mapMasterPageTreeNodeToRightsTreeNode),
      ];
    },
    [createdPages, menuTree]
  );

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
        ? findRightsTreeNodePathIds(treeNodes, selectedNode.id) ?? []
        : [],
    [selectedNode, treeNodes]
  );

  const rows = useMemo(() => flattenRightsLeafRows(treeNodes), [treeNodes]);

  const visibleRows = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    const descendantRows = flattenRightsLeafRowsFromNode(
      selectedNode,
      []
    );

    return descendantRows.length > 0 ? descendantRows : [];
  }, [selectedNode]);

  const rowStateById = useMemo(
    () => buildDefaultRowState(rows, rowStateOverrides),
    [rows, rowStateOverrides]
  );

  const currentVisibleRows = useMemo(
    () =>
      visibleRows.map(row => ({
        ...row,
        ...rowStateById[row.id],
      })),
    [rowStateById, visibleRows]
  );

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const toggleRowSelected = (rowId: string, checked: boolean) => {
    setRowStateOverrides(previousState => {
      return {
        ...previousState,
        [rowId]: {
          selected: checked,
          permissions: defaultState(checked),
        },
      };
    });
  };

  const toggleAllRowsSelected = (checked: boolean) => {
    setRowStateOverrides(previousState => {
      const nextState: Record<string, UserRightsRowState> = {
        ...previousState,
      };

      currentVisibleRows.forEach(row => {
        nextState[row.id] = {
          selected: checked,
          permissions: defaultState(checked),
        };
      });

      return nextState;
    });
  };

  const togglePermission = (
    rowId: string,
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => {
    setRowStateOverrides(previousState => {
      const previousRow =
        previousState[rowId] ?? {
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
        [rowId]: {
          selected,
          permissions: nextPermissions,
        },
      };
    });
  };

  const toggleColumnPermission = (
    permission: keyof UserRightsPermissionState,
    checked: boolean
  ) => {
    setRowStateOverrides(previousState => {
      const nextState: Record<string, UserRightsRowState> = {
        ...previousState,
      };

      currentVisibleRows.forEach(row => {
        const previousRow = previousState[row.id];
        const basePermissions =
          previousRow?.permissions ?? defaultState(false);
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

      return nextState;
    });
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync();
  };

  return {
    treeNodes,
    selectableTreeNodes,
    selectedNodeId: selectedNodeIdValue,
    selectedNode,
    selectedNodePathIds,
    rows,
    visibleRows,
    rowStateById,
    isLoading: isLoadingMenu || (!!roleId && isLoadingPermissions),
    error: (menuError || permissionsError) as Error | null,
    selectNode,
    toggleAllRowsSelected,
    toggleRowSelected,
    togglePermission,
    toggleColumnPermission,
    savePermissions: handleSave,
    isSaving: saveMutation.isPending,
  };
};

