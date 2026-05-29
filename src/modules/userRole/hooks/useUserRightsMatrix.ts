import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/api';
import { useMasterPages } from '@/lib';
import type { MenuRecord } from '@/api/menu/menu.api';
import type { MasterPageTreeNode } from '@/modules/masterPages/types';
import { USER_RIGHTS_PERMISSION_COLUMNS } from '../constants';
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

export const useUserRightsMatrix = (): UseUserRightsMatrixResult => {
  const { tree: createdPages } = useMasterPages();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [rowStateOverrides, setRowStateOverrides] = useState<
    Record<string, UserRightsRowState>
  >({});

  const {
    data: menuTree = [],
    isLoading,
    error,
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

  const treeNodes = useMemo<UserRightsTreeNode[]>(
    () => [
      ...(menuTree as MenuRecord[]).map(mapMenuRecordToRightsTreeNode),
      ...(createdPages as MasterPageTreeNode[]).map(
        mapMasterPageTreeNodeToRightsTreeNode
      ),
    ],
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

  return {
    treeNodes,
    selectableTreeNodes,
    selectedNodeId: selectedNodeIdValue,
    selectedNode,
    selectedNodePathIds,
    rows,
    visibleRows,
    rowStateById,
    isLoading,
    error: error instanceof Error ? error : null,
    selectNode,
    toggleAllRowsSelected,
    toggleRowSelected,
    togglePermission,
    toggleColumnPermission,
  };
};
