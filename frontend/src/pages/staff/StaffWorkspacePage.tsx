import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Tag,
    Space,
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
    SendOutlined,
    EyeOutlined,
    EditOutlined,
    FileTextOutlined,
    CommentOutlined,
    CheckSquareOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';

const { Title, Text, Paragraph } = Typography;

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
    const { user } = useUserStore();

    // Get department name from user data
    const departmentName = user?.department?.name || 'Department';

    // Sidebar items configuration
    const sidebarItems: SidebarItemConfig[] = [
        {
            key: 'workspace',
            icon: <UserOutlined />,
            label: 'Workspace',
            path: '/staff/workspace',
        },
        {
            key: 'my-tasks',
            icon: <CheckSquareOutlined />,
            label: 'My Tasks',
            path: '/staff/tasks',
        },
        {
            key: 'department',
            icon: <TeamOutlined />,
            label: departmentName,
            path: '/department/dashboard',
        },
    ];

    // Left header content - Department prominently displayed
    const leftHeaderContent = (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 rounded-xl shadow-lg">
                <span className="font-bold text-white text-base">{departmentName}</span>
            </div>
        </div>
    );

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
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem="workspace"
            themeColor="green"
            headerOverSidebar
            leftHeaderContent={leftHeaderContent}
        >
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
        </WorkspaceLayout>
    );
};

export default StaffWorkspacePage;
