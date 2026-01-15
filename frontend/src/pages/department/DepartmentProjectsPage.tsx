import React, { useState, useMemo } from 'react';
import {
    Card,
    Button,
    Space,
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
    ClockCircleOutlined,
    CheckCircleOutlined,
    PauseCircleOutlined,
    InboxOutlined,
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
        const configs: Record<ProjectStatus, { bg: string; text: string; icon: React.ReactNode }> = {
            [ProjectStatus.DRAFT]: {
                bg: '#9ca3af',
                text: 'DRAFT',
                icon: <ClockCircleOutlined style={{ fontSize: 11 }} />,
            },
            [ProjectStatus.ACTIVE]: {
                bg: '#10b981',
                text: 'ACTIVE',
                icon: <CheckCircleOutlined style={{ fontSize: 11 }} />,
            },
            [ProjectStatus.CLOSED]: {
                bg: '#6b7280',
                text: 'CLOSED',
                icon: <CheckCircleOutlined style={{ fontSize: 11 }} />,
            },
            [ProjectStatus.ON_HOLD]: {
                bg: '#f59e0b',
                text: 'ON HOLD',
                icon: <PauseCircleOutlined style={{ fontSize: 11 }} />,
            },
        };
        return configs[status] || configs[ProjectStatus.ACTIVE];
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
            key: 'my-requests',
            icon: <CheckSquareOutlined />,
            label: 'My Request',
            path: '/department/my-requests',
        },
        {
            key: 'project',
            icon: <ProjectOutlined />,
            label: 'Project',
            path: '/department/projects',
        },
    ];

    const projects = projectsData?.content || [];
    const totalProjects = projectsData?.totalElements || 0;
    const activeCount = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem="project"
            themeColor="green"
        >
            <div className="max-w-7xl mx-auto px-4">
                {/* Modern Header with Stats */}
                <div
                    style={{
                        background: '#4f46e5',
                        borderRadius: 16,
                        padding: '28px 32px',
                        marginBottom: 24,
                        boxShadow: '0 10px 40px rgba(79, 70, 229, 0.25)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: 28 }}>
                                Projects
                            </Title>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15 }}>
                                {user?.department?.name || 'Department'} Workspace
                            </Text>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 12,
                                    padding: '14px 20px',
                                    textAlign: 'center',
                                    minWidth: 90,
                                }}
                            >
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                                    {totalProjects}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                    Total
                                </div>
                            </div>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 12,
                                    padding: '14px 20px',
                                    textAlign: 'center',
                                    minWidth: 90,
                                }}
                            >
                                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                                    {activeCount}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 16,
                        marginBottom: 20,
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {isDepartmentLeader && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleCreate}
                                style={{
                                    height: 42,
                                    paddingLeft: 20,
                                    paddingRight: 20,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    borderRadius: 10,
                                    background: '#4f46e5',
                                    border: 'none',
                                }}
                            >
                                New Project
                            </Button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Input
                            placeholder="Search projects..."
                            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            style={{
                                width: 260,
                                height: 42,
                                borderRadius: 10,
                                border: '1px solid #e5e7eb',
                            }}
                            allowClear
                        />
                        <Select
                            placeholder="Status"
                            value={filterStatus}
                            onChange={(value) => setFilterStatus(value || ProjectStatus.ACTIVE)}
                            style={{ width: 140, height: 42 }}
                            allowClear
                        >
                            <Select.Option value={ProjectStatus.DRAFT}>Draft</Select.Option>
                            <Select.Option value={ProjectStatus.ACTIVE}>Active</Select.Option>
                            <Select.Option value={ProjectStatus.CLOSED}>Closed</Select.Option>
                            <Select.Option value={ProjectStatus.ON_HOLD}>On Hold</Select.Option>
                        </Select>
                    </div>
                </div>

                {/* Project Grid */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16, color: '#6b7280' }}>Loading projects...</div>
                    </div>
                ) : projects.length === 0 ? (
                    <Card
                        style={{
                            borderRadius: 16,
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: '#d1fae5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                }}
                            >
                                <InboxOutlined style={{ fontSize: 36, color: '#10b981' }} />
                            </div>
                            <Title level={4} style={{ color: '#374151', marginBottom: 8 }}>
                                No projects found
                            </Title>
                            <Text style={{ color: '#9ca3af' }}>
                                {isDepartmentLeader
                                    ? 'Create your first project to get started'
                                    : 'No projects available in this department'}
                            </Text>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.map((project) => {
                            const statusConfig = getStatusConfig(project.status);
                            const dateInfo = getDateInfo(project);

                            return (
                                <Card
                                    key={project.id}
                                    hoverable
                                    className="transition-all duration-300"
                                    style={{
                                        borderRadius: 16,
                                        border: 'none',
                                        background: '#ffffff',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                        overflow: 'hidden',
                                    }}
                                    bodyStyle={{ padding: 0 }}
                                    onClick={() => handleOpenProject(project)}
                                >
                                    {/* Card Header */}
                                    <div
                                        style={{
                                            background: '#f0fdf4',
                                            padding: '20px 20px 16px',
                                            borderBottom: '1px solid #e5e7eb',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 10,
                                                        background: '#10b981',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <FolderOutlined style={{ fontSize: 18, color: '#fff' }} />
                                                </div>
                                                <Title
                                                    level={5}
                                                    style={{
                                                        margin: 0,
                                                        fontWeight: 600,
                                                        fontSize: 16,
                                                        color: '#065f46',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {project.name}
                                                </Title>
                                            </div>
                                            <span
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    padding: '4px 10px',
                                                    background: statusConfig.bg,
                                                    borderRadius: 16,
                                                    fontSize: 10,
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.3px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {statusConfig.icon}
                                                {statusConfig.text}
                                            </span>
                                        </div>

                                        {/* Date Info */}
                                        {dateInfo && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    padding: '6px 10px',
                                                    background: dateInfo.type === 'start' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    borderRadius: 8,
                                                    width: 'fit-content',
                                                }}
                                            >
                                                <CalendarOutlined
                                                    style={{
                                                        fontSize: 12,
                                                        color: dateInfo.type === 'start' ? '#10b981' : '#ef4444',
                                                    }}
                                                />
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        color: dateInfo.type === 'start' ? '#065f46' : '#b91c1c',
                                                    }}
                                                >
                                                    {dateInfo.type === 'start'
                                                        ? `Starts in ${dateInfo.days} ${dateInfo.days === 1 ? 'day' : 'days'}`
                                                        : `Due in ${dateInfo.days} ${dateInfo.days === 1 ? 'day' : 'days'}`
                                                    }
                                                </Text>
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Body */}
                                    <div style={{ padding: '16px 20px' }}>
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: '#9ca3af',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                display: 'block',
                                                marginBottom: 6,
                                            }}
                                        >
                                            Description
                                        </Text>
                                        {project.description ? (
                                            <Paragraph
                                                ellipsis={{ rows: 2 }}
                                                style={{
                                                    marginBottom: 0,
                                                    fontSize: 13,
                                                    lineHeight: 1.6,
                                                    color: '#4b5563',
                                                }}
                                            >
                                                {project.description}
                                            </Paragraph>
                                        ) : (
                                            <Text style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
                                                No description provided
                                            </Text>
                                        )}
                                    </div>

                                    {/* Card Footer */}
                                    <div
                                        style={{
                                            padding: '12px 20px',
                                            borderTop: '1px solid #f3f4f6',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<RightOutlined />}
                                            style={{
                                                background: '#4f46e5',
                                                border: 'none',
                                                fontWeight: 600,
                                                fontSize: 12,
                                                borderRadius: 8,
                                            }}
                                        >
                                            Open
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {projectsData && projectsData.totalElements > pagination.pageSize && (
                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                        <Space>
                            <Button
                                disabled={pagination.current === 1}
                                onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                                style={{ borderRadius: 8 }}
                            >
                                Previous
                            </Button>
                            <Text style={{ fontSize: 13, color: '#6b7280', padding: '0 12px' }}>
                                Page {pagination.current} of {projectsData.totalPages}
                            </Text>
                            <Button
                                disabled={pagination.current >= projectsData.totalPages}
                                onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                                style={{ borderRadius: 8 }}
                            >
                                Next
                            </Button>
                        </Space>
                    </div>
                )}

                {/* Create Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: '#4f46e5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FolderOutlined style={{ color: '#fff', fontSize: 16 }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 18 }}>Create Project</span>
                        </div>
                    }
                    open={isCreateModalOpen}
                    onOk={handleSubmit}
                    onCancel={handleCancel}
                    width={520}
                    confirmLoading={createMutation.isPending}
                    okText="Create"
                    styles={{
                        body: { paddingTop: 20 },
                    }}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Project Name"
                            name="name"
                            rules={[{ required: true, message: 'Please enter project name' }]}
                        >
                            <Input placeholder="Enter project name" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Form.Item label="Description" name="description">
                            <TextArea
                                rows={4}
                                placeholder="Enter project description"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>

                        <Form.Item label="Date Range" name="dateRange">
                            <RangePicker style={{ width: '100%', borderRadius: 8 }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </WorkspaceLayout>
    );
};

export default DepartmentProjectsPage;
