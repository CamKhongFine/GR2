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
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    LeftOutlined,
    SwapOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchProjects,
    ProjectResponse,
    ProjectStatus,
} from '../../api/project.api';
import { fetchTasks, TaskResponse, TaskPriority } from '../../api/task.api';
import CreateTaskDrawer from '../../components/tasks/CreateTaskDrawer';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';
import {
    TeamOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const STATUS_FILTER_OPTIONS = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITY_FILTER_OPTIONS: TaskPriority[] = ['LOW', 'NORMAL', 'HIGH'];

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
            'IN_PROGRESS': { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
            'OPEN': { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
            'CANCELLED': { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
        };
        return styles[status] || styles['OPEN'];
    };

    const getPriorityStyle = (priority: TaskPriority | null) => {
        const styles: Record<string, { color: string }> = {
            'HIGH': { color: 'red' },
            'NORMAL': { color: 'blue' },
            'LOW': { color: 'default' },
        };
        return styles[priority || 'NORMAL'] || styles['NORMAL'];
    };

    const columns = [
        {
            title: 'Task',
            dataIndex: 'title',
            key: 'title',
            render: (_: unknown, record: TaskResponse) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: 14, lineHeight: 1.5, marginBottom: 2 }}>{record.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>#{record.id}</div>
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
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (value: string) => (
                <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>
                    {value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'}
                </Text>
            ),
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
                            Create Task
                        </Button>
                        <Space size={10} wrap>
                            <Input
                                placeholder="Search tasks"
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
                        <Empty description="No tasks found" />
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

                <Drawer
                    title={selectedTask?.title}
                    width={440}
                    open={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                >
                    {selectedTask && (
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <Descriptions
                                size="small"
                                column={1}
                                bordered={false}
                                labelStyle={{ width: 120, color: '#6b7280' }}
                                contentStyle={{ color: '#111827' }}
                            >
                                <Descriptions.Item label="ID">
                                    #{selectedTask.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Workflow">
                                    {selectedTask.workflowName || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Current step">
                                    {selectedTask.currentStepName || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Creator">
                                    {selectedTask.creatorName || 'Unknown'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Priority">
                                    <Tag color={getPriorityStyle(selectedTask.priority).color}>
                                        {selectedTask.priority || 'NORMAL'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    {(() => {
                                        const style = getStatusStyle(selectedTask.status);
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
                                                {selectedTask.status}
                                            </span>
                                        );
                                    })()}
                                </Descriptions.Item>
                                {selectedTask.description && (
                                    <Descriptions.Item label="Description">
                                        {selectedTask.description}
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Created">
                                    {selectedTask.createdAt ? dayjs(selectedTask.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Last updated">
                                    {selectedTask.updatedAt ? dayjs(selectedTask.updatedAt).format('YYYY-MM-DD HH:mm') : '-'}
                                </Descriptions.Item>
                            </Descriptions>

                            <Card
                                size="small"
                                title="Workflow actions"
                                bordered={false}
                                style={{ backgroundColor: '#f9fafb' }}
                            >
                                <Space>
                                    <Button type="primary" size="small">
                                        Approve
                                    </Button>
                                    <Button size="small">
                                        Reject
                                    </Button>
                                    <Button size="small">
                                        Send back
                                    </Button>
                                </Space>
                            </Card>
                        </Space>
                    )}
                </Drawer>

                {currentProject && (
                    <CreateTaskDrawer
                        open={isCreateDrawerOpen}
                        onClose={() => setIsCreateDrawerOpen(false)}
                        project={currentProject}
                        onSuccess={handleTaskCreateSuccess}
                    />
                )}
            </div>
        </WorkspaceLayout>
    );
};

export default DepartmentProjectTaskPage;
