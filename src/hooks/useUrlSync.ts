// src/hooks/useUrlSync.ts
import { useSearchParams } from 'react-router-dom';
import type { ListQueryParams, SortField, SortOrder } from '../types';

export const useUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current values from URL with fallbacks
  const search = searchParams.get('search') || '';
  const sort = (searchParams.get('sort') as SortField) || 'dateAdded';
  const order = (searchParams.get('order') as SortOrder) || 'desc';

  const updateUrl = (newParams: Partial<ListQueryParams>) => {
    const params = new URLSearchParams(searchParams);
    
    // Only set values if they exist, otherwise remove them to keep URL clean
    if (newParams.search !== undefined) {
      if (newParams.search) params.set('search', newParams.search);
      else params.delete('search');
    }
    if (newParams.sort !== undefined) params.set('sort', newParams.sort);
    if (newParams.order !== undefined) params.set('order', newParams.order);

    setSearchParams(params, { replace: true });
  };

  return {
    search,
    sort,
    order,
    updateUrl
  };
};