import { createBrowserRouter } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AdminLayout from '../layouts/AdminLayout';
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import AppWorkspace from '../pages/AppWorkspace';
import TenantManagementPage from '../pages/superadmin/TenantManagementPage';
import UserManagementPage from '../pages/superadmin/UserManagementPage';
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
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                path: 'tenants',
                element: <TenantManagementPage />,
            },
            {
                path: 'users',
                element: <UserManagementPage />,
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
