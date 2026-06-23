export interface IDocumentProfileRule {
  id?: string;
  documentCode: string;
  documentDescription: string;
  documentType: string;
  isRequired: boolean;
  maxSizeMb: number;
  profileSelection?: string | null;
  entitySelection?: string | null;
  fieldSelection?: string | null;
  fieldValue?: string | null;
  active: boolean;
  sortOrder: number;
  documentProfileId?: string;
}

export interface IDocumentProfile {
  id: string;
  profileCode: string;
  profileName: string;
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
  documentType: string;
  isRequired: boolean;
  maxSizeMb: number;
  profileSelection?: string | null;
  entitySelection?: string | null;
  fieldSelection?: string | null;
  fieldValue?: string | null;
  active: boolean;
  sortOrder: number;
}

export interface ICreateDocumentProfile {
  profileCode: string;
  profileName: string;
  profileDescription?: string | null;
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
  profileSelection?: string;
  entitySelection?: string;
  fieldSelection?: string;
  fieldValue?: string;
}

export interface IDocumentProfileFormRuleValues extends ICreateDocumentProfileRule {}

export interface IDocumentProfileFormValues extends ICreateDocumentProfile {}

export interface IDocumentUploadValue {
  value: string;
  fileName?: string;
  mimeType?: string;
}

