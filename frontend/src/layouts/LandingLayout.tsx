import React, { useEffect, useMemo } from 'react';
import { Layout, Button, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { LAYOUT_CONFIG } from '../config/layout.config';
import { useUserStore } from '../store/userStore';

const { Header, Content, Footer } = Layout;

const LandingLayout: React.FC = () => {
    const navigate = useNavigate();

    // Use global user store
    const { user, loadUser, logout } = useUserStore();

    // Fetch current user information
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const userMenuItems: MenuProps['items'] = user
        ? [
            { key: 'dashboard', label: 'Manage', icon: <SettingOutlined /> },
            { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
            { key: 'logout', label: 'Logout', icon: <LogoutOutlined /> },
        ]
        : [];

    const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'dashboard') {
            navigate('/admin/tenants');
        } else if (key === 'profile') {
            navigate('/profile');
        } else if (key === 'logout') {
            logout();
            navigate('/login');
        }
    };

    const displayName = useMemo(() => {
        if (!user) return 'Guest';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || user.email;
    }, [user]);

    return (
        <Layout className="min-h-screen bg-white">
            <Header
                className="flex items-center justify-between bg-white border-b border-gray-100 px-8 sticky top-0 z-50"
                style={{ height: LAYOUT_CONFIG.HEADER_HEIGHT }}
            >
                <div className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
                    AuraFlow
                </div>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <Dropdown
                            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                                <Avatar
                                    size="small"
                                    src={user?.avatarUrl}
                                    icon={!user?.avatarUrl ? <UserOutlined /> : undefined}
                                />
                                <span>{displayName}</span>
                            </div>
                        </Dropdown>
                    ) : (
                        <>
                            <Button type="text" onClick={() => navigate('/login')}>Log in</Button>
                            <Button type="primary" onClick={() => navigate('/app')}>Get Started</Button>
                        </>
                    )}
                </div>
            </Header>
            <Content>
                <Outlet />
            </Content>
            <Footer className="text-center bg-gray-50">
                AuraFlow ©{new Date().getFullYear()} Created by Antigravity
            </Footer>
        </Layout>
    );
};

export default LandingLayout;
