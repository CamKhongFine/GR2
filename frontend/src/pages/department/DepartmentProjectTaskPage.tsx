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
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    LeftOutlined,
    SwapOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    fetchProjects,
    ProjectResponse,
    ProjectStatus,
} from '../../api/project.api';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';
import {
    TeamOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface TaskRow {
    id: number;
    name: string;
    reference: string;
    step: string;
    assignee: string;
    status: string;
    updatedAt: string;
}

const STATUS_FILTER_OPTIONS = ['In Progress', 'Awaiting Approval', 'Pending', 'Completed'];
const STEP_FILTER_OPTIONS = ['Submission', 'Review', 'Approval', 'Fulfillment'];

const DepartmentProjectTaskPage: React.FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();

    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [stepFilter, setStepFilter] = useState<string | undefined>();
    const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

    const departmentId = user?.department?.id;
    const projectIdParam = params.id ? Number(params.id) : undefined;

    const { data: projectsData } = useQuery({
        queryKey: ['department-projects-for-task-view', departmentId],
        // Lấy tất cả project trong department (không giới hạn ACTIVE) để hỗ trợ cả Draft
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

    const taskRows: TaskRow[] = useMemo(() => {
        if (!currentProject) return [];
        const baseName = currentProject.name;
        const idBase = currentProject.id;
        return [
            {
                id: idBase * 10 + 1,
                name: `${baseName} – Submission package`,
                reference: `PRJ-${idBase}-001`,
                step: 'Submission',
                assignee: 'Jane Doe',
                status: 'In Progress',
                updatedAt: '2026-01-14 09:32',
            },
            {
                id: idBase * 10 + 2,
                name: `${baseName} – Compliance review`,
                reference: `PRJ-${idBase}-002`,
                step: 'Review',
                assignee: 'John Smith',
                status: 'Awaiting Approval',
                updatedAt: '2026-01-14 08:15',
            },
            {
                id: idBase * 10 + 3,
                name: `${baseName} – Approval packet`,
                reference: `PRJ-${idBase}-003`,
                step: 'Approval',
                assignee: 'Sarah Chen',
                status: 'Pending',
                updatedAt: '2026-01-13 16:40',
            },
            {
                id: idBase * 10 + 4,
                name: `${baseName} – Vendor confirmation`,
                reference: `PRJ-${idBase}-004`,
                step: 'Fulfillment',
                assignee: 'Bob Wilson',
                status: 'In Progress',
                updatedAt: '2026-01-13 11:22',
            },
            {
                id: idBase * 10 + 5,
                name: `${baseName} – QA sign-off`,
                reference: `PRJ-${idBase}-005`,
                step: 'Approval',
                assignee: 'Alice Brown',
                status: 'Completed',
                updatedAt: '2026-01-12 17:05',
            },
            {
                id: idBase * 10 + 6,
                name: `${baseName} – Handover`,
                reference: `PRJ-${idBase}-006`,
                step: 'Fulfillment',
                assignee: 'Tom Lee',
                status: 'Awaiting Approval',
                updatedAt: '2026-01-12 10:18',
            },
        ];
    }, [currentProject]);

    const filteredTasks = useMemo(() => {
        return taskRows.filter((task) => {
            const matchesSearch =
                !searchValue ||
                task.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                task.reference.toLowerCase().includes(searchValue.toLowerCase());
            const matchesStatus = !statusFilter || task.status === statusFilter;
            const matchesStep = !stepFilter || task.step === stepFilter;
            return matchesSearch && matchesStatus && matchesStep;
        });
    }, [taskRows, searchValue, statusFilter, stepFilter]);

    const getStatusStyle = (status: string) => {
        const styles: Record<string, { bg: string; border: string; text: string }> = {
            'Completed': { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
            'Awaiting Approval': { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
            'In Progress': { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
            'Pending': { bg: '#f9fafb', border: '#e5e7eb', text: '#6b7280' },
        };
        return styles[status] || styles['Pending'];
    };

    const columns = [
        {
            title: 'Task',
            dataIndex: 'name',
            key: 'name',
            render: (_: unknown, record: TaskRow) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: 14, lineHeight: 1.5, marginBottom: 2 }}>{record.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>{record.reference}</div>
                </div>
            ),
        },
        {
            title: 'Current Step',
            dataIndex: 'step',
            key: 'step',
            render: (value: string) => (
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: 400 }}>{value}</Text>
            ),
        },
        {
            title: 'Assignee',
            dataIndex: 'assignee',
            key: 'assignee',
            render: (value: string) => (
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
                        {value.charAt(0)}
                    </Avatar>
                    <Text style={{ fontSize: 13, color: '#374151', fontWeight: 400 }}>{value}</Text>
                </Space>
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
                <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>{value}</Text>
            ),
        },
    ];

    const handleProjectChange = (projectId: number) => {
        navigate(`/department/projects/${projectId}`);
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
                                    label: status,
                                    value: status,
                                }))}
                            />
                            <Select
                                allowClear
                                size="small"
                                placeholder="Workflow step"
                                style={{ width: 160 }}
                                value={stepFilter}
                                onChange={setStepFilter}
                                options={STEP_FILTER_OPTIONS.map((step) => ({
                                    label: step,
                                    value: step,
                                }))}
                            />
                        </Space>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={filteredTasks}
                        pagination={false}
                        size="middle"
                        onRow={(record: TaskRow) => ({
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
                </Card>

                <Drawer
                    title={selectedTask?.name}
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
                                <Descriptions.Item label="Reference">
                                    {selectedTask.reference}
                                </Descriptions.Item>
                                <Descriptions.Item label="Current step">
                                    {selectedTask.step}
                                </Descriptions.Item>
                                <Descriptions.Item label="Assignee">
                                    {selectedTask.assignee}
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
                                <Descriptions.Item label="Last updated">
                                    {selectedTask.updatedAt}
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

                            <Card
                                size="small"
                                title="History"
                                bordered={false}
                                style={{ backgroundColor: '#f9fafb' }}
                            >
                                <Space direction="vertical" size={6}>
                                    <Text style={{ fontSize: 12, color: '#4b5563' }}>
                                        2026-01-14 09:32 · Status changed to {selectedTask.status}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#4b5563' }}>
                                        2026-01-13 16:10 · Step updated to {selectedTask.step}
                                    </Text>
                                </Space>
                            </Card>
                        </Space>
                    )}
                </Drawer>

                <Drawer
                    title="Create task"
                    width={420}
                    open={isCreateDrawerOpen}
                    onClose={() => setIsCreateDrawerOpen(false)}
                >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Task creation will be wired to workflow templates in a later iteration.
                    </Text>
                </Drawer>
            </div>
        </WorkspaceLayout>
    );
};

export default DepartmentProjectTaskPage;

