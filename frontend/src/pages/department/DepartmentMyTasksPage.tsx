import React from 'react';
import MyTasksPage from '../shared/MyTasksPage';
import { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import {
    TeamOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
} from '@ant-design/icons';

const DepartmentMyTasksPage: React.FC = () => {
    const sidebarItems: SidebarItemConfig[] = [
        {
            key: 'department',
            icon: <TeamOutlined />,
            label: 'Department',
            path: '/department/dashboard',
        },
        {
            key: 'my-tasks',
            icon: <CheckSquareOutlined />,
            label: 'My Task',
            path: '/department/my-tasks',
        },
        {
            key: 'my-requests',
            icon: <CheckSquareOutlined />,
            label: 'My Request',
            path: '/department/my-requests',
        },
        {
            key: 'project',
            icon: <ProjectOutlined />,
            label: 'Project',
            path: '/department/projects',
        },
    ];

    return (
        <MyTasksPage
            sidebarItems={sidebarItems}
            activeItem="my-tasks"
            themeColor="green"
            workspaceType="department"
        />
    );
};

export default DepartmentMyTasksPage;
