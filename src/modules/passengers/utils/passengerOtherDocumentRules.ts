import { PassengerOtherIdProofTypeEnum, type PassengerOtherIdProofType } from '../types/passengerTypes';

const normalizeDocumentType = (documentType?: string | null) =>
  String(documentType ?? '').trim().toUpperCase();

export const shouldShowPassengerOtherDocumentValidityFields = (
  documentType?: string | null
) => normalizeDocumentType(documentType) === PassengerOtherIdProofTypeEnum.DRIVING_LICENSE;

export const isPassengerOtherDocumentFilled = (
  row:
    | Partial<{
        documentType: string;
        documentNumber: string;
        validTill: string;
        issueAt: string;
        issueDate: string;
        expiryDate: string;
        documentFile: string;
      }>
    | null
    | undefined
) => {
  const documentType = normalizeDocumentType(row?.documentType);
  const documentNumber = String(row?.documentNumber ?? '').trim();

  if (!documentType || !documentNumber) {
    return false;
  }

  if (documentType === PassengerOtherIdProofTypeEnum.DRIVING_LICENSE) {
    return Boolean(String(row?.validTill ?? '').trim());
  }

  return true;
};

export const isPassengerOtherDocumentComplete = (
  row:
    | Partial<{
        documentType: string;
        documentNumber: string;
        validTill: string;
        issueAt: string;
        issueDate: string;
        expiryDate: string;
        documentFile: string;
      }>
    | null
    | undefined
) => isPassengerOtherDocumentFilled(row);

export const shouldClearPassengerOtherDocumentValidityFields = (
  documentType?: string | null
) => !shouldShowPassengerOtherDocumentValidityFields(documentType);

export const mapPassengerOtherDocumentType = (
  documentType?: string | null
): PassengerOtherIdProofType | '' => {
  const normalizedDocumentType = normalizeDocumentType(documentType);

  return Object.values(PassengerOtherIdProofTypeEnum).includes(
    normalizedDocumentType as PassengerOtherIdProofType
  )
    ? (normalizedDocumentType as PassengerOtherIdProofType)
    : '';
};
