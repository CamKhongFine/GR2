import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Tabs,
    Tag,
    Space,
    Avatar,
    Button,
    List,
    Progress,
    Modal,
    Form,
    Input,
    Select,
    Drawer,
} from 'antd';
import {
    ProjectOutlined,
    RightOutlined,
    UserOutlined,
    HomeOutlined,
    ApartmentOutlined,
    BellOutlined,
    SearchOutlined,
    DownOutlined,
    PlusOutlined,
    TeamOutlined,
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

// Mock data for division
const MOCK_DIVISION = {
    id: 1,
    name: 'Engineering Division',
    description: 'Responsible for all technical projects and product development initiatives across the organization.',
    leader: { id: 1, name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
};

// Mock projects
const MOCK_PROJECTS = [
    {
        id: 1,
        name: 'Website Redesign',
        description: 'Complete overhaul of company website',
        status: 'active',
        progress: 65,
        activeTasks: 12,
        departments: ['Frontend Development', 'Design'],
        dueDate: '2026-02-15',
    },
    {
        id: 2,
        name: 'Mobile App v2.0',
        description: 'Next generation mobile application',
        status: 'planning',
        progress: 20,
        activeTasks: 5,
        departments: ['Mobile Development'],
        dueDate: '2026-03-30',
    },
    {
        id: 3,
        name: 'API Integration Platform',
        description: 'Central API management system',
        status: 'review',
        progress: 85,
        activeTasks: 3,
        departments: ['Backend Development', 'DevOps'],
        dueDate: '2026-01-25',
    },
];

// Mock departments
const MOCK_DEPARTMENTS = [
    { id: 1, name: 'Frontend Development', leader: 'Jane Doe', memberCount: 8, activeTasks: 12 },
    { id: 2, name: 'Backend Development', leader: 'Bob Johnson', memberCount: 10, activeTasks: 15 },
    { id: 3, name: 'Quality Assurance', leader: 'Alice Smith', memberCount: 4, activeTasks: 8 },
    { id: 4, name: 'DevOps', leader: 'Mike Wilson', memberCount: 2, activeTasks: 5 },
];

// Mock staff
const MOCK_STAFF = [
    { id: 1, name: 'Jane Doe', role: 'Lead Developer', department: 'Frontend Development', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: 2, name: 'Bob Johnson', role: 'Senior Developer', department: 'Backend Development', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    { id: 3, name: 'Alice Smith', role: 'QA Lead', department: 'Quality Assurance', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
    { id: 4, name: 'Mike Wilson', role: 'DevOps Engineer', department: 'DevOps', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    { id: 5, name: 'Sarah Chen', role: 'Developer', department: 'Frontend Development', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 6, name: 'Tom Brown', role: 'Developer', department: 'Backend Development', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' },
];

const DivisionDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('projects');
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<typeof MOCK_PROJECTS[0] | null>(null);
    const [form] = Form.useForm();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'processing';
            case 'planning': return 'default';
            case 'review': return 'warning';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Active';
            case 'planning': return 'Planning';
            case 'review': return 'In Review';
            case 'completed': return 'Completed';
            default: return status;
        }
    };

    const handleCreateProject = async () => {
        try {
            await form.validateFields();
            setIsCreateProjectModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const tabItems = [
        {
            key: 'projects',
            label: (
                <span className="flex items-center gap-2">
                    <ProjectOutlined />
                    Projects
                </span>
            ),
            children: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_PROJECTS.map((project) => (
                        <Card
                            key={project.id}
                            hoverable
                            className="shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => setSelectedProject(project)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FolderOutlined className="text-blue-500 text-lg" />
                                    <Text strong className="text-base">{project.name}</Text>
                                </div>
                                <Tag color={getStatusColor(project.status)}>{getStatusLabel(project.status)}</Tag>
                            </div>
                            <Paragraph type="secondary" ellipsis={{ rows: 2 }} className="mb-3 text-sm">
                                {project.description}
                            </Paragraph>
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <Progress percent={project.progress} showInfo={false} size="small" />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <Space size={4}>
                                    <Tag color="blue">{project.activeTasks} tasks</Tag>
                                </Space>
                                <Text type="secondary" className="text-xs">Due: {project.dueDate}</Text>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <Text type="secondary" className="text-xs">Departments: </Text>
                                {project.departments.map((dept, idx) => (
                                    <Tag key={idx} className="text-xs">{dept}</Tag>
                                ))}
                            </div>
                        </Card>
                    ))}

                    {/* Create New Project Card */}
                    <Card
                        hoverable
                        className="shadow-sm hover:shadow-md transition-shadow border-dashed border-2 border-gray-200 flex items-center justify-center min-h-[200px]"
                        onClick={() => setIsCreateProjectModalOpen(true)}
                    >
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <PlusOutlined className="text-blue-500 text-xl" />
                            </div>
                            <Text strong className="text-gray-600">Create New Project</Text>
                        </div>
                    </Card>
                </div>
            ),
        },
        {
            key: 'departments',
            label: (
                <span className="flex items-center gap-2">
                    <ApartmentOutlined />
                    Departments
                </span>
            ),
            children: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MOCK_DEPARTMENTS.map((dept) => (
                        <Card
                            key={dept.id}
                            hoverable
                            className="shadow-sm hover:shadow-md transition-shadow"
                            onClick={() => navigate('/department/dashboard')}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TeamOutlined className="text-green-600" />
                                </div>
                                <div>
                                    <Text strong>{dept.name}</Text>
                                    <div className="text-xs text-gray-500">Leader: {dept.leader}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <Space>
                                    <Tag>{dept.memberCount} members</Tag>
                                    <Tag color="blue">{dept.activeTasks} tasks</Tag>
                                </Space>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                                <Button type="link" size="small" icon={<RightOutlined />}>
                                    Open Workspace
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ),
        },
        {
            key: 'staff',
            label: (
                <span className="flex items-center gap-2">
                    <UserOutlined />
                    Staff
                </span>
            ),
            children: (
                <Card className="shadow-sm">
                    <List
                        dataSource={MOCK_STAFF}
                        renderItem={(staff) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src={staff.avatar} icon={<UserOutlined />} />}
                                    title={staff.name}
                                    description={
                                        <Space>
                                            <Text type="secondary">{staff.role}</Text>
                                            <Tag>{staff.department}</Tag>
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            ),
        },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Sidebar */}
            <div className="w-[80px] h-screen bg-[#FDFBFB] border-r border-gray-100 flex flex-col items-center py-6 fixed left-0 top-0 z-50">
                <div className="mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        A
                    </div>
                </div>

                <div className="flex-1 flex flex-col w-full overflow-y-auto no-scrollbar">
                    <SidebarItem icon={<HomeOutlined />} label="Home" onClick={() => navigate('/')} />
                    <SidebarItem icon={<ApartmentOutlined />} label="Division" active />
                    <SidebarItem icon={<ProjectOutlined />} label="Projects" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-[80px] flex flex-col">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 bg-transparent backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-white/50">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">D</div>
                            <span className="font-semibold text-gray-700">{MOCK_DIVISION.name}</span>
                            <DownOutlined className="text-xs text-gray-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="pl-10 pr-4 py-2 bg-white/60 border-none rounded-xl focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all w-64 text-sm placeholder-gray-400 shadow-sm"
                            />
                            <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>

                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 text-gray-600 relative">
                            <BellOutlined className="text-lg" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                        </div>

                        <div className="flex items-center gap-3 cursor-pointer pl-2 border-l border-gray-200/50">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-700">{MOCK_DIVISION.leader.name}</div>
                                <div className="text-xs text-gray-500">Division Leader</div>
                            </div>
                            <img
                                src={MOCK_DIVISION.leader.avatar}
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
                        <div className="mb-8">
                            <Title level={2} className="mb-2">Division Workspace</Title>
                            <Paragraph type="secondary" className="text-base max-w-2xl">
                                {MOCK_DIVISION.description}
                            </Paragraph>
                        </div>

                        {/* Tabs */}
                        <Card className="shadow-sm">
                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                items={tabItems}
                                size="large"
                            />
                        </Card>
                    </div>
                </main>
            </div>

            {/* Create Project Modal */}
            <Modal
                title="Create New Project"
                open={isCreateProjectModalOpen}
                onCancel={() => {
                    setIsCreateProjectModalOpen(false);
                    form.resetFields();
                }}
                onOk={handleCreateProject}
                okText="Create Project"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        label="Project Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter project name' }]}
                    >
                        <Input placeholder="Enter project name" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea rows={3} placeholder="Enter project description" />
                    </Form.Item>
                    <Form.Item
                        label="Assigned Departments"
                        name="departments"
                        rules={[{ required: true, message: 'Please select departments' }]}
                    >
                        <Select mode="multiple" placeholder="Select departments">
                            {MOCK_DEPARTMENTS.map((dept) => (
                                <Select.Option key={dept.id} value={dept.name}>{dept.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Project Detail Drawer */}
            <Drawer
                title={selectedProject?.name}
                open={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                width={480}
            >
                {selectedProject && (
                    <div>
                        <div className="mb-4">
                            <Tag color={getStatusColor(selectedProject.status)} className="mb-2">
                                {getStatusLabel(selectedProject.status)}
                            </Tag>
                            <Paragraph>{selectedProject.description}</Paragraph>
                        </div>
                        <div className="mb-4">
                            <Text strong>Progress</Text>
                            <Progress percent={selectedProject.progress} className="mt-2" />
                        </div>
                        <div className="mb-4">
                            <Text strong>Active Tasks: </Text>
                            <Tag color="blue">{selectedProject.activeTasks}</Tag>
                        </div>
                        <div className="mb-4">
                            <Text strong>Due Date: </Text>
                            <Text>{selectedProject.dueDate}</Text>
                        </div>
                        <div>
                            <Text strong>Departments:</Text>
                            <div className="mt-2">
                                {selectedProject.departments.map((dept, idx) => (
                                    <Tag key={idx}>{dept}</Tag>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <Button type="primary" block>
                                Open Project Workspace
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default DivisionDashboardPage;
