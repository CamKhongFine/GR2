import apiClient from '../lib/apiClient';

export const logout = async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
};
