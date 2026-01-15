import React from 'react';
import {
    HomeOutlined,
    CheckSquareOutlined,
    TeamOutlined,
    DollarOutlined,
    BarChartOutlined,
    BellOutlined,
    UserOutlined
} from '@ant-design/icons';
import clsx from 'clsx';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => {
    return (
        <div className="group flex flex-col items-center gap-1 cursor-pointer mb-6">
            <div
                className={clsx(
                    "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
                    active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-[#F7E9E9] text-gray-600 hover:bg-white hover:shadow-md"
                )}
            >
                <span className="text-xl">{icon}</span>
            </div>
            <span className={clsx(
                "text-[10px] font-medium transition-colors",
                active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
            )}>
                {label}
            </span>
        </div>
    );
};

const Sidebar: React.FC = () => {
    return (
        <div className="w-[80px] h-screen bg-[#FDFBFB] border-r border-gray-100 flex flex-col items-center py-6 fixed left-0 top-0 z-50">
            <div className="mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    B
                </div>
            </div>

            <div className="flex-1 flex flex-col w-full overflow-y-auto no-scrollbar">
                <SidebarItem icon={<HomeOutlined />} label="Home" />
                <SidebarItem icon={<CheckSquareOutlined />} label="Tasks" active />
                <SidebarItem icon={<TeamOutlined />} label="Teams" />
                <SidebarItem icon={<DollarOutlined />} label="Salary" />
                <SidebarItem icon={<BarChartOutlined />} label="Reports" />
            </div>

            <div className="mt-auto">
                <SidebarItem icon={<BellOutlined />} label="Notifs" />
                <SidebarItem icon={<UserOutlined />} label="Profile" />
            </div>
        </div>
    );
};

export default Sidebar;
