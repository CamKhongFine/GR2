import React, { useState } from 'react';
import {
    Card,
    Typography,
    Table,
    Tag,
    Empty,
    Spin,
} from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';
import { 
    getMyAssignedStepTasks, 
    StepTaskResponse,
    getTaskById,
} from '../../api/task.api';
import RequestDetailView from '../../components/tasks/RequestDetailView';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface MyTasksPageProps {
    sidebarItems: SidebarItemConfig[];
    activeItem: string;
    themeColor: 'blue' | 'green' | 'purple';
    workspaceType: 'staff' | 'department' | 'division';
}

const MyTasksPage: React.FC<MyTasksPageProps> = ({
    sidebarItems,
    activeItem,
    themeColor,
    workspaceType,
}) => {
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const queryClient = useQueryClient();

    // Fetch assigned StepTasks with IN_PROGRESS status
    const { data: stepTasks = [], isLoading } = useQuery({
        queryKey: ['my-assigned-step-tasks'],
        queryFn: getMyAssignedStepTasks,
    });

    // Fetch task details when selected
    const { data: taskDetails } = useQuery({
        queryKey: ['task', selectedTaskId],
        queryFn: () => getTaskById(selectedTaskId!),
        enabled: !!selectedTaskId,
    });

    // Get priority display
    const getPriorityDisplay = (priority?: 'LOW' | 'NORMAL' | 'HIGH') => {
        const priorityText = priority || 'NORMAL';
        const colorMap = {
            'HIGH': '#ff4d4f',
            'NORMAL': '#1890ff',
            'LOW': '#8c8c8c',
        };
        return (
            <Text style={{ 
                fontSize: 13, 
                color: colorMap[priorityText],
                fontWeight: priorityText === 'HIGH' ? 600 : 400,
            }}>
                {priorityText}
            </Text>
        );
    };

    // Get due date display
    const getDueDisplay = (endDate: string | null) => {
        if (!endDate) return <Text style={{ fontSize: 13, color: '#8c8c8c' }}>—</Text>;
        
        const dueDate = dayjs(endDate);
        const today = dayjs().startOf('day');
        const daysDiff = dueDate.diff(today, 'day');
        
        if (daysDiff < 0) {
            return <Text style={{ fontSize: 13, color: '#ff4d4f', fontWeight: 500 }}>Overdue</Text>;
        } else if (daysDiff === 0) {
            return <Text style={{ fontSize: 13, color: '#fa8c16', fontWeight: 500 }}>Due today</Text>;
        }
        return <Text style={{ fontSize: 13, color: '#8c8c8c' }}>—</Text>;
    };

    // Get received date display
    const getReceivedDisplay = (beginDate: string | null) => {
        if (!beginDate) return <Text style={{ fontSize: 13, color: '#8c8c8c' }}>—</Text>;
        return (
            <Text style={{ fontSize: 13, color: '#595959' }}>
                {dayjs(beginDate).format('MMM D, YYYY')}
            </Text>
        );
    };

    const columns = [
        {
            title: 'Step',
            dataIndex: 'workflowStepName',
            key: 'step',
            render: (value: string | null) => (
                <Text style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
                    {value || '—'}
                </Text>
            ),
        },
        {
            title: 'Request',
            key: 'request',
            render: (_: unknown, record: StepTaskResponse) => (
                <div>
                    <Text strong style={{ fontSize: 14, color: '#111827', display: 'block', marginBottom: 4 }}>
                        {record.taskTitle || `Request #${record.taskId}`}
                    </Text>
                    {record.projectName && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.projectName}
                        </Text>
                    )}
                </div>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (value: 'LOW' | 'NORMAL' | 'HIGH' | undefined) => getPriorityDisplay(value),
        },
        {
            title: 'Due',
            dataIndex: 'endDate',
            key: 'due',
            render: (value: string | null) => getDueDisplay(value),
        },
        {
            title: 'Received',
            dataIndex: 'beginDate',
            key: 'received',
            render: (value: string | null) => getReceivedDisplay(value),
        },
    ];

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem={activeItem}
            themeColor={themeColor}
            headerOverSidebar
        >
            <div className="max-w-7xl mx-auto px-4">
                <div style={{ marginBottom: 24 }}>
                    <Title level={2} className="mb-0" style={{ fontSize: 24, fontWeight: 600, color: '#111827' }}>
                        My Tasks
                    </Title>
                    <Text type="secondary" style={{ fontSize: 14, color: '#8c8c8c' }}>
                        Tasks that require your action
                    </Text>
                </div>

                <Card
                    style={{
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    }}
                    bodyStyle={{ padding: 0 }}
                >
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <Spin size="large" />
                        </div>
                    ) : stepTasks.length === 0 ? (
                        <Empty 
                            description="You have no tasks requiring action."
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ padding: 60 }}
                        />
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={stepTasks}
                            pagination={false}
                            size="middle"
                            onRow={(record: StepTaskResponse) => ({
                                onClick: () => setSelectedTaskId(record.taskId),
                                style: { cursor: 'pointer' },
                            })}
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

                {/* Request Detail View */}
                {taskDetails && (
                    <RequestDetailView
                        task={taskDetails}
                        open={!!selectedTaskId}
                        onClose={() => {
                            setSelectedTaskId(null);
                            // Invalidate queries to refresh the task list
                            queryClient.invalidateQueries({ queryKey: ['my-assigned-step-tasks'] });
                            queryClient.invalidateQueries({ queryKey: ['task', selectedTaskId] });
                        }}
                    />
                )}
            </div>
        </WorkspaceLayout>
    );
};

export default MyTasksPage;
