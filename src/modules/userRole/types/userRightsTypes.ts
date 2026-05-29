export interface UserRightsPermissionState {
  add: boolean;
  modify: boolean;
  delete: boolean;
  view: boolean;
  export: boolean;
  authorized: boolean;
  rejected: boolean;
}

export interface UserRightsTreeNode {
  id: string;
  label: string;
  path?: string;
  children: UserRightsTreeNode[];
}

export interface UserRightsRow {
  id: string;
  label: string;
  trail: string;
}

export interface UserRightsRowState {
  selected: boolean;
  permissions: UserRightsPermissionState;
}

export interface UserRightsViewState {
  rows: UserRightsRow[];
  rowStateById: Record<string, UserRightsRowState>;
}

