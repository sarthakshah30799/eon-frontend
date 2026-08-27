import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { manualBillBookApi } from '@/api';
import type { IManualBillBookListResponse } from '@/api/manual-bill-books/manualBillBook.api';
import type { IOffsetPaginationParams } from '@/types/pagination';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';

// Re-export API query type for convenience (now extends common pagination)
export type IManualBillBookListQuery = IOffsetPaginationParams & {
  branchId?: string;
  status?: string;
  transactionType?: string;
};

type UseListOptions = {
  /** When true, pagination is driven by route ?limit=&offset= (reusable) */
  withRoutePagination?: boolean;
};

export const useListManualBillBooks = (
  params?: IManualBillBookListQuery,
  options?: UseListOptions
) => {
  const withRoute = options?.withRoutePagination ?? false;
  const [searchParams, setSearchParams] = useSearchParams();

  // Route-driven pagination (limit/offset) – defaults from constants
  const rawLimit = withRoute ? searchParams.get('limit') : null;
  const rawOffset = withRoute ? searchParams.get('offset') : null;
  const routeLimit = (() => {
    if (!withRoute) return params?.limit;
    const parsed = parseInt(rawLimit ?? String(PAGINATION_DEFAULTS.LIMIT), 10);
    return Number.isFinite(parsed) && parsed > 0
      ? parsed
      : PAGINATION_DEFAULTS.LIMIT;
  })();
  const routeOffset = (() => {
    if (!withRoute) return params?.offset;
    const parsed = parseInt(
      rawOffset ?? String(PAGINATION_DEFAULTS.OFFSET),
      10
    );
    return Number.isFinite(parsed) && parsed >= 0
      ? parsed
      : PAGINATION_DEFAULTS.OFFSET;
  })();

  const limit = withRoute ? (routeLimit as number) : params?.limit;
  const offset = withRoute ? (routeOffset as number) : params?.offset;
  const page =
    withRoute && limit ? Math.floor((offset as number) / limit) + 1 : 1;

  // Ensure route always contains defaults when pagination is enabled
  useEffect(() => {
    if (!withRoute) return;
    const hasLimit = searchParams.has('limit');
    const hasOffset = searchParams.has('offset');
    if (!hasLimit || !hasOffset) {
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
    }
  }, [withRoute, searchParams, setSearchParams]);

  const queryParams: IManualBillBookListQuery | undefined = (() => {
    if (!params && !withRoute) return undefined;
    if (withRoute) {
      // merge filters with route pagination
      return {
        branchId: params?.branchId,
        status: params?.status,
        transactionType: params?.transactionType,
        limit: limit as number,
        offset: offset as number,
      };
    }
    return params;
  })();

  const query = useQuery<IManualBillBookListResponse>({
    queryKey: ['manual-bill-books', queryParams],
    queryFn: async () => {
      return manualBillBookApi.findAll(queryParams);
    },
    placeholderData: keepPreviousData,
  });

  const setRoutePagination = useCallback(
    (nextPage: number, nextLimit: number) => {
      if (!withRoute) return;
      const safeLimit =
        Number.isFinite(nextLimit) && nextLimit > 0
          ? nextLimit
          : (limit as number);
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
    (nextPage: number) => setRoutePagination(nextPage, limit as number),
    [limit, setRoutePagination]
  );

  const handlePageSizeChange = useCallback(
    (nextLimit: number) => setRoutePagination(1, nextLimit),
    [setRoutePagination]
  );

  const resetOffsetInRoute = useCallback(() => {
    if (!withRoute) return;
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
      if (!next.get('limit')) next.set('limit', String(limit));
      return next;
    });
  }, [withRoute, limit, setSearchParams]);

  const totalItems = query.data?.total ?? query.data?.totalItems ?? 0;
  const totalPages =
    query.data?.totalPages ??
    (limit ? Math.ceil(totalItems / (limit as number)) : 0);

  return {
    ...query,
    // pagination state derived from route (or params when not using route)
    pagination: withRoute
      ? {
          limit: limit as number,
          offset: offset as number,
          page,
          totalItems,
          totalPages,
          hasMore: query.data?.hasMore ?? page < totalPages,
        }
      : undefined,
    // helpers reusable wherever list is fetched
    setRoutePagination: withRoute ? setRoutePagination : undefined,
    handlePageChange: withRoute ? handlePageChange : undefined,
    handlePageSizeChange: withRoute ? handlePageSizeChange : undefined,
    resetOffsetInRoute: withRoute ? resetOffsetInRoute : undefined,
    // also expose raw limit/offset/page for convenience
    limit,
    offset,
    page,
    totalItems,
    totalPages,
  };
};
