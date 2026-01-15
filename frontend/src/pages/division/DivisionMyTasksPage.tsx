import React from 'react';
import MyTasksPage from '../shared/MyTasksPage';
import { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import {
    ApartmentOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';

const DivisionMyTasksPage: React.FC = () => {
    const sidebarItems: SidebarItemConfig[] = [
        {
            key: 'division',
            icon: <ApartmentOutlined />,
            label: 'Division',
            path: '/division/dashboard',
        },
        {
            key: 'my-tasks',
            icon: <CheckSquareOutlined />,
            label: 'My Task',
            path: '/division/my-tasks',
        },
        {
            key: 'my-requests',
            icon: <CheckSquareOutlined />,
            label: 'My Request',
            path: '/division/my-requests',
        },
    ];

    return (
        <MyTasksPage
            sidebarItems={sidebarItems}
            activeItem="my-tasks"
            themeColor="blue"
            workspaceType="division"
        />
    );
};

export default DivisionMyTasksPage;
