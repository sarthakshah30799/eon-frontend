import type { AsyncSelectOption, AsyncSelectResponse } from '@/components/ui';
import {
  PAGINATION_DEFAULTS,
  PAGINATION_MAX_LIMIT,
} from '@/constants/paginationConstants';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';

export const normalizePaginatedResponse = <T>(
  payload: Partial<IPaginatedResponse<T>> | null | undefined,
  fallbackLimit?: number,
  fallbackOffset?: number
): IPaginatedResponse<T> => ({
  data: payload?.data ?? [],
  total: payload?.total ?? 0,
  totalPages: payload?.totalPages ?? 0,
  limit: payload?.limit ?? fallbackLimit ?? PAGINATION_DEFAULTS.LIMIT,
  offset: payload?.offset ?? fallbackOffset ?? PAGINATION_DEFAULTS.OFFSET,
  hasMore: payload?.hasMore ?? false,
});

export const toPageQuery = (page: number, limit: number): Required<IOffsetPaginationParams> => ({
  limit,
  offset: pageToOffset(page, limit),
});

export const pageToOffset = (page: number, limit: number) =>
  Math.max(0, (Math.max(page, 1) - 1) * limit);

export const offsetToPage = (offset: number, limit: number) =>
  limit > 0 ? Math.floor(Math.max(offset, 0) / limit) + 1 : 1;

export const toAsyncSelectPage = <T>(
  response: IPaginatedResponse<T>,
  mapOption: (item: T) => AsyncSelectOption
): AsyncSelectResponse => ({
  options: (response.data ?? []).map(mapOption),
  hasMore: Boolean(response.hasMore),
});

export const fetchAllMatching = async <T>(
  fetchPage: (
    pagination: Required<IOffsetPaginationParams>
  ) => Promise<IPaginatedResponse<T>>
): Promise<T[]> => {
  const items: T[] = [];
  let offset = PAGINATION_DEFAULTS.OFFSET;

  while (true) {
    const page = await fetchPage({
      limit: PAGINATION_MAX_LIMIT,
      offset,
    });
    items.push(...(page.data ?? []));
    if (!page.hasMore || (page.data ?? []).length === 0) {
      break;
    }
    offset += page.limit;
    if (offset >= page.total) {
      break;
    }
  }

  return items;
};
