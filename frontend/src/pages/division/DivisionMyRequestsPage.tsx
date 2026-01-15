import React from 'react';
import MyRequestsPage from '../shared/MyRequestsPage';
import { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import {
    ApartmentOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';

const DivisionMyRequestsPage: React.FC = () => {
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
        <MyRequestsPage
            sidebarItems={sidebarItems}
            activeItem="my-requests"
            themeColor="blue"
            workspaceType="division"
        />
    );
};

export default DivisionMyRequestsPage;
