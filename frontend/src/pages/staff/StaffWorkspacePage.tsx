import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Tag,
    Space,
    Avatar,
    Button,
    List,
    Drawer,
    Timeline,
} from 'antd';
import {
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ApartmentOutlined,
    TeamOutlined,
    HomeOutlined,
    BellOutlined,
    SearchOutlined,
    DownOutlined,
    SendOutlined,
    EyeOutlined,
    EditOutlined,
    FileTextOutlined,
    CommentOutlined,
    CheckSquareOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';

const { Title, Text, Paragraph } = Typography;

// Sidebar Item Component
interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
    return (
        <div className="group flex flex-col items-center gap-1 cursor-pointer mb-6" onClick={onClick}>
            <div
                className={clsx(
                    "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300",
                    active
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                        : "bg-[#F3E8FF] text-gray-600 hover:bg-white hover:shadow-md"
                )}
            >
                <span className="text-xl">{icon}</span>
            </div>
            <span className={clsx(
                "text-[10px] font-medium transition-colors",
                active ? "text-purple-600" : "text-gray-500 group-hover:text-gray-700"
            )}>
                {label}
            </span>
        </div>
    );
};

// Mock staff profile
const MOCK_STAFF = {
    id: 1,
    name: 'Jane Doe',
    title: 'Lead Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    department: { id: 1, name: 'Frontend Development' },
    division: { id: 1, name: 'Engineering Division' },
};

// Mock action required items (work inbox)
const MOCK_ACTION_REQUIRED = [
    {
        id: 1,
        type: 'submit',
        title: 'Dashboard component redesign',
        project: 'Website Redesign',
        step: 'Ready to Submit',
        deadline: '2026-01-15',
    },
    {
        id: 2,
        type: 'review',
        title: 'API documentation review',
        project: 'API Integration',
        step: 'Pending Your Review',
        deadline: '2026-01-14',
    },
    {
        id: 3,
        type: 'update',
        title: 'User feedback integration',
        project: 'Website Redesign',
        step: 'Needs Update - Manager requested changes',
        deadline: '2026-01-16',
    },
];

// Mock active tasks
const MOCK_MY_TASKS = [
    {
        id: 1,
        title: 'Performance optimization',
        project: 'Website Redesign',
        status: 'In Progress',
        deadline: '2026-01-18',
    },
    {
        id: 2,
        title: 'Mobile responsive fixes',
        project: 'Website Redesign',
        status: 'In Progress',
        deadline: '2026-01-20',
    },
    {
        id: 3,
        title: 'Unit test coverage',
        project: 'API Integration',
        status: 'Todo',
        deadline: '2026-01-22',
    },
];

// Mock recent activity
const MOCK_ACTIVITY = [
    { id: 1, type: 'completed', description: 'Completed "Setup project structure"', time: '2 hours ago' },
    { id: 2, type: 'comment', description: 'Commented on "Dashboard wireframes review"', time: '5 hours ago' },
    { id: 3, type: 'assigned', description: 'Assigned to "Performance optimization"', time: 'Yesterday' },
    { id: 4, type: 'submitted', description: 'Submitted "Login page implementation" for review', time: 'Yesterday' },
];

