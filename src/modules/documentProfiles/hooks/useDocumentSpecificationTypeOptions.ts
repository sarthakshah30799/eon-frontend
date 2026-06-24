import { useQuery } from '@tanstack/react-query';

export enum DocumentSpecificationTypeEnum {
  Master = 'MASTER',
  Transaction = 'TRANSACTION',
}

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
