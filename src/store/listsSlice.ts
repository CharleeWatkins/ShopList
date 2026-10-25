// src/store/listsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../api/client';
import type { ShoppingList } from '../types';

interface ListsState {
  lists: ShoppingList[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ListsState = {
  lists: [],
  status: 'idle',
  error: null,
};

// Helper function to safely extract error messages without using 'any'
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
};

// ==========================================
// ASYNC THUNKS
// ==========================================

// READ
export const fetchUserLists = createAsyncThunk(
  'lists/fetchUserLists',
  async (userId: string, { rejectWithValue }) => {
    try {
      const lists = await apiClient.getListsByUser(userId);
      return lists;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch lists'));
    }
  }
);

// CREATE
export const createList = createAsyncThunk(
  'lists/createList',
  async (listData: Omit<ShoppingList, 'id'>, { rejectWithValue }) => {
    try {
      const newList = await apiClient.createList(listData);
      return newList;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create list'));
    }
  }
);

// UPDATE (Added for the Edit Modal)
export const updateList = createAsyncThunk(
  'lists/updateList',
  async (
    { id, updates }: { id: string; updates: Partial<ShoppingList> },
    { rejectWithValue }
  ) => {
    try {
      const updatedList = await apiClient.updateList(id, updates);
      return updatedList;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update list'));
    }
  }
);

// DELETE
export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (listId: string, { rejectWithValue }) => {
    try {
      await apiClient.deleteList(listId);
      return listId;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete list'));
    }
  }
);

// ==========================================
// SLICE
// ==========================================

const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    clearListsState: (state) => {
      state.lists = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- FETCH LISTS ---
      .addCase(fetchUserLists.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserLists.fulfilled, (state, action: PayloadAction<ShoppingList[]>) => {
        state.status = 'succeeded';
        state.lists = action.payload;
      })
      .addCase(fetchUserLists.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // --- CREATE LIST ---
      .addCase(createList.fulfilled, (state, action: PayloadAction<ShoppingList>) => {
        state.lists.push(action.payload);
      })

      // --- UPDATE LIST ---
      .addCase(updateList.fulfilled, (state, action: PayloadAction<ShoppingList>) => {
        const index = state.lists.findIndex((list) => list.id === action.payload.id);
        if (index !== -1) {
          // Replace the old list with the newly updated one from the server
          state.lists[index] = action.payload;
        }
      })

      // --- DELETE LIST ---
      .addCase(deleteList.fulfilled, (state, action: PayloadAction<string>) => {
        state.lists = state.lists.filter((list) => list.id !== action.payload);
      });
  },
});

export const { clearListsState } = listsSlice.actions;
export default listsSlice.reducer;