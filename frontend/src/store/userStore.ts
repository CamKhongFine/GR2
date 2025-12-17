import { create } from 'zustand';
import { fetchCurrentUser, type UserResponse } from '../api/auth.api';
import { fetchUserRole, type UserRoleResponse } from '../api/role.api';

interface UserStore {
    user: UserResponse | null;
    roleLevel: number | null;
    tenantId: string | null;
    isLoading: boolean;
    isLoadingRole: boolean;
    error: string | null;

    // Actions
    setUser: (user: UserResponse | null) => void;
    setRoleLevel: (roleLevel: number, tenantId?: string) => void;
    loadUser: () => Promise<void>;
    loadUserRole: () => Promise<void>;
    logout: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    roleLevel: null,
    tenantId: null,
    isLoading: false,
    isLoadingRole: false,
    error: null,

    setUser: (user) => set({ user, error: null }),

    setRoleLevel: (roleLevel, tenantId) => set({ roleLevel, tenantId }),

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

    loadUserRole: async () => {
        const { user } = get();
        if (!user?.id) {
            console.error('Cannot load role: user not loaded');
            return;
        }

        set({ isLoadingRole: true });
        try {
            const roleData: UserRoleResponse = await fetchUserRole(user.id.toString());
            set({
                roleLevel: roleData.effectiveRoleLevel,
                tenantId: roleData.tenantId || null,
                isLoadingRole: false
            });
        } catch (error) {
            console.error('Failed to fetch user role:', error);
            set({ roleLevel: null, tenantId: null, isLoadingRole: false });
        }
    },

    logout: () => {
        localStorage.clear();
        sessionStorage.clear();
        set({ user: null, roleLevel: null, tenantId: null, error: null });
    },
}));
