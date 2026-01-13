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
    Form,
    Input,
    Select,
    DatePicker,
    message,
    Badge,
    Collapse,
} from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    ApartmentOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    EditOutlined,
    AlertOutlined,
    FolderOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

// Mock data for department
const MOCK_DEPARTMENT = {
    id: 1,
    name: 'Frontend Development',
    description: 'Responsible for all frontend development and UI/UX implementation.',
    division: { id: 1, name: 'Engineering Division' },
    leader: { id: 1, name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
};

// Mock action required items (workflow bottlenecks)
const MOCK_ACTION_REQUIRED = [
    {
        id: 1,
        type: 'overdue',
        title: 'Fix payment validation bug',
        project: 'Website Redesign',
        step: 'Development',
        assignee: { name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
        dueDate: '2026-01-10',
    },
    {
        id: 2,
        type: 'review',
        title: 'API documentation updates',
        project: 'API Integration',
        step: 'Pending Review',
        assignee: { name: 'Alice Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
        dueDate: '2026-01-14',
    },
    {
        id: 3,
        type: 'blocked',
        title: 'Database migration script',
        project: 'Website Redesign',
        step: 'Blocked - Waiting for DB access',
        assignee: { name: 'Bob Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
        dueDate: '2026-01-16',
    },
];

// Mock active tasks grouped by project
const MOCK_TASKS_BY_PROJECT = [
    {
        projectId: 1,
        projectName: 'Website Redesign',
        tasks: [
            { id: 1, title: 'Dashboard component redesign', status: 'In Progress', assignee: 'Jane Doe', dueDate: '2026-01-18' },
            { id: 2, title: 'Responsive layout fixes', status: 'Review', assignee: 'John Smith', dueDate: '2026-01-15' },
            { id: 3, title: 'Performance optimization', status: 'In Progress', assignee: 'Alice Brown', dueDate: '2026-01-20' },
        ],
    },
    {
        projectId: 2,
        projectName: 'API Integration',
        tasks: [
            { id: 4, title: 'Authentication module', status: 'In Progress', assignee: 'Bob Wilson', dueDate: '2026-01-17' },
            { id: 5, title: 'Error handling improvements', status: 'Todo', assignee: 'Sarah Chen', dueDate: '2026-01-19' },
        ],
    },
    {
        projectId: 3,
        projectName: 'Mobile App v2.0',
        tasks: [
            { id: 6, title: 'Push notification setup', status: 'Todo', assignee: 'Tom Brown', dueDate: '2026-01-22' },
        ],
    },
];

// Mock staff
const MOCK_STAFF = [
    { id: 1, name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', taskCount: 5, overdue: 0 },
    { id: 2, name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', taskCount: 3, overdue: 1 },
    { id: 3, name: 'Alice Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', taskCount: 4, overdue: 0 },
    { id: 4, name: 'Bob Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', taskCount: 2, overdue: 1 },
    { id: 5, name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', taskCount: 3, overdue: 0 },
];

const DepartmentDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [isCreateTaskDrawerOpen, setIsCreateTaskDrawerOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<typeof MOCK_STAFF[0] | null>(null);
    const [form] = Form.useForm();
    const { user } = useUserStore();

    // Get department name from user data
    const departmentName = user?.department?.name || 'Department';

    // Sidebar items configuration
    const sidebarItems: SidebarItemConfig[] = [
        {
            key: 'department',
            icon: <TeamOutlined />,
            label: 'Department',
            path: '/department/dashboard',
        },
        {
            key: 'my-tasks',
            icon: <CheckSquareOutlined />,
            label: 'My Task',
            path: '/department/my-tasks',
        },
        {
            key: 'division',
            icon: <ApartmentOutlined />,
            label: 'Division',
            path: '/division/dashboard',
        },
    ];

    // Left header content - Department prominently displayed
    const leftHeaderContent = (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 px-5 py-2.5 rounded-xl shadow-lg">
                <span className="font-bold text-white text-base">{departmentName}</span>
            </div>

            <button
                className="bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 border-none"
                onClick={() => setIsCreateTaskDrawerOpen(true)}
            >
                <PlusOutlined />
                <span className="font-bold text-base">Create Task</span>
            </button>
        </div>
    );

    const getActionTypeConfig = (type: string) => {
        switch (type) {
            case 'overdue':
                return { color: 'red', icon: <ExclamationCircleOutlined />, label: 'Overdue', action: 'View' };
            case 'review':
                return { color: 'orange', icon: <EyeOutlined />, label: 'Waiting Review', action: 'Review' };
            case 'blocked':
                return { color: 'volcano', icon: <AlertOutlined />, label: 'Blocked', action: 'Resolve' };
            default:
                return { color: 'default', icon: <ClockCircleOutlined />, label: type, action: 'View' };
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

    const handleCreateTask = async () => {
        try {
            await form.validateFields();
            message.success('Task created successfully');
            setIsCreateTaskDrawerOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem="department"
            themeColor="green"
            leftHeaderContent={leftHeaderContent}
        >
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Title level={2} className="mb-0">Department Workspace</Title>
                        <Tag color="blue">{MOCK_DEPARTMENT.division.name}</Tag>
                    </div>
                    <Paragraph type="secondary">{MOCK_DEPARTMENT.description}</Paragraph>
                </div>

                {/* Action Required Section */}
                <Card className="shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ExclamationCircleOutlined className="text-orange-500 text-lg" />
                        <Title level={4} className="mb-0">Action Required</Title>
                        <Badge count={MOCK_ACTION_REQUIRED.length} />
                    </div>

                    <List
                        dataSource={MOCK_ACTION_REQUIRED}
                        renderItem={(item) => {
                            const config = getActionTypeConfig(item.type);
                            return (
                                <List.Item
                                    className="hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors"
                                    actions={[
                                        <Button type="primary" size="small" key="action">
                                            {config.action}
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${config.color}-100 text-${config.color}-600`}>
                                                {config.icon}
                                            </div>
                                        }
                                        title={
                                            <Space>
                                                <Text strong>{item.title}</Text>
                                                <Tag color={config.color}>{config.label}</Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space size="large">
                                                <span><FolderOutlined /> {item.project}</span>
                                                <span>Step: {item.step}</span>
                                                <span>
                                                    <Avatar size="small" src={item.assignee.avatar} className="mr-1" />
                                                    {item.assignee.name}
                                                </span>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                </Card>

                {/* Active Tasks by Project */}
                <Card className="shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircleOutlined className="text-blue-500 text-lg" />
                        <Title level={4} className="mb-0">Active Tasks</Title>
                    </div>

                    <Collapse defaultActiveKey={['1', '2']} ghost>
                        {MOCK_TASKS_BY_PROJECT.map((project) => (
                            <Panel
                                header={
                                    <Space>
                                        <FolderOutlined className="text-blue-500" />
                                        <Text strong>{project.projectName}</Text>
                                        <Tag>{project.tasks.length} tasks</Tag>
                                    </Space>
                                }
                                key={project.projectId}
                            >
                                <List
                                    size="small"
                                    dataSource={project.tasks}
                                    renderItem={(task) => (
                                        <List.Item
                                            className="hover:bg-gray-50 rounded px-2 -mx-2 transition-colors cursor-pointer"
                                            actions={[
                                                <Button type="link" size="small" key="open" icon={<EditOutlined />}>
                                                    Open
                                                </Button>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={task.title}
                                                description={
                                                    <Space>
                                                        <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                                                        <Text type="secondary">{task.assignee}</Text>
                                                        <Text type="secondary">Due: {task.dueDate}</Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Panel>
                        ))}
                    </Collapse>
                </Card>

                {/* Staff Load */}
                <Card className="shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TeamOutlined className="text-purple-500 text-lg" />
                        <Title level={4} className="mb-0">Staff Load</Title>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {MOCK_STAFF.map((staff) => (
                            <div
                                key={staff.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() => setSelectedStaff(staff)}
                            >
                                <Avatar src={staff.avatar} size="small" />
                                <Text>{staff.name}</Text>
                                <Tag color={staff.overdue > 0 ? 'red' : 'blue'}>
                                    {staff.taskCount} tasks
                                </Tag>
                                {staff.overdue > 0 && (
                                    <Tag color="red">{staff.overdue} overdue</Tag>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Create Task Drawer */}
            <Drawer
                title="Create New Task"
                width={480}
                open={isCreateTaskDrawerOpen}
                onClose={() => {
                    setIsCreateTaskDrawerOpen(false);
                    form.resetFields();
                }}
                extra={
                    <Space>
                        <Button onClick={() => setIsCreateTaskDrawerOpen(false)}>Cancel</Button>
                        <Button type="primary" onClick={handleCreateTask}>Create</Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Task Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter task title' }]}
                    >
                        <Input placeholder="Enter task title" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <TextArea rows={3} placeholder="Enter task description" />
                    </Form.Item>
                    <Form.Item
                        label="Project"
                        name="projectId"
                        rules={[{ required: true, message: 'Please select a project' }]}
                    >
                        <Select placeholder="Select project">
                            {MOCK_TASKS_BY_PROJECT.map((p) => (
                                <Select.Option key={p.projectId} value={p.projectId}>{p.projectName}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Assignee"
                        name="assigneeId"
                        rules={[{ required: true, message: 'Please select an assignee' }]}
                    >
                        <Select placeholder="Select assignee">
                            {MOCK_STAFF.map((staff) => (
                                <Select.Option key={staff.id} value={staff.id}>
                                    <Space>
                                        <Avatar size="small" src={staff.avatar} />
                                        {staff.name}
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Due Date"
                        name="dueDate"
                        rules={[{ required: true, message: 'Please select due date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Drawer>

            {/* Staff Detail Drawer */}
            <Drawer
                title={selectedStaff?.name}
                open={!!selectedStaff}
                onClose={() => setSelectedStaff(null)}
                width={400}
            >
                {selectedStaff && (
                    <div>
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                            <Avatar src={selectedStaff.avatar} size={48} />
                            <div>
                                <Text strong className="text-lg">{selectedStaff.name}</Text>
                                <div>
                                    <Tag color="blue">{selectedStaff.taskCount} active tasks</Tag>
                                    {selectedStaff.overdue > 0 && (
                                        <Tag color="red">{selectedStaff.overdue} overdue</Tag>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Title level={5}>Assigned Tasks</Title>
                        <List
                            size="small"
                            dataSource={[
                                { title: 'Dashboard redesign', status: 'In Progress', due: 'Jan 18' },
                                { title: 'API integration', status: 'Review', due: 'Jan 15' },
                            ]}
                            renderItem={(task) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={task.title}
                                        description={
                                            <Space>
                                                <Tag>{task.status}</Tag>
                                                <Text type="secondary">Due: {task.due}</Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </Drawer>
        </WorkspaceLayout>
    );
};

export default DepartmentDashboardPage;
