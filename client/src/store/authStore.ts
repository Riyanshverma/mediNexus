import { create } from 'zustand';

export type Role = 'patient' | 'doctor' | 'hospital' | null;

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  role: Role;
  token: string | null;
  setAuth: (user: User, role: Role, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  token: null,
  setAuth: (user, role, token) => {
    localStorage.setItem('auth_token', token);
    set({ user, role, token });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, role: null, token: null });
  },
}));
