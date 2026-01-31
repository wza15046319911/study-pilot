import { create } from "zustand";
import type { Profile } from "@/types/database";

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setAuthState: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_admin),
    }),
  setAuthState: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: Boolean(user?.is_admin),
    }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    }),
}));
