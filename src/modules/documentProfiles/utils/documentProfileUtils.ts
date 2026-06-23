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
  documentType: 'ANY',
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
    profileCode: '',
    profileName: '',
    profileDescription: '',
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
  documentType: rule.documentType.trim().toUpperCase(),
  profileSelection: rule.profileSelection?.trim() || '',
  entitySelection: rule.entitySelection?.trim() || '',
  fieldSelection: rule.fieldSelection?.trim() || '',
  fieldValue: rule.fieldValue?.trim() || '',
});

export const normalizeDocumentProfileValues = (
  values: IDocumentProfileFormValues
): IDocumentProfileFormValues => ({
  ...values,
  profileCode: values.profileCode.trim().toUpperCase(),
  profileName: values.profileName.trim(),
  profileDescription: values.profileDescription?.trim() || '',
  rules: values.rules.map(normalizeDocumentProfileRule),
});

export const loadDocumentTypeOptions = async () => ({
  options: DOCUMENT_TYPE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
  })),
});

export const documentTypeToAccept = (documentType: string) =>
  DOCUMENT_TYPE_ACCEPT_MAP[documentType.trim().toUpperCase()] ??
  DOCUMENT_TYPE_ACCEPT_MAP.ANY;

export const getDocumentTypeLabel = (documentType: string) =>
  DOCUMENT_TYPE_OPTIONS.find(option => option.value === documentType)
    ?.label ?? documentType;

export const isDocumentTypeImage = (documentType: string) =>
  ['ANY', 'IMAGE', 'JPEG', 'PNG'].includes(documentType.trim().toUpperCase());

export const getDocumentTypeOptionItems = () =>
  DOCUMENT_TYPE_OPTIONS.map(option => ({
    value: option.value,
    label: option.label,
  }));

export const isFileTypeAllowed = (file: File, documentType: string) => {
  const normalizedType = documentType.trim().toUpperCase();

  if (normalizedType === 'ANY') {
    return true;
  }

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

  return true;
};
