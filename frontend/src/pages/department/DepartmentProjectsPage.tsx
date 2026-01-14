import React, { useState, useMemo } from 'react';
import {
    Card,
    Button,
    Space,
    Tag,
    Typography,
    Input,
    Select,
    DatePicker,
    Modal,
    Form,
    message,
    Empty,
    Spin,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    RightOutlined,
    FolderOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
    fetchProjects,
    createProject,
    ProjectResponse,
    CreateProjectRequest,
    ProjectStatus,
} from '../../api/project.api';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';
import {
    TeamOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const DepartmentProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const [form] = Form.useForm();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchName, setSearchName] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>(ProjectStatus.ACTIVE);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

    const departmentId = user?.department?.id;
    const isDepartmentLeader = useMemo(() => {
        return user?.roles?.some(role => role.name === 'DEPARTMENT_LEADER') || false;
    }, [user]);

    const { data: projectsData, isLoading } = useQuery({
        queryKey: ['projects', pagination.current - 1, pagination.pageSize, departmentId, searchName, filterStatus],
        queryFn: () => fetchProjects(
            pagination.current - 1,
            pagination.pageSize,
            departmentId,
            searchName || undefined,
            filterStatus || ProjectStatus.ACTIVE
        ),
        enabled: !!departmentId,
    });

    const createMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            message.success('Project created successfully');
            setIsCreateModalOpen(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: () => {
            message.error('Failed to create project');
        },
    });

    const handleCreate = () => {
        form.resetFields();
        setIsCreateModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const { dateRange } = values;

            const createData: CreateProjectRequest = {
                departmentId: departmentId!,
                name: values.name,
                description: values.description,
                beginDate: dateRange?.[0] ? dateRange[0].toISOString() : undefined,
                endDate: dateRange?.[1] ? dateRange[1].toISOString() : undefined,
            };
            createMutation.mutate(createData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCancel = () => {
        setIsCreateModalOpen(false);
        form.resetFields();
    };

    const handleOpenProject = (project: ProjectResponse) => {
        navigate(`/department/projects/${project.id}`);
    };

    const getStatusConfig = (status: ProjectStatus) => {
        const configs: Record<ProjectStatus, { color: string; text: string; bgColor: string }> = {
            [ProjectStatus.DRAFT]: { color: '#8c8c8c', text: 'DRAFT', bgColor: '#f5f5f5' },
            [ProjectStatus.ACTIVE]: { color: '#1890ff', text: 'ACTIVE', bgColor: '#e6f7ff' },
            [ProjectStatus.CLOSED]: { color: '#8c8c8c', text: 'CLOSED', bgColor: '#f5f5f5' },
            [ProjectStatus.ON_HOLD]: { color: '#faad14', text: 'ON HOLD', bgColor: '#fffbe6' },
        };
        return configs[status] || { color: '#8c8c8c', text: status, bgColor: '#f5f5f5' };
    };

    const getDateInfo = (project: ProjectResponse) => {
        const today = dayjs();
        
        if (project.beginDate) {
            const beginDate = dayjs(project.beginDate);
            if (beginDate.isAfter(today)) {
                const daysUntilStart = beginDate.diff(today, 'day');
                return { type: 'start', days: daysUntilStart };
            }
        }
        
        if (project.status === ProjectStatus.ACTIVE && project.endDate) {
            const endDate = dayjs(project.endDate);
            if (endDate.isAfter(today)) {
                const daysUntilEnd = endDate.diff(today, 'day');
                return { type: 'end', days: daysUntilEnd };
            }
        }
        
        return null;
    };

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
            key: 'project',
            icon: <ProjectOutlined />,
            label: 'Project',
            path: '/department/projects',
        },
    ];

    const projects = projectsData?.content || [];

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem="project"
            themeColor="green"
        >
            <div className="max-w-7xl mx-auto px-4">
                <Card
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                    }}
                    bodyStyle={{ padding: 24 }}
                >
                    {/* Workspace Header */}
                    <div className="mb-5 pb-4 border-b border-gray-200">
                        <div className="mb-4">
                            <Title level={2} className="mb-0" style={{ fontWeight: 600, fontSize: 22, color: '#262626' }}>
                                Projects
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400, color: '#8c8c8c' }}>
                                Workspace · {user?.department?.name || 'Department'}
                            </Text>
                        </div>

                        {/* Workspace Control Bar */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <Input
                                placeholder="Search projects..."
                                prefix={<SearchOutlined />}
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                style={{ width: 280 }}
                                allowClear
                            />
                            <Select
                                placeholder="Status"
                                value={filterStatus}
                                onChange={(value) => setFilterStatus(value || ProjectStatus.ACTIVE)}
                                style={{ width: 140 }}
                                allowClear
                            >
                                <Select.Option value={ProjectStatus.DRAFT}>Draft</Select.Option>
                                <Select.Option value={ProjectStatus.ACTIVE}>Active</Select.Option>
                                <Select.Option value={ProjectStatus.CLOSED}>Closed</Select.Option>
                                <Select.Option value={ProjectStatus.ON_HOLD}>On Hold</Select.Option>
                            </Select>
                            {isDepartmentLeader && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreate}
                                    size="middle"
                                >
                                    Create Project
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Project Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <Spin size="large" />
                        </div>
                    ) : projects.length === 0 ? (
                        <Empty
                            description="No projects found"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]">
                        {projects.map((project) => {
                            const statusConfig = getStatusConfig(project.status);
                            return (
                                <Card
                                    key={project.id}
                                    hoverable
                                    className="transition-all hover:shadow-lg"
                                    style={{
                                        borderRadius: 12,
                                        border: '1px solid #52c41a',
                                        background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 55%, #f0f5ff 100%)',
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                                    }}
                                    bodyStyle={{ padding: 16 }}
                                    actions={[
                                        <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f0f0' }}>
                                            <Button
                                                type="text"
                                                icon={<RightOutlined />}
                                                onClick={() => handleOpenProject(project)}
                                                size="small"
                                                style={{ 
                                                    color: '#8c8c8c',
                                                    fontWeight: 400,
                                                    fontSize: 12
                                                }}
                                            >
                                                Open
                                            </Button>
                                        </div>
                                    ]}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <Space className="flex-1 min-w-0" size={8}>
                                            <FolderOutlined 
                                                style={{ 
                                                    color: '#1890ff', 
                                                    fontSize: 16,
                                                    flexShrink: 0,
                                                    marginTop: 2
                                                }} 
                                            />
                                            <Title 
                                                level={4} 
                                                style={{ 
                                                    margin: 0,
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    lineHeight: 1.4,
                                                    color: '#0050b3'
                                                }}
                                                className="truncate"
                                            >
                                                {project.name}
                                            </Title>
                                        </Space>
                                        <Tag 
                                            style={{ 
                                                flexShrink: 0,
                                                fontSize: 10,
                                                fontWeight: 600,
                                                padding: '3px 10px',
                                                borderRadius: 12,
                                                backgroundColor: statusConfig.bgColor,
                                                color: statusConfig.color,
                                                border: 'none',
                                                margin: 0
                                            }}
                                        >
                                            {statusConfig.text}
                                        </Tag>
                                    </div>

                                    {/* Body */}
                                    <div>
                                        {/* Context Block - Metadata grouped */}
                                        <div className="mb-3">
                                            {(() => {
                                                const dateInfo = getDateInfo(project);
                                                if (dateInfo) {
                                                    const isStart = dateInfo.type === 'start';
                                                    const iconColor = isStart ? '#52c41a' : '#ff7875';
                                                    const textColor = isStart ? '#389e0d' : '#cf1322';
                                                    
                                                    return (
                                                        <div className="mb-2">
                                                            <Space size={6}>
                                                                <CalendarOutlined 
                                                                    style={{ 
                                                                        fontSize: 12,
                                                                        color: iconColor
                                                                    }} 
                                                                />
                                                                <Text 
                                                                    style={{ 
                                                                        fontSize: 12,
                                                                        fontWeight: 500,
                                                                        color: textColor
                                                                    }}
                                                                >
                                                                    {isStart
                                                                        ? `Starts in ${dateInfo.days} ${dateInfo.days === 1 ? 'day' : 'days'}`
                                                                        : `Due in ${dateInfo.days} ${dateInfo.days === 1 ? 'day' : 'days'}`
                                                                    }
                                                                </Text>
                                                            </Space>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {/* Description */}
                                            <div>
                                                <Text 
                                                    type="secondary" 
                                                    style={{ 
                                                        fontSize: 11,
                                                        fontWeight: 500,
                                                        color: '#8c8c8c',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 0.5,
                                                        display: 'block',
                                                        marginBottom: 4
                                                    }}
                                                >
                                                    Description
                                                </Text>
                                                {project.description ? (
                                                    <Paragraph
                                                        ellipsis={{ rows: 2, expandable: false }}
                                                        style={{ 
                                                            marginBottom: 0,
                                                            fontSize: 13,
                                                            lineHeight: 1.5,
                                                            color: '#434343'
                                                        }}
                                                    >
                                                        {project.description}
                                                    </Paragraph>
                                                ) : (
                                                    <Text
                                                        type="secondary"
                                                        style={{ 
                                                            fontSize: 13,
                                                            lineHeight: 1.5,
                                                            color: '#bfbfbf',
                                                            fontStyle: 'italic'
                                                        }}
                                                    >
                                                        No description provided
                                                    </Text>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                    {/* Pagination */}
                    {projectsData && projectsData.totalElements > pagination.pageSize && (
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
                            <Space>
                                <Button
                                    disabled={pagination.current === 1}
                                    onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                                >
                                    Previous
                                </Button>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    Page {pagination.current} of {projectsData.totalPages}
                                </Text>
                                <Button
                                    disabled={pagination.current >= projectsData.totalPages}
                                    onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                                >
                                    Next
                                </Button>
                            </Space>
                        </div>
                    )}
                </Card>

                <Modal
                    title="Create Project"
                    open={isCreateModalOpen}
                    onOk={handleSubmit}
                    onCancel={handleCancel}
                    width={520}
                    confirmLoading={createMutation.isPending}
                    okText="Create"
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
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
                            <TextArea
                                rows={4}
                                placeholder="Enter project description"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Date Range"
                            name="dateRange"
                        >
                            <RangePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </WorkspaceLayout>
    );
};

export default DepartmentProjectsPage;
