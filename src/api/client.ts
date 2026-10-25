
import type { User, ShoppingList } from '../types';

const BASE_URL = 'http://localhost:3001';

export class ApiError extends Error {
  // FIX: Declaring the property explicitly instead of using 'public status: number' in constructor
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Network error. Please check your connection or ensure json-server is running.');
  }
}

export const apiClient = {
  // --- USERS ---
  getUserByEmail: async (email: string): Promise<User[]> => {
    return request<User[]>(`/users?email=${encodeURIComponent(email)}`);
  },
  
  createUser: async (userData: User): Promise<User> => {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    return request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // --- LISTS ---
  getListsByUser: async (userId: string): Promise<ShoppingList[]> => {
    return request<ShoppingList[]>(`/lists?userId=${userId}`);
  },

  createList: async (listData: Omit<ShoppingList, 'id'>): Promise<ShoppingList> => {
    return request<ShoppingList>('/lists', {
      method: 'POST',
      body: JSON.stringify(listData),
    });
  },

  updateList: async (id: string, updates: Partial<ShoppingList>): Promise<ShoppingList> => {
    return request<ShoppingList>(`/lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteList: async (id: string): Promise<void> => {
    return request<void>(`/lists/${id}`, { method: 'DELETE' });
  }
};