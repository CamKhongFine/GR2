import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Input, Button, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppstoreOutlined,
    CheckSquareOutlined,
    UserOutlined,
    SettingOutlined,
    BellOutlined,
    SearchOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TeamOutlined,
    PartitionOutlined
} from '@ant-design/icons';
import clsx from 'clsx';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: '/app/dashboard',
            icon: <AppstoreOutlined />,
            label: 'Home',
        },
        {
            key: '/app/tasks',
            icon: <CheckSquareOutlined />,
            label: 'My Tasks',
        },
        {
            key: '/app/workflow',
            icon: <PartitionOutlined />,
            label: 'Workflow',
        },
        {
            key: '/app/department',
            icon: <TeamOutlined />,
            label: 'Department',
        },
        {
            key: '/app/users',
            icon: <UserOutlined />,
            label: 'Users & Roles',
        },
        {
            key: '/app/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: 'Profile',
            },
            {
                key: 'logout',
                label: 'Logout',
                danger: true,
            },
        ],
    };

    return (
        <Layout className="min-h-screen">
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="border-r border-gray-200">
                <div className={clsx("h-16 flex items-center justify-center border-b border-gray-100 transition-all duration-200", collapsed ? "px-2" : "px-4")}>
                    <div className="text-xl font-bold text-primary truncate">
                        {collapsed ? 'TM' : 'TaskMaster'}
                    </div>
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="border-none"
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} className="flex items-center justify-between px-6 border-b border-gray-100 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                        <Input.Search
                            placeholder="Search tasks, projects..."
                            allowClear
                            style={{ width: 300 }}
                            prefix={<SearchOutlined className="text-gray-400" />}
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <Button type="primary" shape="round" icon={<CheckSquareOutlined />}>
                            Create Task
                        </Button>
                        <Badge count={5} size="small">
                            <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 20 }} />} />
                        </Badge>
                        <Dropdown menu={userMenu} placement="bottomRight">
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                                <span className="font-medium text-gray-700">John Doe</span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: 'transparent',
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
