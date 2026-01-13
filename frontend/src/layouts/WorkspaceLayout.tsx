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
    SettingOutlined,
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
    leftHeaderContent?: React.ReactNode;
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
    leftHeaderContent,
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

    // Get user title/role
    const userTitle = useMemo(() => {
        if (!user?.roles || user.roles.length === 0) return 'Staff';
        return user.roles[0]?.name || 'Staff';
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
            <div className="w-[80px] h-screen bg-slate-800 border-r border-slate-700 flex flex-col items-center py-3 fixed left-0 top-0 z-50">
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
                {/* Header with Enhanced Background */}
                <div className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        {leftHeaderContent}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Input */}
                        <Input
                            placeholder="Search..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            className="w-56 rounded-lg"
                            size="middle"
                        />

                        {/* Messenger Button */}
                        <div
                            className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md hover:from-blue-100 hover:to-blue-200 transition-all relative border border-blue-200"
                            title="Messenger"
                        >
                            <MessageOutlined className="text-xl text-blue-600" />
                        </div>

                        {/* Notification Button */}
                        <div className="w-11 h-11 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md hover:from-orange-100 hover:to-orange-200 transition-all relative border border-orange-200">
                            <BellOutlined className="text-xl text-orange-600" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-[10px] text-white font-bold">3</span>
                            </div>
                        </div>

                        {/* User Info - Dropdown menu */}
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
                                        onClick: () => {
                                            logout();
                                            navigate('/login');
                                        },
                                    },
                                ] as MenuProps['items'],
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayStyle={{ marginTop: 15, minWidth: 140 }}
                        >
                            <div
                                className="flex items-center gap-3 cursor-pointer pl-4 ml-2 border-l border-gray-200 hover:bg-gray-50 py-1 px-3 rounded-lg transition-colors"
                            >
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-gray-800">{displayName}</div>
                                    <div className="text-xs text-gray-500">{userTitle}</div>
                                </div>
                                <Avatar
                                    size={44}
                                    src={user?.avatarUrl}
                                    icon={!user?.avatarUrl ? <UserOutlined /> : undefined}
                                    className="border-2 border-gray-200 shadow-sm"
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
