import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin, Alert } from 'antd';
import { useUserStore } from '../store/userStore';
import { getDefaultRouteForRole } from '../api/role.api';

/**
 * Entry point after login at /app
 * Fetches user role and redirects to appropriate dashboard based on role level
 */
const AppEntry: React.FC = () => {
    const { user, roleLevel, isLoadingRole, loadUser, loadUserRole } = useUserStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                // Load user if not already loaded
                if (!user) {
                    await loadUser();
                }
            } catch (err) {
                setError('Failed to load user information');
                console.error('Error loading user:', err);
            }
        };

        initializeUser();
    }, [user, loadUser]);

    useEffect(() => {
        const initializeRole = async () => {
            try {
                // Load role if user is loaded but role is not
                if (user && roleLevel === null && !isLoadingRole) {
                    await loadUserRole();
                }
            } catch (err) {
                setError('Failed to load user role');
                console.error('Error loading role:', err);
            }
        };

        initializeRole();
    }, [user, roleLevel, isLoadingRole, loadUserRole]);

    // Show error if something went wrong
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '24px'
            }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    // Show loading while fetching user or role
    if (!user || roleLevel === null || isLoadingRole) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <Spin size="large" tip="Loading your workspace..." />
            </div>
        );
    }

    // Redirect to appropriate dashboard based on role level
    const targetRoute = getDefaultRouteForRole(roleLevel);
    return <Navigate to={targetRoute} replace />;
};

export default AppEntry;
