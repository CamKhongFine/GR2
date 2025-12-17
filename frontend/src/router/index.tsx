import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AdminLayout from '../layouts/AdminLayout';
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import AppWorkspace from '../pages/AppWorkspace';
import TenantManagementPage from '../pages/super-admin/TenantManagementPage';
import UserManagementPage from '../pages/super-admin/UserManagementPage';
import RoleManagementPage from '../pages/super-admin/RoleManagementPage';
import DashboardPage from '../pages/super-admin/DashboardPage';
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
                element: <Navigate to="/super-admin/dashboard" replace />,
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
