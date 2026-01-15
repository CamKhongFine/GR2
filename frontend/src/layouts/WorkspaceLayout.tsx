import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Input, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    UserOutlined,
    HomeOutlined,
    BellOutlined,
    MessageOutlined,
    SearchOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';
import { useUserStore } from '../store/userStore';

// Theme configuration for different workspace types
const THEME_CONFIG = {
    blue: {
        activeBg: 'bg-blue-600',
        activeShadow: 'shadow-blue-200',
        activeText: 'text-blue-600',
        inactiveBg: 'bg-[#F7E9E9]',
        gradient: 'from-blue-500 to-purple-600',
        focusRing: 'focus:ring-blue-100',
    },
    green: {
        activeBg: 'bg-green-600',
        activeShadow: 'shadow-green-200',
        activeText: 'text-green-600',
        inactiveBg: 'bg-[#E9F7EF]',
        gradient: 'from-green-500 to-teal-600',
        focusRing: 'focus:ring-green-100',
    },
    purple: {
        activeBg: 'bg-purple-600',
        activeShadow: 'shadow-purple-200',
        activeText: 'text-purple-600',
        inactiveBg: 'bg-[#F3E8FF]',
        gradient: 'from-purple-500 to-pink-600',
        focusRing: 'focus:ring-purple-100',
    },
};

// Sidebar Item Configuration
export interface SidebarItemConfig {
    key: string;
    icon: React.ReactNode;
    label: string;
    path?: string;
    onClick?: () => void;
}

// Props for WorkspaceLayout
export interface WorkspaceLayoutProps {
    sidebarItems: SidebarItemConfig[];
    activeItem: string;
    themeColor?: 'blue' | 'green' | 'purple';
    headerOverSidebar?: boolean;
    children: React.ReactNode;
}

// Sidebar Item Component
interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    themeColor: 'blue' | 'green' | 'purple';
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, themeColor, onClick }) => {
    const theme = THEME_CONFIG[themeColor];

    return (
        <div className="group flex flex-col items-center gap-1 cursor-pointer mb-6" onClick={onClick}>
            <div
                className={clsx(
                    "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
                    active
                        ? `${theme.activeBg} text-white`
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                )}
            >
                <span className="text-xl">{icon}</span>
            </div>
            <span className={clsx(
                "text-[10px] font-medium transition-colors text-center max-w-[70px] truncate",
                active ? "text-white" : "text-slate-400 group-hover:text-white"
            )}>
                {label}
            </span>
        </div>
    );
};

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
    sidebarItems,
    activeItem,
    themeColor = 'blue',
    headerOverSidebar = false,
    children,
}) => {
    const navigate = useNavigate();
    const { user, loadUser, logout } = useUserStore();
    const theme = THEME_CONFIG[themeColor];

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Get display name from user data
    const displayName = useMemo(() => {
        if (!user) return 'User';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || user.email;
    }, [user]);

    // Get organizational scope
    const organizationalScope = useMemo(() => {
        if (user?.department?.name) return user.department.name;
        if (user?.division?.name) return user.division.name;
        return null;
    }, [user]);



    const handleSidebarItemClick = (item: SidebarItemConfig) => {
        if (item.onClick) {
            item.onClick();
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Sidebar */}
            <div className="w-[80px] h-screen bg-slate-900 border-r border-slate-700 flex flex-col items-center py-3 fixed left-0 top-0 z-50">
                <div className="mb-8">
                    <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        A
                    </div>
                </div>

                <div className="flex-1 flex flex-col w-full overflow-y-auto no-scrollbar">
                    <SidebarItem
                        icon={<HomeOutlined />}
                        label="Home"
                        themeColor={themeColor}
                        onClick={() => navigate('/')}
                    />
                    {sidebarItems.map((item) => (
                        <SidebarItem
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            active={activeItem === item.key}
                            themeColor={themeColor}
                            onClick={() => handleSidebarItemClick(item)}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-[80px] flex flex-col">
                {/* Enterprise Application Header */}
                <div
                    className="h-14 flex items-center justify-between px-6 sticky top-0 bg-slate-900 border-b border-slate-700"
                    style={{ zIndex: headerOverSidebar ? 60 : 40 }}
                >
                    {/* Left - Application Anchor */}
                    <div className="flex items-center gap-3">
                        {organizationalScope && (
                            <span className="text-sm font-medium text-slate-300">
                                {organizationalScope}
                            </span>
                        )}
                    </div>

                    {/* Center - Breathing Space */}
                    <div className="flex-1" />

                    {/* Right - Utilities */}
                    <div className="flex items-center gap-3">
                        {/* Search Input */}
                        <Input
                            placeholder="Search..."
                            prefix={<SearchOutlined className="text-slate-400" />}
                            className="w-48 bg-slate-800 border-slate-700 text-slate-200 search-input-white-placeholder"
                            size="small"
                            style={{ borderRadius: 6 }}
                        />

                        {/* Message Button */}
                        <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                            <MessageOutlined className="text-base text-slate-300" />
                        </div>

                        {/* Notification Button */}
                        <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors relative">
                            <BellOutlined className="text-base text-slate-300" />
                            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                <span className="text-[9px] text-white font-semibold">3</span>
                            </div>
                        </div>

                        {/* User Avatar - Dropdown menu */}
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'profile',
                                        icon: <UserOutlined />,
                                        label: 'View Profile',
                                        onClick: () => {
                                            if (themeColor === 'blue') {
                                                navigate('/division/profile');
                                            } else if (themeColor === 'green') {
                                                navigate('/department/profile');
                                            } else {
                                                navigate('/staff/profile');
                                            }
                                        },
                                    },
                                    {
                                        type: 'divider',
                                    },
                                    {
                                        key: 'logout',
                                        icon: <LogoutOutlined />,
                                        label: 'Logout',
                                        onClick: async () => {
                                            await logout();
                                            navigate('/login');
                                        },
                                    },
                                ] as MenuProps['items'],
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayStyle={{ marginTop: 10, minWidth: 140 }}
                        >
                            <div className="flex items-center gap-2 cursor-pointer pl-3 border-l border-slate-700 hover:bg-slate-800 py-1 px-2 rounded transition-colors">
                                <Avatar
                                    size={32}
                                    src={user?.avatarUrl}
                                    icon={!user?.avatarUrl ? <UserOutlined /> : undefined}
                                    className="border border-slate-600"
                                />
                            </div>
                        </Dropdown>
                    </div>
                </div>

                {/* Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default WorkspaceLayout;
