import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import TaskList from '../components/tasks/TaskList';

const AppWorkspace: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <Sidebar />

            <div className="flex-1 ml-[80px] flex flex-col">
                <Header />

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Overview</h1>
                            <p className="text-gray-500">Manage your tasks and collaborate with your team.</p>
                        </div>

                        <TaskList />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppWorkspace;
