import {
  DOCUMENT_TYPE_ACCEPT_MAP,
  DOCUMENT_TYPE_OPTIONS,
} from '../constants/documentProfileConstants';
import type {
  IDocumentProfileFormValues,
  IDocumentProfileRule,
} from '../types';

export const createEmptyDocumentProfileRule = (): IDocumentProfileRule => ({
  documentCode: '',
  documentDescription: '',
  documentType: ['PNG'],
  isRequired: false,
  maxSizeMb: 5,
  profileSelection: '',
  entitySelection: '',
  fieldSelection: '',
  fieldValue: '',
  active: true,
  sortOrder: 0,
});

export const createEmptyDocumentProfileFormValues =
  (): IDocumentProfileFormValues => ({
    specificationType: '',
    transactionType: '',
    active: true,
    sortOrder: 0,
    rules: [createEmptyDocumentProfileRule()],
  });

export const normalizeDocumentProfileRule = (
  rule: IDocumentProfileRule
): IDocumentProfileRule => ({
  ...rule,
  documentCode: rule.documentCode.trim().toUpperCase(),
  documentDescription: rule.documentDescription.trim(),
  documentType: Array.from(
    new Set(
      (Array.isArray(rule.documentType) ? rule.documentType : [rule.documentType])
        .map(type => type.trim().toUpperCase())
        .filter(Boolean)
    )
  ),
  profileSelection: rule.profileSelection?.trim() || '',
  entitySelection: rule.entitySelection?.trim() || '',
  fieldSelection: rule.fieldSelection?.trim() || '',
  fieldValue: rule.fieldValue?.trim() || '',
});

export const normalizeDocumentProfileValues = (
  values: IDocumentProfileFormValues
): IDocumentProfileFormValues => ({
  ...values,
  specificationType: values.specificationType.trim(),
  transactionType: values.transactionType.trim(),
  rules: values.rules.map(normalizeDocumentProfileRule),
});

export const loadDocumentTypeOptions = async () => ({
  options: DOCUMENT_TYPE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
  })),
});

export const documentTypeToAccept = (documentType: string | string[]) => {
  const normalizedTypes = Array.isArray(documentType)
    ? documentType
    : [documentType];

  if (normalizedTypes.some(type => type.trim().toUpperCase() === 'ANY')) {
    return DOCUMENT_TYPE_ACCEPT_MAP.ANY;
  }

  return Array.from(
    new Set(
      normalizedTypes.map(type => DOCUMENT_TYPE_ACCEPT_MAP[type.trim().toUpperCase()] ?? '')
    )
  )
    .filter(Boolean)
    .join(',');
};

export const getDocumentTypeLabel = (documentType: string | string[]) => {
  const normalizedTypes = Array.isArray(documentType)
    ? documentType
    : [documentType];

  if (normalizedTypes.length === 0) {
    return 'Document type';
  }

  return normalizedTypes
    .map(type => DOCUMENT_TYPE_OPTIONS.find(option => option.value === type)?.label ?? type)
    .join(', ');
};

export const isDocumentTypeImage = (documentType: string | string[]) => {
  const normalizedTypes = Array.isArray(documentType)
    ? documentType
    : [documentType];

  return normalizedTypes.some(type =>
    ['ANY', 'IMAGE', 'JPEG', 'PNG'].includes(type.trim().toUpperCase())
  );
};

export const getDocumentTypeOptionItems = () =>
  DOCUMENT_TYPE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
  }));

export const isFileTypeAllowed = (file: File, documentType: string | string[]) => {
  const normalizedTypes = Array.isArray(documentType)
    ? documentType
    : [documentType];

  if (normalizedTypes.some(type => type.trim().toUpperCase() === 'ANY')) {
    return true;
  }

  return normalizedTypes.some(type => {
    const normalizedType = type.trim().toUpperCase();

    if (normalizedType === 'PDF') {
      return file.type === 'application/pdf';
    }

    if (normalizedType === 'IMAGE') {
      return file.type.startsWith('image/');
    }

    if (normalizedType === 'JPEG') {
      return file.type === 'image/jpeg';
    }

    if (normalizedType === 'PNG') {
      return file.type === 'image/png';
    }

    if (normalizedType === 'DOC') {
      return [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(file.type);
    }

    if (normalizedType === 'XLS') {
      return [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ].includes(file.type);
    }

    return false;
  });
};
