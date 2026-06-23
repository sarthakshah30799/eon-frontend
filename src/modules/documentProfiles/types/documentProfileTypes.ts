export interface IDocumentProfileRule {
  id?: string;
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  active: boolean;
  sortOrder: number;
  documentProfileId?: string;
}

export interface IDocumentProfile {
  id: string;
  specificationType: string;
  type: string;
  groupSelection?: string | null;
  entitySelection?: string | null;
  profileDescription?: string | null;
  active: boolean;
  sortOrder: number;
  rules: IDocumentProfileRule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateDocumentProfileRule {
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  active: boolean;
  sortOrder: number;
}

export interface ICreateDocumentProfile {
  specificationType: string;
  type: string;
  groupSelection: string;
  entitySelection: string;
  active: boolean;
  sortOrder: number;
  rules: ICreateDocumentProfileRule[];
}

export type IUpdateDocumentProfile = Partial<ICreateDocumentProfile>;

export interface IDocumentProfileListQuery {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface IResolveDocumentProfileRulesQuery {
  groupSelection?: string;
  entitySelection?: string;
}

export type IDocumentProfileFormRuleValues = ICreateDocumentProfileRule;

export type IDocumentProfileFormValues = ICreateDocumentProfile;

export interface IDocumentUploadValue {
  value: string;
  fileName?: string;
  mimeType?: string;
}
