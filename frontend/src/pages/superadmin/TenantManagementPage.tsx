import React, { useMemo, useState } from 'react';
import {
    Layout,
    Menu,
    Breadcrumb,
    Card,
    Table,
    Avatar,
    Dropdown,
    Space,
    Typography,
    Button,
    Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    DashboardOutlined,
    ApartmentOutlined,
    TeamOutlined,
    SettingOutlined,
    BellOutlined,
    SoundOutlined,
    UserOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type TenantStatus = 'Active' | 'Suspended';

interface Tenant {
    key: string;
    name: string;
    tenantId: string;
    plan: string;
    status: TenantStatus;
    createdAt: string;
}

const SuperAdminTenantManagementPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems: MenuProps['items'] = useMemo(
        () => [
            {
                key: '/admin/dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
            {
                key: '/admin/tenants',
                icon: <ApartmentOutlined />,
                label: 'Tenant Management',
            },
            {
                key: '/admin/users',
                icon: <TeamOutlined />,
                label: 'User Management',
            },
            {
                key: '/admin/settings',
                icon: <SettingOutlined />,
                label: 'System Settings',
            },
        ],
        []
    );

    const userMenuItems: MenuProps['items'] = useMemo(
        () => [
            { key: 'profile', label: 'Profile' },
            { key: 'logout', label: 'Logout' },
        ],
        []
    );

    const tenants: Tenant[] = [
        {
            key: '1',
            name: 'Acme Corp',
            tenantId: 'TEN-0001',
            plan: 'Enterprise',
            status: 'Active',
            createdAt: '2023-01-12',
        },
        {
            key: '2',
            name: 'Globex Industries',
            tenantId: 'TEN-0002',
            plan: 'Business',
            status: 'Active',
            createdAt: '2023-03-05',
        },
        {
            key: '3',
            name: 'Innotech Labs',
            tenantId: 'TEN-0003',
            plan: 'Starter',
            status: 'Suspended',
            createdAt: '2022-11-20',
        },
    ];

    const columns: ColumnsType<Tenant> = [
        {
            title: 'Tenant Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Tenant ID',
            dataIndex: 'tenantId',
            key: 'tenantId',
        },
        {
            title: 'Plan',
            dataIndex: 'plan',
            key: 'plan',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: TenantStatus) => (
                <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" size="small">
                        View
                    </Button>
                    <Button type="link" size="small" danger>
                        {record.status === 'Active' ? 'Suspend' : 'Activate'}
                    </Button>
                </Space>
            ),
        },
    ];

    const siderWidth = collapsed ? 80 : 220;

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={220}
                collapsedWidth={80}
                theme="dark"
                trigger={null}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    height: '100vh',
                }}
            >
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        gap: 8,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: '#1677ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 18,
                        }}
                    >
                        <SoundOutlined />
                    </div>
                    {!collapsed && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                                AuraFlow
                            </Text>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                                Super Admin
                            </Text>
                        </div>
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            <Layout style={{ marginLeft: siderWidth }}>
                <Header
                    style={{
                        padding: '0 24px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Space>
                        {collapsed ? (
                            <MenuUnfoldOutlined
                                style={{ fontSize: 18, cursor: 'pointer' }}
                                onClick={() => setCollapsed(false)}
                            />
                        ) : (
                            <MenuFoldOutlined
                                style={{ fontSize: 18, cursor: 'pointer' }}
                                onClick={() => setCollapsed(true)}
                            />
                        )}
                    </Space>

                    <Space size="large" align="center">
                        <BellOutlined style={{ fontSize: 18 }} />
                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar size="small" icon={<UserOutlined />} />
                                <Text>SuperAdmin</Text>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{ padding: 24, background: '#f5f5f5' }}>
                    <Breadcrumb style={{ marginBottom: 16 }}>
                        <Breadcrumb.Item>Home</Breadcrumb.Item>
                        <Breadcrumb.Item>Admin</Breadcrumb.Item>
                        <Breadcrumb.Item>Tenant Management</Breadcrumb.Item>
                    </Breadcrumb>

                    <div style={{ marginBottom: 24 }}>
                        <Title level={3} style={{ marginBottom: 4 }}>
                            Tenant Management
                        </Title>
                        <Text type="secondary">
                            Manage all tenants across the AuraFlow platform
                        </Text>
                    </div>

                    <Card title="Tenant List" bordered={false}>
                        <Table<Tenant>
                            columns={columns}
                            dataSource={tenants}
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
};

export default SuperAdminTenantManagementPage;


