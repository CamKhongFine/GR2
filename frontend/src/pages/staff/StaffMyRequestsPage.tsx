import React from 'react';
import MyRequestsPage from '../shared/MyRequestsPage';
import { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';

const StaffMyRequestsPage: React.FC = () => {
    const sidebarItems: SidebarItemConfig[] = [
        {
            key: 'workspace',
            icon: <ClockCircleOutlined />,
            label: 'Workspace',
            path: '/staff/workspace',
        },
        {
            key: 'my-tasks',
            icon: <CheckCircleOutlined />,
            label: 'My Task',
            path: '/staff/tasks',
        },
        {
            key: 'my-requests',
            icon: <CheckCircleOutlined />,
            label: 'My Request',
            path: '/staff/my-requests',
        },
    ];

    return (
        <MyRequestsPage
            sidebarItems={sidebarItems}
            activeItem="my-requests"
            themeColor="green"
            workspaceType="staff"
        />
    );
};

export default StaffMyRequestsPage;
