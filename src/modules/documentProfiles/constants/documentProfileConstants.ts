import type { AsyncSelectResponse } from '@/components/ui';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';
import { CATEGORY_OPTION_CODE_OPTIONS } from '@/modules/miscellaneousProfile/constants/miscellaneousProfileConstants';

export const DOCUMENT_PROFILE_TEXTS = {
  LIST_TITLE: 'Document Profiles',
  LIST_SUBTITLE: 'Configure document requirements for profile creation.',
  EMPTY_STATE: 'No document profiles found. Create your first one.',
  LIST_ERROR: 'Error loading document profiles',
  CREATE_SUCCESS: 'Document profile created successfully!',
  UPDATE_SUCCESS: 'Document profile updated successfully!',
  DELETE_SUCCESS: 'Document profile deleted successfully!',
  CREATE_ERROR: 'Failed to create document profile',
  UPDATE_ERROR: 'Failed to update document profile',
  DELETE_ERROR: 'Failed to delete document profile',
  FORM_TITLE: 'Document Profile',
  FORM_SUBTITLE: 'Define profile-, entity-, and field-specific document requirements.',
  SAVE_CHANGES: 'Save Changes',
};

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'ANY', label: 'Any file type' },
  { value: 'PDF', label: 'PDF' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'JPEG', label: 'JPEG' },
  { value: 'PNG', label: 'PNG' },
  { value: 'DOC', label: 'Word document' },
  { value: 'XLS', label: 'Excel spreadsheet' },
];

export const DOCUMENT_PROFILE_SPECIFICATION_TYPE_OPTIONS =
  CATEGORY_OPTION_CODE_OPTIONS.filter(option => option.type === 'DOCUMENT');

export const loadDocumentSpecificationTypeOptions =
  async (): Promise<AsyncSelectResponse> => ({
    options: DOCUMENT_PROFILE_SPECIFICATION_TYPE_OPTIONS,
  });

const SPECIFICATION_TYPE_TO_DOCUMENT_CODE: Record<string, string> = {
  MASTER: CategoryOptionCodeEnum.Master,
  TRANSACTION: CategoryOptionCodeEnum.Transaction,
};

export const loadDocumentProfileTypeOptions = async (
  specificationType: string
): Promise<AsyncSelectResponse> => {
  const documentCode = SPECIFICATION_TYPE_TO_DOCUMENT_CODE[specificationType.trim().toUpperCase()];

  return {
    options: documentCode
      ? DOCUMENT_PROFILE_SPECIFICATION_TYPE_OPTIONS.filter(
          option => option.value === documentCode
        )
      : [],
  };
};

export const DOCUMENT_TYPE_ACCEPT_MAP: Record<string, string> = {
  ANY: '*/*',
  PDF: 'application/pdf',
  IMAGE: 'image/*',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  DOC: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
