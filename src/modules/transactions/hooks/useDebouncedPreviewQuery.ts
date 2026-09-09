import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks';

export const TRANSACTION_PREVIEW_DEBOUNCE_MS = 400;

export interface DebouncedPreviewQueryResult<TData> {
  data: TData | undefined;
  /** True only when enabled and there is no cached preview to show yet. */
  isLoading: boolean;
  /** True while the request is debouncing or the query is in flight. */
  isRefreshing: boolean;
}

export const useDebouncedPreviewQuery = <TRequest, TData>(
  queryKeyPrefix: string,
  request: TRequest | null,
  enabled: boolean,
  queryFn: (request: TRequest, signal?: AbortSignal) => Promise<TData>
): DebouncedPreviewQueryResult<TData> => {
  const debouncedRequest = useDebounce(
    request,
    TRANSACTION_PREVIEW_DEBOUNCE_MS
  );
  const isDebouncing = enabled && request !== debouncedRequest;
  const queryEnabled = enabled && debouncedRequest != null && !isDebouncing;

  const query = useQuery<TData, Error>({
    queryKey: [queryKeyPrefix, debouncedRequest],
    queryFn: ({ signal }) => queryFn(debouncedRequest as TRequest, signal),
    enabled: queryEnabled,
    placeholderData: previousData => previousData,
  });

  const data = enabled ? query.data : undefined;
  const isRefreshing =
    enabled &&
    (isDebouncing ||
      (queryEnabled && (query.isFetching || query.isPending)));
  const isLoading = isRefreshing && data === undefined;

  return { data, isLoading, isRefreshing };
};
