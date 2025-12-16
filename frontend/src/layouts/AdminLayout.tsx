import React, { useMemo, useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Avatar,
    Dropdown,
    Space,
    Typography,
    Badge,
} from 'antd';
import type { MenuProps } from 'antd';
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
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { fetchCurrentUser, type UserResponse } from '../api/auth.api';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<UserResponse | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const siderWidth = collapsed ? 80 : 220;

    // Fetch current user information
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await fetchCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        loadUser();
    }, []);

    // Get display name from user data
    const displayName = useMemo(() => {
        if (!user) return 'Username';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || user.email;
    }, [user]);

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
                key: '/profile',
                icon: <UserOutlined />,
                label: 'Profile',
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

    const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'profile') {
            navigate('/profile');
        }
        if (key === 'logout') {
            localStorage.clear();
            sessionStorage.clear();

            navigate('/login');

            console.log('Logged out successfully');
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Sidebar */}
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
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '0' : '0 16px',
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
                        <div>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                                AuraFlow
                            </Text>
                            <br />
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

            {/* Main */}
            <Layout style={{ marginLeft: siderWidth }}>
                {/* Header */}
                <Header
                    style={{
                        height: '64px',
                        lineHeight: '64px',
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
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

                    <Space size="large" align="center">
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: 5 }}>
                            <Badge count={5}>
                                <BellOutlined style={{ fontSize: 16, cursor: 'pointer' }} />
                            </Badge>
                        </div>
                        <Dropdown
                            trigger={['click']}
                            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                        >
                            <Space style={{ fontSize: 16, cursor: 'pointer' }} align="center">
                                <Avatar
                                    size="small"
                                    src={user?.avatarUrl}
                                    icon={!user?.avatarUrl ? <UserOutlined /> : undefined}
                                />
                                <Text>{displayName}</Text>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Content */}
                <Content style={{ padding: '24px 32px' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
