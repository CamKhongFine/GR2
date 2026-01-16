import React, { useState } from 'react';
import {
    Card,
    Typography,
    Tag,
    Space,
    Button,
    Empty,
    Spin,
    Badge,
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    SendOutlined,
    EyeOutlined,
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
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

const StaffWorkspacePage: React.FC = () => {
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    // Sidebar items configuration
    const sidebarItems: SidebarItemConfig[] = [
        {
            key: 'workspace',
            icon: <ClockCircleOutlined />,
            label: 'Workspace',
            path: '/staff/workspace',
        },
        {
            key: 'my-tasks',
            icon: <CheckCircleOutlined />,
            label: 'My Task',
            path: '/staff/tasks',
        },
        {
            key: 'my-requests',
            icon: <CheckCircleOutlined />,
            label: 'My Request',
            path: '/staff/my-requests',
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

    // Get action icon based on step name or action type
    const getActionIcon = (stepTask: StepTaskResponse) => {
        const stepName = stepTask.workflowStepName?.toLowerCase() || '';
        if (stepName.includes('submit') || stepName.includes('send')) {
            return <SendOutlined style={{ color: '#1890ff' }} />;
        } else if (stepName.includes('review') || stepName.includes('approve')) {
            return <EyeOutlined style={{ color: '#fa8c16' }} />;
        } else if (stepName.includes('update') || stepName.includes('edit')) {
            return <EditOutlined style={{ color: '#722ed1' }} />;
        } else if (stepName.includes('approve')) {
            return <CheckOutlined style={{ color: '#52c41a' }} />;
        }
        return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
    };

    // Get action button text and icon
    const getActionButtonConfig = (stepTask: StepTaskResponse) => {
        const stepName = stepTask.workflowStepName?.toLowerCase() || '';
        if (stepName.includes('submit') || stepName.includes('send')) {
            return { text: 'Submit', icon: <SendOutlined />, color: '#1890ff' };
        } else if (stepName.includes('review')) {
            return { text: 'Review', icon: <EyeOutlined />, color: '#fa8c16' };
        } else if (stepName.includes('update') || stepName.includes('edit')) {
            return { text: 'Update', icon: <EditOutlined />, color: '#722ed1' };
        } else if (stepName.includes('approve')) {
            return { text: 'Approve', icon: <CheckOutlined />, color: '#52c41a' };
        }
        return { text: 'Open', icon: <FileTextOutlined />, color: '#1890ff' };
    };

    // Get priority color
    const getPriorityColor = (priority?: 'LOW' | 'NORMAL' | 'HIGH') => {
        switch (priority) {
            case 'HIGH':
                return { color: '#ff4d4f', bg: '#fff1f0', border: '#ffccc7' };
            case 'NORMAL':
                return { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' };
            case 'LOW':
                return { color: '#8c8c8c', bg: '#f5f5f5', border: '#d9d9d9' };
            default:
                return { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff' };
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

    // Format urgency cue
    const getUrgencyCue = (stepTask: StepTaskResponse) => {
        if (!stepTask.beginDate) return null;

        const beginDate = dayjs(stepTask.beginDate);
        const now = dayjs();
        const daysDiff = now.diff(beginDate, 'day');

        if (daysDiff > 3) {
            return <Tag color="red">Overdue</Tag>;
        } else if (daysDiff >= 2) {
            return <Tag color="orange">Due soon</Tag>;
        }
        return null;
    };

    // Format activity description
    const formatActivityDescription = (action: StepTaskActionResponse): string => {
        const actionName = action.actionName.charAt(0).toUpperCase() + action.actionName.slice(1);
        const taskTitle = action.taskId ? `Request #${action.taskId}` : 'Request';

        if (action.toStepName) {
            return `${actionName} → ${action.toStepName}`;
        }
        return `${actionName} on ${taskTitle}`;
    };

    // Get activity icon
    const getActivityIcon = (actionName: string) => {
        const name = actionName.toLowerCase();
        if (name.includes('approve') || name.includes('accept')) {
            return <CheckOutlined style={{ color: '#52c41a' }} />;
        } else if (name.includes('reject') || name.includes('decline')) {
            return <CloseOutlined style={{ color: '#ff4d4f' }} />;
        } else if (name.includes('submit')) {
            return <SendOutlined style={{ color: '#1890ff' }} />;
        } else if (name.includes('review')) {
            return <EyeOutlined style={{ color: '#fa8c16' }} />;
        } else if (name.includes('update')) {
            return <EditOutlined style={{ color: '#722ed1' }} />;
        }
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    };

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem="workspace"
            themeColor="green"
            headerOverSidebar
        >
            <div className="max-w-7xl mx-auto">
                {/* Workspace Header - Context only */}
                <div className="mb-6">
                    <Title level={2} className="mb-0">Workspace</Title>
                    <Text type="secondary">Summary and awareness</Text>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Action Required - PRIMARY SECTION */}
                    <div className="lg:col-span-2">
                        <Card
                            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                overflow: 'hidden',
                                background: '#ffffff',
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            {/* Solid Color Header */}
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
                                            Action Required
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

                            {/* Content Area */}
                            <div style={{ padding: '16px 20px' }}>
                                {isLoadingStepTasks ? (
                                    <div className="text-center py-8">
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
                                                    className="hover:border-purple-300 hover:shadow-md"
                                                    onClick={() => setSelectedTaskId(stepTask.taskId)}
                                                >
                                                    {/* Icon with solid color background */}
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
                                                            {getUrgencyCue(stepTask)}
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <Text style={{ fontSize: 13, color: '#6b7280' }}>
                                                                {stepTask.workflowStepName}
                                                            </Text>
                                                            {stepTask.endDate && (
                                                                <Text style={{
                                                                    fontSize: 12,
                                                                    color: '#f59e0b',
                                                                    fontWeight: 500,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 4,
                                                                }}>
                                                                    <ClockCircleOutlined style={{ fontSize: 12 }} />
                                                                    {dayjs(stepTask.endDate).format('MMM DD, YYYY')}
                                                                </Text>
                                                            )}
                                                        </div>
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
                    </div>

                    {/* Recent Activity - SECONDARY SECTION */}
                    <div>
                        <Card
                            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                            style={{
                                borderRadius: 16,
                                border: 'none',
                                overflow: 'hidden',
                                background: '#ffffff',
                            }}
                            bodyStyle={{ padding: 0 }}
                        >
                            {/* Solid Color Header */}
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

                            {/* Content Area */}
                            <div style={{ padding: '20px 24px' }}>
                                {isLoadingActivity ? (
                                    <div className="text-center py-8">
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
                                                                ? '#fee2e2'
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
        </WorkspaceLayout>
    );
};

export default StaffWorkspacePage;
