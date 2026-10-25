// src/store/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit'; // FIX: Type-only import
import type { SafeUser } from '../types';

interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const loadState = (): AuthState => {
  try {
    const serializedState = localStorage.getItem('shoplist_auth');
    if (serializedState) {
      return JSON.parse(serializedState);
    }
  } catch (err) {
    console.error('Failed to load auth state from localStorage', err);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: SafeUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('shoplist_auth', JSON.stringify(state));
    },
    updateUserProfile: (state, action: PayloadAction<Partial<SafeUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('shoplist_auth', JSON.stringify(state));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('shoplist_auth');
    },
  },
});

export const { setCredentials, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;