import React, { useMemo, useState } from 'react';
import {
    Card,
    Typography,
    Space,
    Button,
    Input,
    Select,
    Table,
    Tag,
    Avatar,
    Drawer,
    Descriptions,
    Spin,
    Empty,
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

const { Text } = Typography;
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
            key: 'project',
            icon: <ProjectOutlined />,
            label: 'Project',
            path: '/department/projects',
        },
    ];

    const getStatusStyle = (status: string) => {
        const styles: Record<string, { bg: string; border: string; text: string }> = {
            'COMPLETED': { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
            'RUNNING': { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
            'CANCELLED': { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
        };
        return styles[status] || styles['RUNNING'];
    };

    const getPriorityStyle = (priority: TaskPriority | null) => {
        const styles: Record<string, { color: string }> = {
            'HIGH': { color: 'red' },
            'NORMAL': { color: 'blue' },
            'LOW': { color: 'default' },
        };
        return styles[priority || 'NORMAL'] || styles['NORMAL'];
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
        
        // Check if task can be deleted
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
            title: 'Request',
            dataIndex: 'title',
            key: 'title',
            render: (_: unknown, record: TaskResponse) => (
                <div style={{ fontWeight: 600, color: '#111827', fontSize: 14, lineHeight: 1.5 }}>
                    {record.title}
                </div>
            ),
        },
        {
            title: 'Current Step',
            dataIndex: 'currentStepName',
            key: 'currentStepName',
            render: (value: string | null) => (
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: 400 }}>{value || '-'}</Text>
            ),
        },
        {
            title: 'Creator',
            dataIndex: 'creatorName',
            key: 'creatorName',
            render: (value: string | null) => (
                <Space size={10} style={{ alignItems: 'center' }}>
                    <Avatar
                        size={28}
                        style={{
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        {value?.charAt(0) || '?'}
                    </Avatar>
                    <Text style={{ fontSize: 13, color: '#374151', fontWeight: 400 }}>{value || 'Unknown'}</Text>
                </Space>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (value: TaskPriority | null) => (
                <Tag color={getPriorityStyle(value).color}>{value || 'NORMAL'}</Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (value: string) => {
                const style = getStatusStyle(value);
                return (
                    <span
                        style={{
                            display: 'inline-block',
                            fontSize: 12,
                            fontWeight: 500,
                            padding: '4px 10px',
                            borderRadius: 6,
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                            color: style.text,
                        }}
                    >
                        {value}
                    </span>
                );
            },
        },
        {
            title: 'Deadline',
            dataIndex: 'endDate',
            key: 'deadline',
            render: (_: unknown, record: TaskResponse) => {
                if (!record.endDate) return <Text style={{ fontSize: 12, color: '#9ca3af' }}>-</Text>;
                const endDate = dayjs(record.endDate);
                const today = dayjs();
                const daysLeft = endDate.diff(today, 'day');
                const isOverdue = daysLeft < 0;
                const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

                return (
                    <div>
                        <Text style={{ fontSize: 12, color: isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#374151' }}>
                            {endDate.format('MMM D, YYYY')}
                        </Text>
                        <div style={{ fontSize: 11, color: isOverdue ? '#dc2626' : isDueSoon ? '#f59e0b' : '#9ca3af' }}>
                            {isOverdue ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Actions',
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
                                color: '#8c8c8c',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        />
                    </Dropdown>
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
                <Card
                    style={{
                        marginBottom: 20,
                        borderRadius: 8,
                        border: 'none',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <Button
                            type="text"
                            icon={<LeftOutlined />}
                            onClick={() => navigate('/department/projects')}
                            style={{
                                paddingInline: 0,
                                height: 32,
                                fontSize: 13,
                                display: 'flex',
                                alignItems: 'center',
                                color: '#374151',
                            }}
                        >
                            Projects
                        </Button>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 12px',
                                backgroundColor: '#f8fafc',
                                border: '1.5px solid #cbd5e1',
                                borderRadius: 8,
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            <FolderOutlined style={{ color: '#475569', fontSize: 14 }} />
                            <Select
                                size="small"
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
                </Card>

                <Card
                    style={{
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    bodyStyle={{ padding: 20 }}
                >
                    <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateDrawerOpen(true)}
                            size="middle"
                            style={{
                                height: 36,
                                paddingLeft: 16,
                                paddingRight: 16,
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            Create Request
                        </Button>
                        <Space size={10} wrap>
                            <Input
                                placeholder="Search requests"
                                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                style={{ width: 240 }}
                                allowClear
                                size="small"
                            />
                            <Select
                                allowClear
                                size="small"
                                placeholder="Status"
                                style={{ width: 140 }}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={STATUS_FILTER_OPTIONS.map((status) => ({
                                    label: status.replace('_', ' '),
                                    value: status,
                                }))}
                            />
                            <Select
                                allowClear
                                size="small"
                                placeholder="Priority"
                                style={{ width: 120 }}
                                value={priorityFilter}
                                onChange={setPriorityFilter}
                                options={PRIORITY_FILTER_OPTIONS.map((priority) => ({
                                    label: priority,
                                    value: priority,
                                }))}
                            />
                        </Space>
                    </div>

                    {tasksLoading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <Spin size="large" />
                        </div>
                    ) : tasks.length === 0 ? (
                        <Empty description="No requests found" />
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={tasks}
                            pagination={false}
                            size="middle"
                            onRow={(record: TaskResponse) => ({
                                onClick: () => setSelectedTask(record),
                                style: { cursor: 'pointer' },
                            })}
                            rowClassName={() => 'task-table-row'}
                            style={{
                                fontSize: 13,
                            }}
                            components={{
                                header: {
                                    cell: (props: any) => (
                                        <th
                                            {...props}
                                            style={{
                                                ...props.style,
                                                backgroundColor: '#f9fafb',
                                                borderBottom: '1px solid #e5e7eb',
                                                padding: '12px 16px',
                                                fontWeight: 500,
                                                fontSize: 12,
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
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
                    title="Update Request"
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
                            <Input placeholder="Enter title" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Enter request description (optional)"
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
                                {STATUS_FILTER_OPTIONS.map((status) => (
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
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item
                                name="endDate"
                                label="Due Date"
                                style={{ flex: 1 }}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </div>
                    </Form>
                </Modal>
            </div>
        </WorkspaceLayout>
    );
};

export default DepartmentProjectTaskPage;
