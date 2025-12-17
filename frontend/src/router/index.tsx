import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AdminLayout from '../layouts/AdminLayout';
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import AppWorkspace from '../pages/AppWorkspace';
import TenantManagementPage from '../pages/superadmin/TenantManagementPage';
import UserManagementPage from '../pages/superadmin/UserManagementPage';
import RoleManagementPage from '../pages/superadmin/RoleManagementPage';
import DashboardPage from '../pages/superadmin/DashboardPage';
import UserProfilePage from '../pages/profile/UserProfilePage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingLayout />,
        children: [
            {
                index: true,
                element: <LandingPage />,
            },
        ],
    },
    {
        path: '/login',
        element: <AuthPage />,
    },
    {
        path: '/app',
        element: <AppWorkspace />,
    },
    {
        path: '/superadmin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/superadmin/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'tenants',
                element: <TenantManagementPage />,
            },
            {
                path: 'users',
                element: <UserManagementPage />,
            },
            {
                path: 'roles',
                element: <RoleManagementPage />,
            },
        ],
    },
    {
        path: '/profile',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <UserProfilePage />,
            },
        ],
    },
]);
