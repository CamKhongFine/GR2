import React from 'react';
import MyTasksPage from '../shared/MyTasksPage';
import { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';

const StaffMyTasksPage: React.FC = () => {
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
        <MyTasksPage
            sidebarItems={sidebarItems}
            activeItem="my-tasks"
            themeColor="green"
            workspaceType="staff"
        />
    );
};

export default StaffMyTasksPage;
