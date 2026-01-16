import React, { useMemo, useState } from 'react';
import {
    Card,
    Typography,
    Button,
    Input,
    Select,
    Table,
    Tag,
    Spin,
    message,
    Modal,
    Form,
    DatePicker,
    Dropdown,
    MenuProps,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    LeftOutlined,
    SwapOutlined,
    FolderOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    RightOutlined,
    InboxOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    fetchProjects,
    ProjectResponse,
} from '../../api/project.api';
import { fetchTasks, TaskResponse, TaskPriority, updateTask, deleteTask, UpdateTaskRequest } from '../../api/task.api';
import CreateTaskDrawer from '../../components/tasks/CreateTaskDrawer';
import RequestDetailView from '../../components/tasks/RequestDetailView';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';
import {
    TeamOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const STATUS_FILTER_OPTIONS = ['RUNNING', 'COMPLETED', 'CANCELLED'];
const PRIORITY_FILTER_OPTIONS: TaskPriority[] = ['LOW', 'NORMAL', 'HIGH'];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: 'default' },
    { value: 'NORMAL', label: 'Normal', color: 'blue' },
    { value: 'HIGH', label: 'High', color: 'red' },
];

const DepartmentProjectTaskPage: React.FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useUserStore();

    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [taskToUpdate, setTaskToUpdate] = useState<TaskResponse | null>(null);
    const [form] = Form.useForm();

    const departmentId = user?.department?.id;
    const projectIdParam = params.id ? Number(params.id) : undefined;

    const { data: projectsData } = useQuery({
        queryKey: ['department-projects-for-task-view', departmentId],
        queryFn: () => fetchProjects(0, 50, departmentId, undefined, undefined),
        enabled: !!departmentId,
    });

    const projects = projectsData?.content || [];

    const currentProject: ProjectResponse | undefined = useMemo(() => {
        if (!projects.length) return undefined;
        if (projectIdParam) {
            const found = projects.find((p) => p.id === projectIdParam);
            if (found) return found;
        }
        return projects[0];
    }, [projects, projectIdParam]);

    // Fetch tasks for current project
    const { data: tasksData, isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks', currentProject?.id, searchValue, statusFilter, priorityFilter],
        queryFn: () => fetchTasks(0, 50, currentProject?.id, searchValue || undefined, statusFilter, priorityFilter),
        enabled: !!currentProject?.id,
    });

    const tasks = tasksData?.content || [];

    // Stats
    const totalTasks = tasks.length;
    const runningCount = tasks.filter(t => t.status === 'RUNNING').length;
    const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

    // Update task mutation
    const updateTaskMutation = useMutation({
        mutationFn: ({ taskId, request }: { taskId: number; request: UpdateTaskRequest }) =>
            updateTask(taskId, request),
        onSuccess: () => {
            message.success('Request updated successfully');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsUpdateModalOpen(false);
            setTaskToUpdate(null);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to update request');
        },
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            message.success('Request deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to delete request');
        },
    });

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

    // Get status display with solid color badge
    const getStatusDisplay = (status: string) => {
        const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            'COMPLETED': {
                bg: '#10b981',
                text: '#fff',
                icon: <CheckCircleOutlined style={{ fontSize: 12 }} />,
            },
            'RUNNING': {
                bg: '#3b82f6',
                text: '#fff',
                icon: <SyncOutlined spin style={{ fontSize: 12 }} />,
            },
            'CANCELLED': {
                bg: '#9ca3af',
                text: '#fff',
                icon: <CloseCircleOutlined style={{ fontSize: 12 }} />,
            },
        };
        const statusConfig = config[status] || config['RUNNING'];
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    background: statusConfig.bg,
                    borderRadius: 20,
                    fontSize: 11,
                    color: statusConfig.text,
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                }}
            >
                {statusConfig.icon}
                {status}
            </span>
        );
    };

    // Get priority display with solid color badge
    const getPriorityDisplay = (priority: TaskPriority | null) => {
        const priorityText = priority || 'NORMAL';
        const config: Record<string, { bg: string; text: string }> = {
            'HIGH': {
                bg: '#ef4444',
                text: '#fff',
            },
            'NORMAL': {
                bg: '#3b82f6',
                text: '#fff',
            },
            'LOW': {
                bg: '#9ca3af',
                text: '#fff',
            },
        };
        const priorityConfig = config[priorityText];
        return (
            <span
                style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: priorityConfig.bg,
                    borderRadius: 20,
                    fontSize: 11,
                    color: priorityConfig.text,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                }}
            >
                {priorityText}
            </span>
        );
    };

    // Get creator display with solid color avatar
    const getCreatorDisplay = (creatorName: string | null) => {
        if (!creatorName) {
            return <Text style={{ fontSize: 13, color: '#9ca3af' }}>Unknown</Text>;
        }
        const initials = creatorName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const colors = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
        const colorIndex = creatorName.charCodeAt(0) % colors.length;

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: colors[colorIndex],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                    }}
                >
                    {initials}
                </div>
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                    {creatorName}
                </Text>
            </div>
        );
    };

    const handleUpdate = (record: TaskResponse, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setTaskToUpdate(record);
        form.setFieldsValue({
            title: record.title,
            description: record.description || '',
            priority: record.priority || 'NORMAL',
            status: record.status,
            projectId: record.projectId || undefined,
            beginDate: record.beginDate ? dayjs(record.beginDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
        });
        setIsUpdateModalOpen(true);
    };

    const handleDelete = (record: TaskResponse, e: React.MouseEvent) => {
        e.stopPropagation();

        if (record.status !== 'COMPLETED' && record.status !== 'CANCELLED') {
            message.warning('Request can only be deleted when status is COMPLETED or CANCELLED');
            return;
        }

        Modal.confirm({
            title: 'Delete Request',
            content: `Are you sure you want to delete "${record.title}"? This action cannot be undone.`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => {
                deleteTaskMutation.mutate(record.id);
            },
        });
    };

    const canDeleteTask = (status: string) => {
        return status === 'COMPLETED' || status === 'CANCELLED';
    };

    const handleUpdateSubmit = async () => {
        if (!taskToUpdate) return;
        try {
            const values = await form.validateFields();
            const request: UpdateTaskRequest = {
                title: values.title,
                description: values.description || undefined,
                priority: values.priority,
                status: values.status,
                projectId: values.projectId,
                beginDate: values.beginDate ? values.beginDate.toISOString() : undefined,
                endDate: values.endDate ? values.endDate.toISOString() : undefined,
            };
            updateTaskMutation.mutate({ taskId: taskToUpdate.id, request });
        } catch (error) {
            // Validation failed
        }
    };

    const columns = [
        {
            title: 'REQUEST',
            dataIndex: 'title',
            key: 'title',
            render: (_: unknown, record: TaskResponse) => (
                <div>
                    <Text strong style={{ fontSize: 15, color: '#111827', fontWeight: 600, display: 'block' }}>
                        {record.title}
                    </Text>
                </div>
            ),
        },
        {
            title: 'CURRENT STEP',
            dataIndex: 'currentStepName',
            key: 'currentStepName',
            width: 180,
            render: (value: string | null) => (
                value ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '4px 12px',
                        background: '#e0f2fe',
                        borderRadius: 8,
                        width: 'fit-content',
                    }}>
                        <FileTextOutlined style={{ fontSize: 14, color: '#0284c7' }} />
                        <Text style={{ fontSize: 13, color: '#0369a1', fontWeight: 500 }}>
                            {value}
                        </Text>
                    </div>
                ) : (
                    <Text style={{ fontSize: 13, color: '#9ca3af' }}>—</Text>
                )
            ),
        },
        {
            title: 'CREATOR',
            dataIndex: 'creatorName',
            key: 'creatorName',
            width: 200,
            render: (value: string | null) => getCreatorDisplay(value),
        },
        {
            title: 'PRIORITY',
            dataIndex: 'priority',
            key: 'priority',
            width: 120,
            render: (value: TaskPriority | null) => getPriorityDisplay(value),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (value: string) => getStatusDisplay(value),
        },
        {
            title: 'DEADLINE',
            dataIndex: 'endDate',
            key: 'deadline',
            width: 150,
            render: (_: unknown, record: TaskResponse) => {
                if (!record.endDate) return <Text style={{ fontSize: 12, color: '#9ca3af' }}>—</Text>;
                const endDate = dayjs(record.endDate);
                const today = dayjs();
                const daysLeft = endDate.diff(today, 'day');
                const isOverdue = daysLeft < 0;
                const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ClockCircleOutlined style={{
                                fontSize: 12,
                                color: isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#6b7280'
                            }} />
                            <Text style={{
                                fontSize: 13,
                                color: isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#374151',
                                fontWeight: 500,
                            }}>
                                {endDate.format('MMM D, YYYY')}
                            </Text>
                        </div>
                    </div>
                );
            },
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_: unknown, record: TaskResponse) => {
                const canDelete = canDeleteTask(record.status);

                const menuItems: MenuProps['items'] = [
                    {
                        key: 'update',
                        label: 'Update',
                        icon: <EditOutlined />,
                        onClick: (e) => {
                            e?.domEvent?.stopPropagation();
                            handleUpdate(record);
                        },
                    },
                    {
                        key: 'delete',
                        label: 'Delete',
                        icon: <DeleteOutlined />,
                        danger: true,
                        disabled: !canDelete,
                        onClick: (e) => {
                            e?.domEvent?.stopPropagation();
                            if (canDelete) {
                                handleDelete(record, e?.domEvent as React.MouseEvent);
                            } else {
                                message.warning('Request can only be deleted when status is COMPLETED or CANCELLED');
                            }
                        },
                    },
                ];

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                icon={<MoreOutlined />}
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                style={{
                                    fontSize: 18,
                                    color: '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 8,
                                }}
                            />
                        </Dropdown>
                        <RightOutlined style={{ fontSize: 12, color: '#9ca3af' }} />
                    </div>
                );
            },
        },
    ];

    const handleProjectChange = (projectId: number) => {
        navigate(`/department/projects/${projectId}`);
    };

    const handleTaskCreateSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem="project"
            themeColor="green"
        >
            <div className="max-w-7xl mx-auto px-4">
                {/* Back Button and Project Selector */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        onClick={() => navigate('/department/projects')}
                        style={{
                            paddingInline: 0,
                            height: 36,
                            fontSize: 14,
                            display: 'flex',
                            alignItems: 'center',
                            color: '#374151',
                            fontWeight: 500,
                        }}
                    >
                        Back to Projects
                    </Button>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '0 14px',
                            height: 42,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 10,
                        }}
                    >
                        <FolderOutlined style={{ color: '#64748b', fontSize: 14 }} />
                        <Select
                            size="middle"
                            bordered={false}
                            style={{
                                minWidth: 200,
                                fontWeight: 500,
                                fontSize: 13,
                            }}
                            placeholder="Switch project"
                            value={currentProject?.id}
                            onChange={handleProjectChange}
                            options={projects.map((p) => ({
                                label: p.name,
                                value: p.id,
                            }))}
                            suffixIcon={<SwapOutlined style={{ color: '#64748b', fontSize: 12 }} />}
                        />
                    </div>
                </div>

                {/* Project Header with Stats */}
                <div
                    style={{
                        background: '#4f46e5',
                        borderRadius: 16,
                        padding: '24px 28px',
                        marginBottom: 24,
                        boxShadow: '0 10px 40px rgba(79, 70, 229, 0.25)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(8px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FolderOutlined style={{ fontSize: 22, color: '#fff' }} />
                                </div>
                                <div>
                                    <Title level={3} style={{ margin: 0, color: '#fff', fontWeight: 700 }}>
                                        {currentProject?.name || 'Project'}
                                    </Title>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13 }}>
                                        Project Requests
                                    </Text>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 12,
                                    padding: '12px 18px',
                                    textAlign: 'center',
                                    minWidth: 80,
                                }}
                            >
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                                    {totalTasks}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                    Total
                                </div>
                            </div>
                            <div
                                style={{
                                    background: 'rgba(59, 130, 246, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 12,
                                    padding: '12px 18px',
                                    textAlign: 'center',
                                    minWidth: 80,
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                }}
                            >
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                                    {runningCount}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                    Running
                                </div>
                            </div>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.25)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 12,
                                    padding: '12px 18px',
                                    textAlign: 'center',
                                    minWidth: 80,
                                }}
                            >
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                                    {completedCount}
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                    Done
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
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateDrawerOpen(true)}
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
                        New Request
                    </Button>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Input
                            placeholder="Search requests..."
                            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            style={{
                                width: 240,
                                height: 42,
                                borderRadius: 10,
                                border: '1px solid #e5e7eb',
                            }}
                            allowClear
                        />
                        <Select
                            allowClear
                            placeholder="Status"
                            style={{ width: 130, height: 42 }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={STATUS_FILTER_OPTIONS.map((status) => ({
                                label: status.replace('_', ' '),
                                value: status,
                            }))}
                        />
                        <Select
                            allowClear
                            placeholder="Priority"
                            style={{ width: 120, height: 42 }}
                            value={priorityFilter}
                            onChange={setPriorityFilter}
                            options={PRIORITY_FILTER_OPTIONS.map((priority) => ({
                                label: priority,
                                value: priority,
                            }))}
                        />
                    </div>
                </div>

                {/* Tasks Table */}
                <Card
                    style={{
                        borderRadius: 16,
                        border: 'none',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden',
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    {tasksLoading ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 16, color: '#6b7280' }}>Loading requests...</div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div style={{ padding: '80px 0', textAlign: 'center' }}>
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
                                No requests found
                            </Title>
                            <Text style={{ color: '#9ca3af' }}>
                                Create a new request to get started
                            </Text>
                        </div>
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={tasks}
                            pagination={false}
                            size="middle"
                            onRow={(record: TaskResponse) => ({
                                onClick: () => setSelectedTask(record),
                                style: {
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                },
                                onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                },
                                onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                },
                            })}
                            components={{
                                header: {
                                    cell: (props: any) => (
                                        <th
                                            {...props}
                                            style={{
                                                ...props.style,
                                                background: '#f8fafc',
                                                borderBottom: '1px solid #e2e8f0',
                                                padding: '14px 20px',
                                                fontWeight: 600,
                                                fontSize: 11,
                                                color: '#64748b',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.8px',
                                            }}
                                        />
                                    ),
                                },
                                body: {
                                    row: (props: any) => (
                                        <tr
                                            {...props}
                                            style={{
                                                ...props.style,
                                                borderBottom: '1px solid #f1f5f9',
                                            }}
                                        />
                                    ),
                                    cell: (props: any) => (
                                        <td
                                            {...props}
                                            style={{
                                                ...props.style,
                                                padding: '16px 20px',
                                            }}
                                        />
                                    ),
                                },
                            }}
                        />
                    )}
                </Card>

                <RequestDetailView
                    task={selectedTask}
                    open={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                />

                {currentProject && (
                    <CreateTaskDrawer
                        open={isCreateDrawerOpen}
                        onClose={() => setIsCreateDrawerOpen(false)}
                        project={currentProject}
                        onSuccess={handleTaskCreateSuccess}
                    />
                )}

                {/* Update Request Modal */}
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
                                <EditOutlined style={{ color: '#fff', fontSize: 16 }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 18 }}>Update Request</span>
                        </div>
                    }
                    open={isUpdateModalOpen}
                    onOk={handleUpdateSubmit}
                    onCancel={() => {
                        setIsUpdateModalOpen(false);
                        setTaskToUpdate(null);
                        form.resetFields();
                    }}
                    okText="Update"
                    cancelText="Cancel"
                    confirmLoading={updateTaskMutation.isPending}
                    width={600}
                    styles={{
                        body: { paddingTop: 20 },
                    }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ priority: 'NORMAL' }}
                    >
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: 'Please enter a title' }]}
                        >
                            <Input placeholder="Enter title" style={{ borderRadius: 8 }} />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Enter request description (optional)"
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="projectId"
                            label="Project"
                            rules={[{ required: true, message: 'Please select a project' }]}
                        >
                            <Select
                                placeholder="Select project"
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) => {
                                    const label = option?.label as string | undefined;
                                    return (label ?? '').toLowerCase().includes(input.toLowerCase());
                                }}
                            >
                                {projects.map((project) => (
                                    <Select.Option key={project.id} value={project.id} label={project.name}>
                                        {project.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="priority"
                            label="Priority"
                        >
                            <Select>
                                {PRIORITY_OPTIONS.map((option) => (
                                    <Select.Option key={option.value} value={option.value}>
                                        <Tag color={option.color}>{option.label}</Tag>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Status"
                        >
                            <Select>
                                {/* Only allow RUNNING and CANCELLED - COMPLETED is set via workflow */}
                                {['RUNNING', 'CANCELLED'].map((status) => (
                                    <Select.Option key={status} value={status}>
                                        {status}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <Form.Item
                                name="beginDate"
                                label="Start Date"
                                style={{ flex: 1 }}
                            >
                                <DatePicker style={{ width: '100%', borderRadius: 8 }} />
                            </Form.Item>

                            <Form.Item
                                name="endDate"
                                label="Due Date"
                                style={{ flex: 1 }}
                            >
                                <DatePicker style={{ width: '100%', borderRadius: 8 }} />
                            </Form.Item>
                        </div>
                    </Form>
                </Modal>
            </div>
        </WorkspaceLayout>
    );
};

export default DepartmentProjectTaskPage;
