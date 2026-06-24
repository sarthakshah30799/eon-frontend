import { useQuery } from '@tanstack/react-query';
import { categoryOptionsApi } from '@/api/categoryOptions';
import { CategoryOptionCodeEnum } from '@/types/categoryOptionTypes';

const SPECIFICATION_TYPE_CODES = [
  CategoryOptionCodeEnum.MasterDocument,
  CategoryOptionCodeEnum.TransactionDocument,
] as const;

export const useDocumentSpecificationTypeOptions = () => {
  return useQuery({
    queryKey: ['document-profile-specification-types'],
    queryFn: async () => {
      const results = await Promise.all(
        SPECIFICATION_TYPE_CODES.map(code =>
          categoryOptionsApi.getCategoryOptionsByCode(code)
        )
      );

      return results.flatMap(options => options);
    },
  });
};
