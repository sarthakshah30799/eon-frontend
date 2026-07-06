import type { ICategoryOption } from '@/types/categoryOptionTypes';

export interface IDocumentProfileFile {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDocumentProfile {
  id: string;
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  specificationType: string;
  type: ICategoryOption | null;
  groupSelection?: ICategoryOption | null;
  entitySelection?: ICategoryOption | null;
  financialYearSelection?: ICategoryOption | null;
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
  financialYearSelection?: string | null;
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
  specificationType?: string;
  type?: string;
  groupSelection?: string;
  entitySelection?: string;
}

export type IDocumentProfileFormValues = ICreateDocumentProfile;
