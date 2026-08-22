import { useMemo, useState } from 'react';

export interface UseTextSearchResult<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredItems: T[];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Genérico: recibe una función que extrae los campos buscables de cada item.
export function useTextSearch<T>(items: T[], getSearchableFields: (item: T) => string[]): UseTextSearchResult<T> {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (!term) return items;

    return items.filter((item) =>
      getSearchableFields(item).some((field) => normalize(field).includes(term))
    );
  }, [items, searchTerm, getSearchableFields]);

  return { searchTerm, setSearchTerm, filteredItems };
}