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
  type: string;
  groupSelection: string | null;
  entitySelection: string | null;
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
