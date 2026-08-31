/**
 * Offset-based pagination contract shared with the backend
 * (`PaginatedResponseDto` / `PaginationQueryDto`).
 */

export interface IOffsetPaginationParams {
  limit?: number;
  offset?: number;
}

export interface IOffsetPaginationMeta {
  total: number;
  totalPages: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface IPaginatedResponse<T> extends IOffsetPaginationMeta {
  data: T[];
}
