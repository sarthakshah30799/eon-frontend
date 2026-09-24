import { useEffect, useRef } from 'react';
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
  // Debounce by serialized content, not object identity. Callers often pass a
  // fresh `{ ... }` each render; reference equality would reset the timer forever
  // and leave the loader spinning with no network request.
  const requestKey = request == null ? null : JSON.stringify(request);
  const debouncedRequestKey = useDebounce(
    requestKey,
    TRANSACTION_PREVIEW_DEBOUNCE_MS
  );
  const requestRef = useRef(request);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  const isDebouncing = enabled && requestKey !== debouncedRequestKey;
  const queryEnabled =
    enabled && debouncedRequestKey != null && !isDebouncing;

  const query = useQuery<TData, Error>({
    queryKey: [queryKeyPrefix, debouncedRequestKey],
    queryFn: ({ signal }) => {
      const currentRequest = requestRef.current;
      if (
        currentRequest != null &&
        JSON.stringify(currentRequest) === debouncedRequestKey
      ) {
        return queryFn(currentRequest, signal);
      }

      return queryFn(JSON.parse(debouncedRequestKey as string) as TRequest, signal);
    },
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
