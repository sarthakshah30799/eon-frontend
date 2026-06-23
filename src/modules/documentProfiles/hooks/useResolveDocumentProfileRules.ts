import { useQuery } from '@tanstack/react-query';
import { documentProfileApi } from '@/api/documentProfile';
import type { IResolveDocumentProfileRulesQuery } from '../types';

const hasValue = (value?: string) => Boolean(value && value.trim().length > 0);

export const useResolveDocumentProfileRules = (
  query: IResolveDocumentProfileRulesQuery
) => {
  return useQuery({
    queryKey: ['document-profile-rules', query],
    queryFn: () => documentProfileApi.resolveDocumentProfileRules(query),
    enabled:
      hasValue(query.profileSelection) ||
      hasValue(query.entitySelection) ||
      hasValue(query.fieldSelection) ||
      hasValue(query.fieldValue),
  });
};

