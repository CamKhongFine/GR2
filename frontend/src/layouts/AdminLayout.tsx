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
    LogoutOutlined,
    SafetyCertificateOutlined,
    HomeOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LAYOUT_CONFIG } from '../config/layout.config';
import { useUserStore } from '../store/userStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Use global user store
    const { user, loadUser, logout } = useUserStore();

    const siderWidth = collapsed ? LAYOUT_CONFIG.SIDEBAR_COLLAPSED_WIDTH : LAYOUT_CONFIG.SIDEBAR_WIDTH;

    // Fetch current user information
    useEffect(() => {
        loadUser();
    }, [loadUser]);

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
                key: '/',
                icon: <HomeOutlined />,
                label: 'Home',
            },
            {
                key: '/super-admin/dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
            },
            {
                key: '/super-admin/tenants',
                icon: <ApartmentOutlined />,
                label: 'Tenant',
            },
            {
                key: '/super-admin/users',
                icon: <TeamOutlined />,
                label: 'User',
            },
            {
                key: '/super-admin/roles',
                icon: <SafetyCertificateOutlined />,
                label: 'Role',
            },
            {
                key: '/super-admin/profile',
                icon: <UserOutlined />,
                label: 'Profile',
            },
        ],
        []
    );

    const userMenuItems: MenuProps['items'] = useMemo(
        () => [
            { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined /> },
        ],
        []
    );

    const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
        if (key === 'profile') {
            navigate('/super-admin/profile');
        }
        if (key === 'logout') {
            try {
                const apiClient = (await import('../lib/apiClient')).default;
                await apiClient.post('/api/auth/logout');
            } catch (error) {
                console.error('Logout API error:', error);
            } finally {
                // Clear local storage regardless of API result
                logout();
                localStorage.clear();
                sessionStorage.clear();
                navigate('/login');
                console.log('Logged out successfully');
            }
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            {/* Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={LAYOUT_CONFIG.SIDEBAR_WIDTH}
                collapsedWidth={LAYOUT_CONFIG.SIDEBAR_COLLAPSED_WIDTH}
                theme="dark"
                trigger={null}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: LAYOUT_CONFIG.SIDEBAR_Z_INDEX,
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: LAYOUT_CONFIG.HEADER_HEIGHT,
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
