import type { ICategoryOption } from '@/types/categoryOptionTypes';

export interface IPartyProfileDocumentFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPartyProfileDocumentProfile {
  id: string;
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  specificationType: string;
  type: ICategoryOption | null;
  groupSelection: ICategoryOption | null;
  entitySelection: ICategoryOption | null;
  active: boolean;
  sortOrder: number;
  partyProfileDocumentId?: string | null;
  documentFile?: IPartyProfileDocumentFile | null;
}

export interface IPartyProfileDocumentsResponse {
  partyProfileId: string;
  documentProfiles: IPartyProfileDocumentProfile[];
}

export interface IUploadPartyProfileDocumentPayload {
  partyProfileId: string;
  documentProfileId: string;
  file: File;
}