const StaffWorkspacePage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTask, setSelectedTask] = useState<typeof MOCK_MY_TASKS[0] | null>(null);

    const getActionTypeConfig = (type: string) => {
        switch (type) {
            case 'submit':
                return { color: 'green', icon: <SendOutlined />, label: 'Submit', action: 'Submit' };
            case 'review':
                return { color: 'orange', icon: <EyeOutlined />, label: 'Review', action: 'Review' };
            case 'update':
                return { color: 'blue', icon: <EditOutlined />, label: 'Update', action: 'Update' };
            default:
                return { color: 'default', icon: <ClockCircleOutlined />, label: type, action: 'View' };
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'completed':
                return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            case 'comment':
                return <CommentOutlined style={{ color: '#1890ff' }} />;
            case 'assigned':
                return <CheckSquareOutlined style={{ color: '#fa8c16' }} />;
            case 'submitted':
                return <SendOutlined style={{ color: '#722ed1' }} />;
            default:
                return <ClockCircleOutlined />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Progress': return 'processing';
            case 'Review': return 'warning';
            case 'Todo': return 'default';
            case 'Completed': return 'success';
            default: return 'default';
        }
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            {/* Sidebar */}
            <div className="w-[80px] h-screen bg-[#FDFBFB] border-r border-gray-100 flex flex-col items-center py-6 fixed left-0 top-0 z-50">
                <div className="mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        A
                    </div>
                </div>

                <div className="flex-1 flex flex-col w-full overflow-y-auto no-scrollbar">
                    <SidebarItem icon={<HomeOutlined />} label="Home" onClick={() => navigate('/')} />
                    <SidebarItem icon={<UserOutlined />} label="Workspace" active />
                    <SidebarItem icon={<CheckCircleOutlined />} label="My Tasks" />
                    <SidebarItem icon={<TeamOutlined />} label="Department" onClick={() => navigate('/department/dashboard')} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-[80px] flex flex-col">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 bg-transparent backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-white/50">
                            <Avatar size="small" src={MOCK_STAFF.avatar} />
                            <span className="font-semibold text-gray-700">My Workspace</span>
                            <DownOutlined className="text-xs text-gray-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search my tasks..."
                                className="pl-10 pr-4 py-2 bg-white/60 border-none rounded-xl focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all w-64 text-sm placeholder-gray-400 shadow-sm"
                            />
                            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 text-gray-600 relative">
                            <BellOutlined className="text-lg" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                        </div>

                        <div className="flex items-center gap-3 cursor-pointer pl-2 border-l border-gray-200/50">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-700">{MOCK_STAFF.name}</div>
                                <div className="text-xs text-gray-500">{MOCK_STAFF.title}</div>
                            </div>
                            <img
                                src={MOCK_STAFF.avatar}
                                alt="User"
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="mb-6">
                            <Title level={2} className="mb-2">Personal Workspace</Title>
                            <Space>
                                <Tag icon={<TeamOutlined />} color="blue">{MOCK_STAFF.department.name}</Tag>
                                <Tag icon={<ApartmentOutlined />} color="purple">{MOCK_STAFF.division.name}</Tag>
                            </Space>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Action Required & My Tasks */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Action Required Section */}
                                <Card className="shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <ClockCircleOutlined className="text-orange-500" />
                                        </div>
                                        <Title level={4} className="mb-0">Action Required</Title>
                                        <Tag color="orange">{MOCK_ACTION_REQUIRED.length}</Tag>
                                    </div>

                                    <List
                                        dataSource={MOCK_ACTION_REQUIRED}
                                        renderItem={(item) => {
                                            const config = getActionTypeConfig(item.type);
                                            return (
                                                <List.Item
                                                    className="hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors"
                                                    actions={[
                                                        <Button type="primary" size="small" key="action" icon={config.icon}>
                                                            {config.action}
                                                        </Button>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${config.color}-100`}>
                                                                {config.icon}
                                                            </div>
                                                        }
                                                        title={
                                                            <Space>
                                                                <Text strong>{item.title}</Text>
                                                            </Space>
                                                        }
                                                        description={
                                                            <Space size="large" className="text-xs">
                                                                <span><FolderOutlined /> {item.project}</span>
                                                                <span>{item.step}</span>
                                                                <span className="text-orange-500">Due: {item.deadline}</span>
                                                            </Space>
                                                        }
                                                    />
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </Card>

                                {/* My Active Tasks */}
                                <Card className="shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <CheckSquareOutlined className="text-blue-500" />
                                        </div>
                                        <Title level={4} className="mb-0">My Active Tasks</Title>
                                    </div>

                                    <List
                                        dataSource={MOCK_MY_TASKS}
                                        renderItem={(task) => (
                                            <List.Item
                                                className="hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors cursor-pointer"
                                                onClick={() => setSelectedTask(task)}
                                                actions={[
                                                    <Button type="link" size="small" key="open">Open</Button>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <FileTextOutlined className="text-gray-500" />
                                                        </div>
                                                    }
                                                    title={task.title}
                                                    description={
                                                        <Space>
                                                            <Tag>{task.project}</Tag>
                                                            <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                                                            <Text type="secondary" className="text-xs">Due: {task.deadline}</Text>
                                                        </Space>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </div>

                            {/* Right Column - Recent Activity */}
                            <div>
                                <Card className="shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <ClockCircleOutlined className="text-purple-500" />
                                        </div>
                                        <Title level={4} className="mb-0">Recent Activity</Title>
                                    </div>

                                    <Timeline
                                        items={MOCK_ACTIVITY.map((activity) => ({
                                            dot: getActivityIcon(activity.type),
                                            children: (
                                                <div>
                                                    <Paragraph className="mb-1 text-sm">{activity.description}</Paragraph>
                                                    <Text type="secondary" className="text-xs">{activity.time}</Text>
                                                </div>
                                            ),
                                        }))}
                                    />
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Task Detail Drawer */}
            <Drawer
                title={selectedTask?.title}
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                width={480}
            >
                {selectedTask && (
                    <div>
                        <div className="mb-4 pb-4 border-b">
                            <Space className="mb-2">
                                <Tag>{selectedTask.project}</Tag>
                                <Tag color={getStatusColor(selectedTask.status)}>{selectedTask.status}</Tag>
                            </Space>
                            <div className="text-sm text-gray-500">
                                Due: {selectedTask.deadline}
                            </div>
                        </div>

                        <Title level={5}>Description</Title>
                        <Paragraph type="secondary">
                            Task details and description would appear here. This includes all the context
                            needed to complete the task.
                        </Paragraph>

                        <Title level={5}>Workflow Step</Title>
                        <Tag color="processing" className="mb-4">In Progress → Review</Tag>

                        <div className="mt-6 pt-4 border-t flex gap-2">
                            <Button type="primary" icon={<SendOutlined />}>
                                Submit for Review
                            </Button>
                            <Button icon={<CommentOutlined />}>
                                Add Comment
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default StaffWorkspacePage;
