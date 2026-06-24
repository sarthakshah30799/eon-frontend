import { useQuery } from '@tanstack/react-query';

export const DocumentSpecificationTypeEnum = {
  Master: 'MASTER',
  Transaction: 'TRANSACTION',
} as const;

export type DocumentSpecificationTypeEnum = typeof DocumentSpecificationTypeEnum[keyof typeof DocumentSpecificationTypeEnum];

const SPECIFICATION_TYPE_OPTIONS = [
  { value: DocumentSpecificationTypeEnum.Master, label: 'Master' },
  { value: DocumentSpecificationTypeEnum.Transaction, label: 'Transaction' },
] as const;

export const useDocumentSpecificationTypeOptions = () => {
  return useQuery({
    queryKey: ['document-profile-specification-types'],
    queryFn: async () => Promise.resolve(SPECIFICATION_TYPE_OPTIONS),
  });
};
