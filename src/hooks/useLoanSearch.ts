import { useTextSearch, type UseTextSearchResult } from './useTextSearch';

export interface SearchableLoan {
  name: string;
  phone: string;
}

export type UseLoanSearchResult<T> = UseTextSearchResult<T>;

export function useLoanSearch<T extends SearchableLoan>(items: T[]): UseLoanSearchResult<T> {
  return useTextSearch(items, (item) => [item.name, item.phone]);
}