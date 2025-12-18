import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AdminLayout from '../layouts/AdminLayout';
import TenantAdminLayout from '../layouts/TenantAdminLayout';
import DepartmentLayout from '../layouts/DepartmentLayout';
import DivisionLayout from '../layouts/DivisionLayout';
import RequireRoleLevel from '../components/guards/RequireRoleLevel';
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import AppEntry from '../pages/AppEntry';
import AppWorkspace from '../pages/AppWorkspace';
import ForbiddenPage from '../pages/ForbiddenPage';
import TenantManagementPage from '../pages/super-admin/TenantManagementPage';
import SuperAdminUserManagementPage from '../pages/super-admin/UserManagementPage';
import RoleManagementPage from '../pages/super-admin/RoleManagementPage';
import SuperAdminDashboardPage from '../pages/super-admin/DashboardPage';
import TenantAdminDashboardPage from '../pages/admin/DashboardPage';
import TenantAdminUserManagementPage from '../pages/admin/UserManagementPage';
import DivisionManagementPage from '../pages/admin/DivisionManagementPage';
import DivisionDetailPage from '../pages/admin/DivisionDetailPage';
import DepartmentManagementPage from '../pages/admin/DepartmentManagementPage';
import WorkflowManagementPage from '../pages/admin/WorkflowManagementPage';
import DepartmentDashboardPage from '../pages/department/DashboardPage';
import DivisionDashboardPage from '../pages/division/DashboardPage';
import UserProfilePage from '../pages/profile/UserProfilePage';

export const router = createBrowserRouter([
    // Landing page
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
    // Auth page
    {
        path: '/login',
        element: <AuthPage />,
    },
    // Entry point - redirects based on role
    {
        path: '/app',
        element: <AppEntry />,
    },
    // Super Admin routes (role level 0)
    {
        path: '/super-admin',
        element: (
            <RequireRoleLevel maxLevel={0}>
                <AdminLayout />
            </RequireRoleLevel>
        ),
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
    // Admin routes (role level ≤ 1)
    {
        path: '/admin',
        element: (
            <RequireRoleLevel maxLevel={1}>
                <TenantAdminLayout />
            </RequireRoleLevel>
        ),
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
                path: 'divisions/:id',
                element: <DivisionDetailPage />,
            },
            {
                path: 'departments',
                element: <DepartmentManagementPage />,
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
    // Department routes (role level ≤ 2)
    {
        path: '/department',
        element: (
            <RequireRoleLevel maxLevel={2}>
                <DepartmentLayout />
            </RequireRoleLevel>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/department/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DepartmentDashboardPage />,
            },
            {
                path: 'team',
                element: <div>Team Management Page (To be implemented)</div>,
            },
            {
                path: 'reports',
                element: <div>Reports Page (To be implemented)</div>,
            },
            {
                path: 'profile',
                element: <UserProfilePage />,
            },
        ],
    },
    // Division routes (role level ≤ 3)
    {
        path: '/division',
        element: (
            <RequireRoleLevel maxLevel={3}>
                <DivisionLayout />
            </RequireRoleLevel>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/division/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DivisionDashboardPage />,
            },
            {
                path: 'tasks',
                element: <div>Division Tasks Page (To be implemented)</div>,
            },
            {
                path: 'team',
                element: <div>Team Page (To be implemented)</div>,
            },
            {
                path: 'profile',
                element: <UserProfilePage />,
            },
        ],
    },
    // Workspace routes (all authenticated users)
    {
        path: '/workspace',
        element: <AppWorkspace />,
    },
    // 403 Forbidden page
    {
        path: '/403',
        element: <ForbiddenPage />,
    },
]);
