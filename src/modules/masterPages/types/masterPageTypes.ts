export interface IMasterPage {
  id: string;
  pageName: string;
  slug: string;
  parentId: string | null;
  createdAt: number;
}

export interface IMasterPageTreeNode extends IMasterPage {
  children: IMasterPageTreeNode[];
}

export interface IMasterPageDraftNode {
  clientId: string;
  pageName: string;
  slug: string;
  parentId: string | null;
  makeChildren: boolean;
  children: IMasterPageDraftNode[];
}

export interface IMasterPagesFormValues {
  pages: IMasterPageDraftNode[];
}

export interface IMasterPageOption {
  value: string;
  label: string;
}
