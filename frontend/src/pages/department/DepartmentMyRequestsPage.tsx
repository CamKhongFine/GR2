import React from 'react';
import MyRequestsPage from '../shared/MyRequestsPage';
import { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import {
    TeamOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
} from '@ant-design/icons';

const DepartmentMyRequestsPage: React.FC = () => {
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
        <MyRequestsPage
            sidebarItems={sidebarItems}
            activeItem="my-requests"
            themeColor="green"
            workspaceType="department"
        />
    );
};

export default DepartmentMyRequestsPage;
