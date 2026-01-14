import React, { useState } from 'react';
import {
    Card,
    Typography,
    Tag,
    Space,
    Button,
    Timeline,
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
                        <Card className="shadow-sm" style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                                <div className="flex items-baseline gap-2">
                                    <ClockCircleOutlined className="text-orange-500 text-lg" style={{ marginTop: '10px' }} />
                                    <Title level={4} className="mb-0">Action Required</Title>
                                </div>
                                {assignedStepTasks.length > 0 && (
                                    <Badge
                                        count={assignedStepTasks.length}
                                        style={{
                                            backgroundColor: '#ff7875',
                                            boxShadow: '0 0 0 1px #fff',
                                        }}
                                    />
                                )}
                            </div>

                            {isLoadingStepTasks ? (
                                <div className="text-center py-8">
                                    <Spin />
                                </div>
                            ) : assignedStepTasks.length === 0 ? (
                                <Empty 
                                    description="No actions required at the moment."
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : (
                                <div>
                                    {assignedStepTasks.map((stepTask, index) => {
                                        const actionConfig = getActionButtonConfig(stepTask);
                                        const priorityConfig = getPriorityColor(stepTask.priority);
                                        
                                        return (
                                            <div key={stepTask.id}>
                                                <div
                                                    className="hover:bg-gray-50 rounded-lg p-4 transition-colors"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 12,
                                                    }}
                                                >
                                                    {/* Action Icon */}
                                                    <div
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 8,
                                                            backgroundColor: priorityConfig.bg,
                                                            border: `1px solid ${priorityConfig.border}`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {getActionIcon(stepTask)}
                                                    </div>

                                                    {/* Content */}
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ marginBottom: 8 }}>
                                                            <Space size={8} wrap>
                                                                <Text strong style={{ fontSize: 15, color: '#111827' }}>
                                                                    {stepTask.taskTitle || `Request #${stepTask.taskId}`}
                                                                </Text>
                                                                {getPriorityBadge(stepTask.priority)}
                                                                {getUrgencyCue(stepTask)}
                                                            </Space>
                                                        </div>
                                                        
                                                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                {stepTask.workflowStepName}
                                                            </Text>
                                                            
                                                            {stepTask.endDate && (
                                                                <Text style={{ fontSize: 12, color: '#fa8c16', fontWeight: 500 }}>
                                                                    Due: {dayjs(stepTask.endDate).format('YYYY-MM-DD')}
                                                                </Text>
                                                            )}
                                                        </Space>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div style={{ flexShrink: 0 }}>
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            icon={actionConfig.icon}
                                                            onClick={() => {
                                                                setSelectedTaskId(stepTask.taskId);
                                                            }}
                                                            style={{
                                                                backgroundColor: actionConfig.color,
                                                                borderColor: actionConfig.color,
                                                                height: 32,
                                                                fontSize: 12,
                                                                fontWeight: 500,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 6,
                                                            }}
                                                        >
                                                            {actionConfig.text}
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                {/* Divider */}
                                                {index < assignedStepTasks.length - 1 && (
                                                    <div
                                                        style={{
                                                            height: 1,
                                                            backgroundColor: '#e5e7eb',
                                                            margin: '8px 0',
                                                            opacity: 0.5,
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Recent Activity - SECONDARY SECTION */}
                    <div>
                        <Card className="shadow-sm" style={{ borderRadius: 12 }} bodyStyle={{ padding: '16px 20px' }}>
                            <div className="flex items-baseline gap-2" style={{ marginBottom: 16 }}>
                                <ClockCircleOutlined className="text-lg" style={{ marginTop: '6px', color: '#722ed1' }} />
                                <Title level={4} className="mb-0">Recent Activity</Title>
                            </div>

                            {isLoadingActivity ? (
                                <div className="text-center py-8">
                                    <Spin />
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <Empty 
                                    description="No recent activity"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            ) : (
                                <Timeline
                                    items={recentActivity.map((action) => ({
                                        dot: getActivityIcon(action.actionName),
                                        children: (
                                            <div>
                                                <Text className="text-sm">{formatActivityDescription(action)}</Text>
                                                <div>
                                                    <Text type="secondary" className="text-xs">
                                                        {dayjs(action.createdAt).fromNow()}
                                                    </Text>
                                                </div>
                                            </div>
                                        ),
                                    }))}
                                />
                            )}
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
