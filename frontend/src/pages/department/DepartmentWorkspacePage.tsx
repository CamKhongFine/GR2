import React, { useState } from 'react';
import {
    Card,
    Typography,
    Tag,
    Space,
    Avatar,
    Button,
    Empty,
    Spin,
    Drawer,
    Form,
    Input,
    Select,
    DatePicker,
    message,
    Progress,
} from 'antd';
import {
    TeamOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    FolderOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
    SendOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    RiseOutlined,
    UserOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { useUserStore } from '../../store/userStore';
import { useQuery } from '@tanstack/react-query';
import {
    getMyAssignedStepTasksForWorkspace,
    getMyRecentActivity,
    StepTaskResponse,
    StepTaskActionResponse,
    getTaskById,
} from '../../api/task.api';
import RequestDetailView from '../../components/tasks/RequestDetailView';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { TextArea } = Input;

// Mock data for Project Overview
const MOCK_PROJECTS = [
    { id: 1, name: 'Website Redesign', status: 'ACTIVE', tasksTotal: 12, tasksCompleted: 8, progress: 67 },
    { id: 2, name: 'API Integration', status: 'ACTIVE', tasksTotal: 8, tasksCompleted: 3, progress: 38 },
    { id: 3, name: 'Mobile App v2.0', status: 'ACTIVE', tasksTotal: 15, tasksCompleted: 2, progress: 13 },
];

// Mock data for Staff Workload
const MOCK_STAFF_WORKLOAD = [
    { id: 1, name: 'Nguyen Van A', tasksActive: 5, tasksOverdue: 0, avatar: null },
    { id: 2, name: 'Tran Thi B', tasksActive: 3, tasksOverdue: 1, avatar: null },
    { id: 3, name: 'Le Van C', tasksActive: 4, tasksOverdue: 0, avatar: null },
    { id: 4, name: 'Pham Thi D', tasksActive: 2, tasksOverdue: 2, avatar: null },
    { id: 5, name: 'Hoang Van E', tasksActive: 6, tasksOverdue: 0, avatar: null },
];

const DepartmentWorkspacePage: React.FC = () => {
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [isCreateTaskDrawerOpen, setIsCreateTaskDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const { user } = useUserStore();

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

    // Fetch assigned StepTasks for Workspace (limit 5, sorted by priority desc)
    const { data: assignedStepTasks = [], isLoading: isLoadingStepTasks } = useQuery({
        queryKey: ['my-assigned-step-tasks-workspace'],
        queryFn: getMyAssignedStepTasksForWorkspace,
    });

    // Fetch recent activity
    const { data: recentActivity = [], isLoading: isLoadingActivity } = useQuery({
        queryKey: ['my-recent-activity'],
        queryFn: getMyRecentActivity,
    });

    // Fetch task details when selected
    const { data: taskDetails } = useQuery({
        queryKey: ['task', selectedTaskId],
        queryFn: () => getTaskById(selectedTaskId!),
        enabled: !!selectedTaskId,
    });

    // Get action icon based on step name
    const getActionIcon = (stepTask: StepTaskResponse) => {
        const stepName = stepTask.workflowStepName?.toLowerCase() || '';
        if (stepName.includes('submit') || stepName.includes('send')) {
            return <SendOutlined style={{ color: '#3b82f6' }} />;
        } else if (stepName.includes('review') || stepName.includes('approve')) {
            return <EyeOutlined style={{ color: '#f59e0b' }} />;
        }
        return <FileTextOutlined style={{ color: '#6b7280' }} />;
    };

    // Get action button config
    const getActionButtonConfig = (stepTask: StepTaskResponse) => {
        const stepName = stepTask.workflowStepName?.toLowerCase() || '';
        if (stepName.includes('submit') || stepName.includes('send')) {
            return { text: 'Submit', icon: <SendOutlined />, color: '#3b82f6' };
        } else if (stepName.includes('review')) {
            return { text: 'Review', icon: <EyeOutlined />, color: '#f59e0b' };
        } else if (stepName.includes('approve')) {
            return { text: 'Approve', icon: <CheckCircleOutlined />, color: '#10b981' };
        }
        return { text: 'Open', icon: <FileTextOutlined />, color: '#4f46e5' };
    };

    // Get priority color
    const getPriorityColor = (priority?: 'LOW' | 'NORMAL' | 'HIGH') => {
        switch (priority) {
            case 'HIGH':
                return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
            case 'NORMAL':
                return { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
            case 'LOW':
                return { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' };
            default:
                return { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
        }
    };

    // Get priority badge
    const getPriorityBadge = (priority?: 'LOW' | 'NORMAL' | 'HIGH') => {
        const config = getPriorityColor(priority);
        return (
            <span
                style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: config.bg,
                    border: `1px solid ${config.border}`,
                    color: config.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}
            >
                {priority || 'NORMAL'}
            </span>
        );
    };

    // Get activity icon
    const getActivityIcon = (actionName: string) => {
        const name = actionName.toLowerCase();
        if (name.includes('approve') || name.includes('accept')) {
            return <CheckCircleOutlined style={{ color: '#10b981' }} />;
        } else if (name.includes('submit')) {
            return <SendOutlined style={{ color: '#3b82f6' }} />;
        } else if (name.includes('review')) {
            return <EyeOutlined style={{ color: '#f59e0b' }} />;
        }
        return <ClockCircleOutlined style={{ color: '#6b7280' }} />;
    };

    // Format activity description
    const formatActivityDescription = (action: StepTaskActionResponse): string => {
        const actionName = action.actionName.charAt(0).toUpperCase() + action.actionName.slice(1);
        if (action.toStepName) {
            return `${actionName} → ${action.toStepName}`;
        }
        return actionName;
    };

    // Get staff initials
    const getStaffInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    // Get avatar colors
    const getAvatarColor = (index: number) => {
        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];
        return colors[index % colors.length];
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
            headerOverSidebar
        >
            <div className="max-w-7xl mx-auto">
                {/* Workspace Header */}
                <div className="mb-6">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Title level={2} className="mb-0">Workspace</Title>
                        <span style={{
                            background: '#10b981',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: 12,
                            marginTop: 15,
                        }}>
                            {departmentName}
                        </span>
                    </div>
                    <Text type="secondary">Manage projects, monitor workload, and execute tasks</Text>
                </div>

                {/* Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    {/* Total Projects */}
                    <div style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: '#ede9fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FolderOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 13 }}>Active Projects</Text>
                            <Title level={3} style={{ margin: 0 }}>{MOCK_PROJECTS.length}</Title>
                        </div>
                    </div>

                    {/* Staff Count */}
                    <div style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <TeamOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 13 }}>Team Members</Text>
                            <Title level={3} style={{ margin: 0 }}>{MOCK_STAFF_WORKLOAD.length}</Title>
                        </div>
                    </div>

                    {/* Tasks In Progress */}
                    <div style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <ClockCircleOutlined style={{ fontSize: 24, color: '#f59e0b' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 13 }}>Tasks Running</Text>
                            <Title level={3} style={{ margin: 0 }}>{MOCK_STAFF_WORKLOAD.reduce((sum, s) => sum + s.tasksActive, 0)}</Title>
                        </div>
                    </div>

                    {/* Overdue Alert */}
                    <div style={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 16,
                        padding: '20px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                    }}>
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ef4444' }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 13 }}>Overdue Tasks</Text>
                            <Title level={3} style={{ margin: 0, color: '#ef4444' }}>
                                {MOCK_STAFF_WORKLOAD.reduce((sum, s) => sum + s.tasksOverdue, 0)}
                            </Title>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Action Required + Project Overview */}
                    <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Action Required - My Tasks */}
                        <Card
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                overflow: 'hidden',
                                background: '#ffffff',
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    background: '#4f46e5',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 12,
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ClockCircleOutlined style={{ fontSize: 20, color: '#fff' }} />
                                    </div>
                                    <div>
                                        <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
                                            My Action Required
                                        </Title>
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                                            Tasks waiting for your action
                                        </Text>
                                    </div>
                                </div>
                                {assignedStepTasks.length > 0 && (
                                    <div
                                        style={{
                                            minWidth: 36,
                                            height: 36,
                                            borderRadius: '50%',
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: 16,
                                            color: '#4f46e5',
                                        }}
                                    >
                                        {assignedStepTasks.length}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ padding: '16px 20px' }}>
                                {isLoadingStepTasks ? (
                                    <div style={{ textAlign: 'center', padding: 32 }}>
                                        <Spin />
                                    </div>
                                ) : assignedStepTasks.length === 0 ? (
                                    <div style={{ padding: '32px 0' }}>
                                        <Empty
                                            description={
                                                <Text style={{ color: '#9ca3af' }}>
                                                    No actions required at the moment
                                                </Text>
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {assignedStepTasks.map((stepTask) => {
                                            const actionConfig = getActionButtonConfig(stepTask);
                                            const priorityConfig = getPriorityColor(stepTask.priority);

                                            return (
                                                <div
                                                    key={stepTask.id}
                                                    style={{
                                                        background: '#fff',
                                                        borderRadius: 12,
                                                        padding: '16px 20px',
                                                        border: '1px solid #e5e7eb',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 16,
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer',
                                                    }}
                                                    className="hover:border-indigo-300 hover:shadow-md"
                                                    onClick={() => setSelectedTaskId(stepTask.taskId)}
                                                >
                                                    {/* Icon */}
                                                    <div
                                                        style={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 12,
                                                            background: priorityConfig.bg,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {React.cloneElement(getActionIcon(stepTask), {
                                                            style: { fontSize: 20, color: priorityConfig.color }
                                                        })}
                                                    </div>

                                                    {/* Content */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                            <Text
                                                                strong
                                                                style={{
                                                                    fontSize: 15,
                                                                    color: '#1f2937',
                                                                    lineHeight: 1.3,
                                                                }}
                                                                ellipsis
                                                            >
                                                                {stepTask.taskTitle || `Request #${stepTask.taskId}`}
                                                            </Text>
                                                            {getPriorityBadge(stepTask.priority)}
                                                        </div>
                                                        <Text style={{ fontSize: 13, color: '#6b7280' }}>
                                                            {stepTask.workflowStepName}
                                                        </Text>
                                                    </div>

                                                    {/* Action Button */}
                                                    <Button
                                                        type="primary"
                                                        icon={actionConfig.icon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTaskId(stepTask.taskId);
                                                        }}
                                                        style={{
                                                            background: actionConfig.color,
                                                            border: 'none',
                                                            height: 38,
                                                            paddingLeft: 16,
                                                            paddingRight: 16,
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            borderRadius: 10,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 6,
                                                        }}
                                                    >
                                                        {actionConfig.text}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Project Overview */}
                        <Card
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                overflow: 'hidden',
                                background: '#ffffff',
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    background: '#8b5cf6',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 12,
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <FolderOutlined style={{ fontSize: 20, color: '#fff' }} />
                                    </div>
                                    <div>
                                        <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
                                            Project Overview
                                        </Title>
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                                            Active projects in your department
                                        </Text>
                                    </div>
                                </div>
                                <Button
                                    icon={<PlusOutlined />}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: 10,
                                    }}
                                    onClick={() => setIsCreateTaskDrawerOpen(true)}
                                >
                                    New Project
                                </Button>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {MOCK_PROJECTS.map((project) => (
                                        <div
                                            key={project.id}
                                            style={{
                                                background: '#f8fafc',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: 12,
                                                padding: '16px 20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            className="hover:border-purple-300"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 10,
                                                        background: '#ede9fe',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <FolderOutlined style={{ fontSize: 16, color: '#8b5cf6' }} />
                                                    </div>
                                                    <Text strong style={{ fontSize: 15 }}>{project.name}</Text>
                                                </div>
                                                <span style={{
                                                    background: '#dcfce7',
                                                    color: '#10b981',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    padding: '3px 10px',
                                                    borderRadius: 10,
                                                }}>
                                                    {project.status}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <Progress
                                                    percent={project.progress}
                                                    size="small"
                                                    strokeColor="#8b5cf6"
                                                    style={{ flex: 1, margin: 0 }}
                                                />
                                                <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                                                    {project.tasksCompleted}/{project.tasksTotal} tasks
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Staff Workload + Recent Activity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Staff Workload */}
                        <Card
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                overflow: 'hidden',
                                background: '#ffffff',
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    background: '#f59e0b',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 12,
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <RiseOutlined style={{ fontSize: 20, color: '#fff' }} />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
                                        Staff Workload
                                    </Title>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                                        Monitor team assignments
                                    </Text>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {MOCK_STAFF_WORKLOAD.map((staff, index) => (
                                        <div
                                            key={staff.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                padding: '12px 14px',
                                                background: '#f8fafc',
                                                borderRadius: 10,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            className="hover:bg-gray-100"
                                        >
                                            <Avatar
                                                style={{ background: getAvatarColor(index), flexShrink: 0 }}
                                                size={36}
                                            >
                                                {getStaffInitials(staff.name)}
                                            </Avatar>
                                            <div style={{ flex: 1 }}>
                                                <Text strong style={{ fontSize: 14, display: 'block' }}>{staff.name}</Text>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                    <span style={{
                                                        background: '#dbeafe',
                                                        color: '#3b82f6',
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        padding: '1px 6px',
                                                        borderRadius: 6,
                                                    }}>
                                                        {staff.tasksActive} active
                                                    </span>
                                                    {staff.tasksOverdue > 0 && (
                                                        <span style={{
                                                            background: '#fef2f2',
                                                            color: '#ef4444',
                                                            fontSize: 10,
                                                            fontWeight: 600,
                                                            padding: '1px 6px',
                                                            borderRadius: 6,
                                                        }}>
                                                            {staff.tasksOverdue} overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Recent Activity */}
                        <Card
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                overflow: 'hidden',
                                background: '#ffffff',
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    background: '#10b981',
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 12,
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ClockCircleOutlined style={{ fontSize: 20, color: '#fff' }} />
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
                                        Recent Activity
                                    </Title>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                                        Your latest actions
                                    </Text>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px 24px' }}>
                                {isLoadingActivity ? (
                                    <div style={{ textAlign: 'center', padding: 32 }}>
                                        <Spin />
                                    </div>
                                ) : recentActivity.length === 0 ? (
                                    <div style={{ padding: '32px 0' }}>
                                        <Empty
                                            description={
                                                <Text style={{ color: '#9ca3af' }}>
                                                    No recent activity
                                                </Text>
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {recentActivity.map((action, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 14,
                                                    position: 'relative',
                                                }}
                                            >
                                                {/* Timeline line */}
                                                {index < recentActivity.length - 1 && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            left: 17,
                                                            top: 38,
                                                            width: 2,
                                                            height: 'calc(100% + 8px)',
                                                            background: '#e5e7eb',
                                                        }}
                                                    />
                                                )}

                                                {/* Icon */}
                                                <div
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 10,
                                                        background: action.actionName.toLowerCase().includes('approve')
                                                            ? '#dcfce7'
                                                            : action.actionName.toLowerCase().includes('reject')
                                                                ? '#fef2f2'
                                                                : action.actionName.toLowerCase().includes('submit')
                                                                    ? '#dbeafe'
                                                                    : '#f3e8ff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        zIndex: 1,
                                                    }}
                                                >
                                                    {getActivityIcon(action.actionName)}
                                                </div>

                                                {/* Content */}
                                                <div style={{ flex: 1, paddingTop: 2 }}>
                                                    <Text
                                                        style={{
                                                            fontSize: 14,
                                                            color: '#374151',
                                                            display: 'block',
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {formatActivityDescription(action)}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontSize: 12,
                                                            color: '#9ca3af',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4,
                                                            marginTop: 4,
                                                        }}
                                                    >
                                                        <ClockCircleOutlined style={{ fontSize: 11 }} />
                                                        {dayjs(action.createdAt).fromNow()}
                                                    </Text>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Request Detail View */}
            {taskDetails && (
                <RequestDetailView
                    task={taskDetails}
                    open={!!selectedTaskId}
                    onClose={() => {
                        setSelectedTaskId(null);
                    }}
                />
            )}

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
                            {MOCK_PROJECTS.map((project) => (
                                <Select.Option key={project.id} value={project.id}>
                                    {project.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Assignee"
                        name="assigneeId"
                        rules={[{ required: true, message: 'Please select an assignee' }]}
                    >
                        <Select placeholder="Select assignee">
                            {MOCK_STAFF_WORKLOAD.map((staff, index) => (
                                <Select.Option key={staff.id} value={staff.id}>
                                    <Space>
                                        <Avatar size="small" style={{ background: getAvatarColor(index) }}>
                                            {getStaffInitials(staff.name)}
                                        </Avatar>
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
        </WorkspaceLayout>
    );
};

export default DepartmentWorkspacePage;
