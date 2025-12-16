import { createBrowserRouter } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import AppWorkspace from '../pages/AppWorkspace';
import SuperAdminTenantManagementPage from '../pages/admin/SuperAdminTenantManagementPage';
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
        path: '/admin/tenants',
        element: <SuperAdminTenantManagementPage />,
    },
    {
        path: '/profile',
        element: <UserProfilePage />,
    },
]);
