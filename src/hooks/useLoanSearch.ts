import { useMemo, useState } from 'react';

export interface SearchableLoan {
  name: string;
  phone: string;
}

export interface UseLoanSearchResult<T> {
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

export function useLoanSearch<T extends SearchableLoan>(items: T[]): UseLoanSearchResult<T> {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    const term = normalize(searchTerm.trim());
    if (!term) return items;

    return items.filter((item) => {
      const name = normalize(item.name);
      const phone = normalize(item.phone);
      return name.includes(term) || phone.includes(term);
    });
  }, [items, searchTerm]);

  return { searchTerm, setSearchTerm, filteredItems };
}