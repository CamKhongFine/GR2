import React, { useMemo, useEffect } from 'react';
import {
    Layout,
    Avatar,
    Dropdown,
    Space,
    Typography,
    Badge,
    Button,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

const { Header, Content } = Layout;
const { Text } = Typography;

const ProfileLayout: React.FC = () => {
    const navigate = useNavigate();

    // Use global user store
    const { user, loadUser, logout } = useUserStore();

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

    const userMenuItems: MenuProps['items'] = useMemo(
        () => [
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined /> },
        ],
        []
    );

    const handleUserMenuClick: MenuProps['onClick'] = async ({ key }) => {
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

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
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
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={handleGoBack}
                    style={{ fontSize: 16 }}
                >
                    Back
                </Button>

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
    );
};

export default ProfileLayout;
