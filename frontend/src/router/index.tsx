import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AdminLayout from '../layouts/AdminLayout';
import TenantAdminLayout from '../layouts/TenantAdminLayout';
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import AppWorkspace from '../pages/AppWorkspace';
import TenantManagementPage from '../pages/super-admin/TenantManagementPage';
import SuperAdminUserManagementPage from '../pages/super-admin/UserManagementPage';
import RoleManagementPage from '../pages/super-admin/RoleManagementPage';
import SuperAdminDashboardPage from '../pages/super-admin/DashboardPage';
import TenantAdminDashboardPage from '../pages/admin/DashboardPage';
import TenantAdminUserManagementPage from '../pages/admin/UserManagementPage';
import DivisionManagementPage from '../pages/admin/DivisionManagementPage';
import WorkflowManagementPage from '../pages/admin/WorkflowManagementPage';
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
        path: '/super-admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/super-admin/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <SuperAdminDashboardPage />,
            },
            {
                path: 'tenants',
                element: <TenantManagementPage />,
            },
            {
                path: 'users',
                element: <SuperAdminUserManagementPage />,
            },
            {
                path: 'roles',
                element: <RoleManagementPage />,
            },
            {
                path: 'profile',
                element: <UserProfilePage />,
            },
        ],
    },
    {
        path: '/admin',
        element: <TenantAdminLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="/admin/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <TenantAdminDashboardPage />,
            },
            {
                path: 'users',
                element: <TenantAdminUserManagementPage />,
            },
            {
                path: 'divisions',
                element: <DivisionManagementPage />,
            },
            {
                path: 'workflows',
                element: <WorkflowManagementPage />,
            },
            {
                path: 'profile',
                element: <UserProfilePage />,
            },
        ],
    },
]);

