import React from 'react';
import { FlagFilled } from '@ant-design/icons';
import AvatarGroup from './AvatarGroup';
import clsx from 'clsx';

interface Task {
    id: number;
    name: string;
    assignees: { id: string; name: string; avatar: string }[];
    status: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate: string;
}

const MOCK_TASKS: Task[] = [
    {
        id: 1,
        name: "Khảo sát dự án thiết kế xây dựng",
        assignees: [
            { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
            { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' }
        ],
        status: "Đang thực hiện",
        priority: "high",
        dueDate: "Today"
    },
    {
        id: 2,
        name: "Cập nhật tài liệu kỹ thuật",
        assignees: [
            { id: '3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' }
        ],
        status: "Chờ duyệt",
        priority: "medium",
        dueDate: "Tomorrow"
    },
    {
        id: 3,
        name: "Họp review sprint",
        assignees: [
            { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
            { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
            { id: '3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
            { id: '4', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' }
        ],
        status: "Hoàn thành",
        priority: "low",
        dueDate: "Yesterday"
    },
    {
        id: 4,
        name: "Fix bug login page",
        assignees: [
            { id: '4', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' }
        ],
        status: "Đang thực hiện",
        priority: "critical",
        dueDate: "Today"
    }
];

const PriorityFlag = ({ priority }: { priority: Task['priority'] }) => {
    const colors = {
        low: 'text-gray-400',
        medium: 'text-blue-400',
        high: 'text-orange-400',
        critical: 'text-red-500'
    };
    return <FlagFilled className={colors[priority]} />;
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        "Đang thực hiện": "bg-blue-50 text-blue-600 border-blue-100",
        "Chờ duyệt": "bg-orange-50 text-orange-600 border-orange-100",
        "Hoàn thành": "bg-green-50 text-green-600 border-green-100",
    };
    const defaultStyle = "bg-gray-50 text-gray-600 border-gray-100";

    return (
        <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold border", styles[status as keyof typeof styles] || defaultStyle)}>
            {status}
        </span>
    );
};

const TaskList: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-500">All Tasks</span>
                    <span className="px-3 py-1 bg-blue-50 rounded-lg text-xs font-medium text-blue-600">My Tasks</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="p-4 w-12 text-center">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </th>
                            <th className="p-4 font-semibold">Task Name</th>
                            <th className="p-4 font-semibold w-40">Assignees</th>
                            <th className="p-4 font-semibold w-32">Status</th>
                            <th className="p-4 font-semibold w-24 text-center">Priority</th>
                            <th className="p-4 font-semibold w-32 text-right">Due Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {MOCK_TASKS.map((task) => (
                            <tr key={task.id} className="group hover:bg-blue-50/30 transition-colors cursor-pointer">
                                <td className="p-4 text-center">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{task.name}</div>
                                </td>
                                <td className="p-4">
                                    <AvatarGroup users={task.assignees} />
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="p-4 text-center">
                                    <PriorityFlag priority={task.priority} />
                                </td>
                                <td className="p-4 text-right text-sm text-gray-500">
                                    {task.dueDate}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
                <span>Showing 4 of 24 tasks</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">Previous</button>
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default TaskList;
