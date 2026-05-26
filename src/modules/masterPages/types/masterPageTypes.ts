export interface MasterPageRecord {
  id: string;
  pageName: string;
  slug: string;
  parentId: string | null;
  createdAt: number;
}

export interface MasterPageTreeNode extends MasterPageRecord {
  children: MasterPageTreeNode[];
}

export interface MasterPageDraftNode {
  clientId: string;
  pageName: string;
  slug: string;
  parentId: string | null;
  makeChildren: boolean;
  children: MasterPageDraftNode[];
}

export interface MasterPagesFormValues {
  pages: MasterPageDraftNode[];
}

export interface MasterPageOption {
  value: string;
  label: string;
}
