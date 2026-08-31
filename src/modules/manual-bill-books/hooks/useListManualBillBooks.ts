import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { manualBillBookApi } from '@/api';
import type { IManualBillBookListResponse } from '@/api/manual-bill-books/manualBillBook.api';
import type { IOffsetPaginationParams } from '@/types/pagination';
import { PAGINATION_DEFAULTS } from '@/constants/paginationConstants';

export type IManualBillBookListQuery = IOffsetPaginationParams & {
  branchId?: string;
  status?: string;
  transactionType?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  bookNoFrom?: number;
  bookNoTo?: number;
};

type UseListOptions = {
  withRoutePagination?: boolean;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseNonNegativeInt = (value: string | null, fallback: number) => {
  const parsed = parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const useListManualBillBooks = (
  params?: IManualBillBookListQuery,
  options?: UseListOptions
) => {
  const withRoute = options?.withRoutePagination ?? false;
  const [searchParams, setSearchParams] = useSearchParams();

  const limit = withRoute
    ? parsePositiveInt(searchParams.get('limit'), PAGINATION_DEFAULTS.LIMIT)
    : params?.limit;
  const offset = withRoute
    ? parseNonNegativeInt(
        searchParams.get('offset'),
        PAGINATION_DEFAULTS.OFFSET
      )
    : params?.offset;
  const branchId = withRoute
    ? ((searchParams.get('branchId') || undefined) ?? params?.branchId)
    : params?.branchId;
  const status = withRoute
    ? ((searchParams.get('status') || undefined) ?? params?.status)
    : params?.status;
  const search = withRoute
    ? ((searchParams.get('search') || undefined) ?? params?.search)
    : params?.search;
  const page =
    withRoute && limit ? Math.floor((offset as number) / limit) + 1 : 1;

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
    return {
      branchId,
      status,
      transactionType: params?.transactionType,
      search,
      fromDate: params?.fromDate,
      toDate: params?.toDate,
      bookNoFrom: params?.bookNoFrom,
      bookNoTo: params?.bookNoTo,
      limit: withRoute ? (limit as number) : params?.limit,
      offset: withRoute ? (offset as number) : params?.offset,
    };
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

  const setRouteQueryValue = useCallback(
    (key: 'branchId' | 'status' | 'search', value: string) => {
      if (!withRoute) return;
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        next.set('offset', String(PAGINATION_DEFAULTS.OFFSET));
        if (!next.get('limit')) next.set('limit', String(limit));
        return next;
      });
    },
    [withRoute, limit, setSearchParams]
  );

  const handleBranchChange = useCallback(
    (nextBranchId: string) => setRouteQueryValue('branchId', nextBranchId),
    [setRouteQueryValue]
  );

  const handleStatusChange = useCallback(
    (nextStatus: string) => setRouteQueryValue('status', nextStatus),
    [setRouteQueryValue]
  );

  const handleSearchChange = useCallback(
    (nextSearch: string) => setRouteQueryValue('search', nextSearch.trim()),
    [setRouteQueryValue]
  );

  const total = query.data?.total ?? 0;
  const totalPages = query.data?.totalPages ?? 0;

  useEffect(() => {
    if (!withRoute || !query.data || limit == null || offset == null) return;
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
    pagination: withRoute
      ? {
          limit: limit as number,
          offset: offset as number,
          page,
          total,
          totalPages,
          hasMore: query.data?.hasMore ?? page < totalPages,
        }
      : undefined,
    setRoutePagination: withRoute ? setRoutePagination : undefined,
    handlePageChange: withRoute ? handlePageChange : undefined,
    handlePageSizeChange: withRoute ? handlePageSizeChange : undefined,
    handleBranchChange: withRoute ? handleBranchChange : undefined,
    handleStatusChange: withRoute ? handleStatusChange : undefined,
    handleSearchChange: withRoute ? handleSearchChange : undefined,
    limit,
    offset,
    page,
    total,
    totalPages,
    branchId,
    status,
    search,
  };
};
