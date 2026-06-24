export interface IPartyProfileDocumentFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPartyProfileDocumentRule {
  id: string;
  documentCode: string;
  documentDescription: string;
  documentType: string[];
  isRequired: boolean;
  maxSizeMb: number;
  active: boolean;
  sortOrder: number;
  partyProfileDocumentId?: string | null;
  documentFile?: IPartyProfileDocumentFile | null;
}

export interface IPartyProfileDocumentProfile {
  id: string;
  specificationType: string;
  type: string;
  groupSelection: string | null;
  entitySelection: string | null;
  profileDescription?: string | null;
  active: boolean;
  sortOrder: number;
  rules: IPartyProfileDocumentRule[];
}

export interface IPartyProfileDocumentsResponse {
  partyProfileId: string;
  documentProfiles: IPartyProfileDocumentProfile[];
}

export interface IUploadPartyProfileDocumentPayload {
  partyProfileId: string;
  documentProfileRuleId: string;
  file: File;
}
