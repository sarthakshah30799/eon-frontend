export interface IMenu {
  id: string;
  isAdmin: boolean;
  name: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  children?: IMenu[];
}

export interface ICreateMenu
  extends Omit<
    IMenu,
    'id' | 'path' | 'icon' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'children'
  > {
  isAdmin: boolean;
  path: string;
  icon: string;
  parentId: string | null;
}

export type IUpdateMenu = Partial<ICreateMenu>;
