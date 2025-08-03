export interface Pageable<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
