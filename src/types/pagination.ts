/**
 * Common offset-based pagination contracts for BE that returns { data, total, limit, offset, hasMore }.
 * Kept in `src/types` so any module can `extends IPaginatedResponse<T>` and reuse.
 */

export interface IOffsetPaginationParams {
  limit?: number;
  offset?: number;
}

export interface IOffsetPaginationMeta {
  /** Total count from BE (`total` alias kept as `totalItems` for backward compat) */
  total: number;
  /** Alias of `total` – some legacy BEs send `totalItems` */
  totalItems: number;
  totalPages: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface IPaginatedResponse<T> extends IOffsetPaginationMeta {
  data: T[];
}
