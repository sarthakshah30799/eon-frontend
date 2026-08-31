import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';
import type {
  IOffsetPaginationParams,
  IPaginatedResponse,
} from '@/types/pagination';
import { offsetToPage } from '@/utils/paginatedList';

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseNonNegativeInt = (value: string | null, fallback: number) => {
  const parsed = parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

interface UseOffsetPaginatedListOptions<T, Q extends object> {
  queryKey: unknown[];
  queryFn: (
    params: Q & IOffsetPaginationParams
  ) => Promise<IPaginatedResponse<T>>;
  filters?: Q;
  withRoutePagination?: boolean;
  enabled?: boolean;
}

export const useOffsetPaginatedList = <T, Q extends object = object>({
  queryKey,
  queryFn,
  filters,
  withRoutePagination = true,
  enabled = true,
}: UseOffsetPaginatedListOptions<T, Q>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const withRoute = withRoutePagination;

  const limit = withRoute
    ? parsePositiveInt(searchParams.get('limit'), PAGINATION_DEFAULTS.LIMIT)
    : PAGINATION_DEFAULTS.LIMIT;
  const offset = withRoute
    ? parseNonNegativeInt(
        searchParams.get('offset'),
        PAGINATION_DEFAULTS.OFFSET
      )
    : PAGINATION_DEFAULTS.OFFSET;
  const page = offsetToPage(offset, limit);

  useEffect(() => {
    if (!withRoute) return;
    if (searchParams.has('limit') && searchParams.has('offset')) return;
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (!next.has('limit'))
          next.set('limit', String(PAGINATION_DEFAULTS.LIMIT));
        if (!next.has('offset'))
          next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
        return next;
      },
      { replace: true }
    );
  }, [withRoute, searchParams, setSearchParams]);

  const query = useQuery<IPaginatedResponse<T>>({
    queryKey: [...queryKey, { limit, offset, ...(filters ?? {}) }],
    queryFn: () =>
      queryFn({
        ...(filters as Q),
        limit,
        offset,
      }),
    placeholderData: keepPreviousData,
    enabled,
  });

  const setRoutePagination = useCallback(
    (nextPage: number, nextLimit: number) => {
      if (!withRoute) return;
      const safeLimit =
        Number.isFinite(nextLimit) && nextLimit > 0 ? nextLimit : limit;
      const safePage = Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1;
      const nextOffset = (safePage - 1) * safeLimit;
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('limit', String(safeLimit));
        next.set('offset', String(nextOffset));
        return next;
      });
    },
    [withRoute, limit, setSearchParams]
  );

  const handlePageChange = useCallback(
    (nextPage: number) => setRoutePagination(nextPage, limit),
    [limit, setRoutePagination]
  );

  const handlePageSizeChange = useCallback(
    (nextLimit: number) => setRoutePagination(1, nextLimit),
    [setRoutePagination]
  );

  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 0;

  useEffect(() => {
    if (!withRoute || !query.data) return;
    if (total === 0) {
      if (offset !== PAGINATION_DEFAULTS.OFFSET) {
        setSearchParams(
          prev => {
            const next = new URLSearchParams(prev);
            next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
            return next;
          },
          { replace: true }
        );
      }
      return;
    }
    if (offset >= total) {
      const lastPageStart = Math.floor((total - 1) / limit) * limit;
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev);
          next.set('offset', String(lastPageStart));
          return next;
        },
        { replace: true }
      );
    }
  }, [withRoute, query.data, total, limit, offset, setSearchParams]);

  return {
    ...query,
    rows: query.data?.data ?? [],
    limit,
    offset,
    page,
    total,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
};
