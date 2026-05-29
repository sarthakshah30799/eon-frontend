import type { MenuRecord } from '@/api/menu/menu.api';
import type { MasterPageTreeNode } from '@/modules/masterPages/types';
import type {
  UserRightsPermissionState,
  UserRightsRow,
  UserRightsRowState,
  UserRightsTreeNode,
} from '../types';

const createEmptyPermissions = (): UserRightsPermissionState => ({
  add: false,
  modify: false,
  delete: false,
  view: false,
  export: false,
  authorized: false,
  rejected: false,
});

export const mapMenuRecordToRightsTreeNode = (
  menu: MenuRecord
): UserRightsTreeNode => ({
  id: menu.id,
  label: menu.name,
  path: menu.path ?? undefined,
  children: (menu.children ?? []).map(mapMenuRecordToRightsTreeNode),
});

export const mapMasterPageTreeNodeToRightsTreeNode = (
  page: MasterPageTreeNode
): UserRightsTreeNode => ({
  id: page.id,
  label: page.pageName,
  path: page.slug,
  children: page.children.map(mapMasterPageTreeNodeToRightsTreeNode),
});

export const flattenRightsLeafRows = (
  nodes: UserRightsTreeNode[],
  trail: string[] = []
): UserRightsRow[] => {
  const rows: UserRightsRow[] = [];

  nodes.forEach(node => {
    const nextTrail = [...trail, node.label];

    if (node.children.length === 0) {
      rows.push({
        id: node.id,
        label: node.label,
        trail: trail.join(' > '),
      });
      return;
    }

    rows.push(...flattenRightsLeafRows(node.children, nextTrail));
  });

  return rows;
};

export const filterSelectableRightsTreeNodes = (
  nodes: UserRightsTreeNode[]
): UserRightsTreeNode[] => {
  return nodes
    .filter(node => node.children.length > 0)
    .map(node => ({
      ...node,
      children: filterSelectableRightsTreeNodes(node.children),
    }));
};

export const findDefaultSelectableRightsNode = (
  nodes: UserRightsTreeNode[]
): UserRightsTreeNode | undefined => {
  for (const node of nodes) {
    const nestedSelectable = node.children.find(
      child => child.children.length > 0
    );

    if (nestedSelectable) {
      return nestedSelectable;
    }

    const deeperSelectable = findDefaultSelectableRightsNode(node.children);

    if (deeperSelectable) {
      return deeperSelectable;
    }

    if (node.children.length > 0) {
      return node;
    }
  }

  return undefined;
};

export const findRightsTreeNodeById = (
  nodes: UserRightsTreeNode[],
  id: string
): UserRightsTreeNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    const nested = findRightsTreeNodeById(node.children, id);
    if (nested) {
      return nested;
    }
  }

  return undefined;
};

export const findRightsTreeNodePathIds = (
  nodes: UserRightsTreeNode[],
  targetId: string,
  trail: string[] = []
): string[] | null => {
  for (const node of nodes) {
    const nextTrail = [...trail, node.id];

    if (node.id === targetId) {
      return nextTrail;
    }

    const nestedTrail = findRightsTreeNodePathIds(
      node.children,
      targetId,
      nextTrail
    );

    if (nestedTrail) {
      return nestedTrail;
    }
  }

  return null;
};

export const flattenRightsLeafRowsFromNode = (
  node: UserRightsTreeNode,
  trail: string[] = []
): UserRightsRow[] => {
  return flattenRightsLeafRows([node], trail);
};

export const buildDefaultRowState = (
  rows: UserRightsRow[],
  previousState: Record<string, UserRightsRowState> = {}
): Record<string, UserRightsRowState> => {
  const nextState: Record<string, UserRightsRowState> = {};

  rows.forEach(row => {
    const existingState = previousState[row.id];
    nextState[row.id] = existingState ?? {
      selected: false,
      permissions: createEmptyPermissions(),
    };
  });

  return nextState;
};

export const createEmptyRights = createEmptyPermissions;
