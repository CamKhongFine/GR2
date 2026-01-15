import { create } from 'zustand';
import { User } from '../types/task';

interface AppState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
    isAuthenticated: true,
    login: (user) => set({ user, isAuthenticated: true }),
    logout: () => set({ user: null, isAuthenticated: false }),
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
