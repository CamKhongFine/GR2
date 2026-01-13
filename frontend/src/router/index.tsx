import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AdminLayout from '../layouts/AdminLayout';
import TenantAdminLayout from '../layouts/TenantAdminLayout';
import DepartmentLayout from '../layouts/DepartmentLayout';
import DivisionLayout from '../layouts/DivisionLayout';
import StaffLayout from '../layouts/StaffLayout';
import RequireRoleLevel from '../components/guards/RequireRoleLevel';
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import AppEntry from '../pages/AppEntry';
import ProfileEntry from '../pages/ProfileEntry';
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
import DepartmentDetailPage from '../pages/admin/DepartmentDetailPage';
import WorkflowManagementPage from '../pages/admin/WorkflowManagementPage';
import WorkflowEditorPage from '../pages/admin/WorkflowEditorPage';
import DepartmentDashboardPage from '../pages/department/DashboardPage';
import DivisionDashboardPage from '../pages/division/DashboardPage';
import StaffWorkspacePage from '../pages/staff/StaffWorkspacePage';
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
    // Profile entry point - redirects to role-specific profile
    {
        path: '/profile',
        element: <ProfileEntry />,
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
                path: 'departments/:id',
                element: <DepartmentDetailPage />,
            },
            {
                path: 'workflows',
                element: <WorkflowManagementPage />,
            },
            {
                path: 'workflows/new',
                element: <WorkflowEditorPage />,
            },
            {
                path: 'workflows/:id',
                element: <WorkflowEditorPage />,
            },
            {
                path: 'profile',
                element: <UserProfilePage />,
            },
        ],
    },
    // Division workspace routes (role level ≤ 2)
    {
        path: '/division',
        element: (
            <RequireRoleLevel maxLevel={2}>
                <Navigate to="/division/dashboard" replace />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/division/dashboard',
        element: (
            <RequireRoleLevel maxLevel={2}>
                <DivisionDashboardPage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/division/tasks',
        element: (
            <RequireRoleLevel maxLevel={2}>
                <DivisionDashboardPage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/division/team',
        element: (
            <RequireRoleLevel maxLevel={2}>
                <DivisionDashboardPage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/division/profile',
        element: (
            <RequireRoleLevel maxLevel={2}>
                <DivisionLayout />
            </RequireRoleLevel>
        ),
        children: [
            {
                index: true,
                element: <UserProfilePage />,
            },
        ],
    },
    // Department workspace routes (role level ≤ 3)
    {
        path: '/department',
        element: (
            <RequireRoleLevel maxLevel={3}>
                <Navigate to="/department/dashboard" replace />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/department/dashboard',
        element: (
            <RequireRoleLevel maxLevel={3}>
                <DepartmentDashboardPage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/department/team',
        element: (
            <RequireRoleLevel maxLevel={3}>
                <DepartmentDashboardPage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/department/reports',
        element: (
            <RequireRoleLevel maxLevel={3}>
                <DepartmentDashboardPage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/department/profile',
        element: (
            <RequireRoleLevel maxLevel={3}>
                <DepartmentLayout />
            </RequireRoleLevel>
        ),
        children: [
            {
                index: true,
                element: <UserProfilePage />,
            },
        ],
    },
    // Staff workspace routes (role level ≤ 4)
    {
        path: '/staff',
        element: (
            <RequireRoleLevel maxLevel={4}>
                <Navigate to="/staff/workspace" replace />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/staff/workspace',
        element: (
            <RequireRoleLevel maxLevel={4}>
                <StaffWorkspacePage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/staff/tasks',
        element: (
            <RequireRoleLevel maxLevel={4}>
                <StaffWorkspacePage />
            </RequireRoleLevel>
        ),
    },
    {
        path: '/staff/profile',
        element: (
            <RequireRoleLevel maxLevel={4}>
                <StaffLayout />
            </RequireRoleLevel>
        ),
        children: [
            {
                index: true,
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


