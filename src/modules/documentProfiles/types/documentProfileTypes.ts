export interface IDocumentProfile {
  id: string;
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  specificationType: string;
  type: string;
  groupSelection?: string | null;
  entitySelection?: string | null;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateDocumentProfile {
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  specificationType: string;
  type: string;
  groupSelection: string;
  entitySelection: string;
  active: boolean;
  sortOrder: number;
}

export type IUpdateDocumentProfile = Partial<ICreateDocumentProfile>;

export interface IDocumentProfileListQuery {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface IResolveDocumentProfileQuery {
  groupSelection?: string;
  entitySelection?: string;
}

export type IDocumentProfileFormValues = ICreateDocumentProfile;
