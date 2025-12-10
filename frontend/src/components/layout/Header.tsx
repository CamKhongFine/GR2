import React from 'react';
import { SearchOutlined, PlusOutlined, BellOutlined, DownOutlined } from '@ant-design/icons';

const Header: React.FC = () => {
    return (
        <div className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 bg-transparent backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-white/50 cursor-pointer hover:bg-white transition-colors">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">P</div>
                    <span className="font-semibold text-gray-700">Product Design</span>
                    <DownOutlined className="text-xs text-gray-400" />
                </div>

                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                    <PlusOutlined />
                    <span className="font-medium">Create Task</span>
                </button>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="pl-10 pr-4 py-2 bg-white/60 border-none rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all w-64 text-sm placeholder-gray-400 shadow-sm"
                    />
                    <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
                </div>

                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 text-gray-600 relative">
                    <BellOutlined className="text-lg" />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                </div>

                <div className="flex items-center gap-3 cursor-pointer pl-2 border-l border-gray-200/50">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-700">John Doe</div>
                        <div className="text-xs text-gray-500">Product Manager</div>
                    </div>
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="User"
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default Header;
