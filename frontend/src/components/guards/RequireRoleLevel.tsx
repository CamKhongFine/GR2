import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useUserStore } from '../../store/userStore';

interface RequireRoleLevelProps {
    maxLevel: number;
    children: React.ReactNode;
}

/**
 * Guard component that restricts access based on user's effective role level
 * Redirects to /403 if user's role level exceeds the maximum allowed level
 * 
 * @param maxLevel - Maximum role level allowed (lower number = higher privilege)
 * @param children - Components to render if authorized
 */
const RequireRoleLevel: React.FC<RequireRoleLevelProps> = ({ maxLevel, children }) => {
    const { user, roleLevel, isLoadingRole, loadUserRole } = useUserStore();

    // Skip auth check if VITE_SKIP_AUTH is enabled
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
    if (skipAuth) {
        return <>{children}</>;
    }

    // Load role if not already loaded
    useEffect(() => {
        if (user && roleLevel === null && !isLoadingRole) {
            loadUserRole();
        }
    }, [user, roleLevel, isLoadingRole, loadUserRole]);

    // Show loading state while fetching role
    if (isLoadingRole || (user && roleLevel === null)) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    // Redirect to 403 if role level exceeds maximum allowed
    if (roleLevel !== null && roleLevel > maxLevel) {
        return <Navigate to="/403" replace />;
    }

    // Render children if authorized
    return <>{children}</>;
};

export default RequireRoleLevel;

