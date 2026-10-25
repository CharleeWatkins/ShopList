// src/types/index.ts

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  passwordHash: string; // Strictly typed to remind us this is a hash
}

// FIX: Using a type alias instead of an empty interface
export type SafeUser = Omit<User, 'passwordHash'>;

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  completed: boolean;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  category: string;
  notes?: string;
  dateAdded: string; 
  sharedWith: string[]; 
  items: ShoppingItem[];
}

// URL Sync Types
export type SortField = 'name' | 'category' | 'dateAdded';
export type SortOrder = 'asc' | 'desc';

export interface ListQueryParams {
  search: string;
  sort: SortField;
  order: SortOrder;
}