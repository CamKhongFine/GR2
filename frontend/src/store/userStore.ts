import { create } from 'zustand';
import { fetchCurrentUser, type UserResponse } from '../api/auth.api';

interface UserStore {
    user: UserResponse | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: UserResponse | null) => void;
    loadUser: () => Promise<void>;
    logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    setUser: (user) => set({ user, error: null }),

    loadUser: async () => {
        set({ isLoading: true, error: null });
        try {
            const userData = await fetchCurrentUser();
            set({ user: userData, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch user:', error);
            set({ user: null, isLoading: false, error: 'Failed to load user' });
        }
    },

    logout: () => {
        localStorage.clear();
        sessionStorage.clear();
        set({ user: null, error: null });
    },
}));
