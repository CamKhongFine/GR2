import React, { useState } from 'react';
import {
    Card,
    Typography,
    Table,
    Empty,
    Spin,
    Avatar,
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
import { UserOutlined } from '@ant-design/icons';

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

    // Get priority display with calm enterprise badge
    const getPriorityDisplay = (priority?: 'LOW' | 'NORMAL' | 'HIGH') => {
        const priorityText = priority || 'NORMAL';
        const badgeConfig = {
            'HIGH': {
                bg: '#fff1f0',
                border: '#ffccc7',
                text: '#cf1322',
            },
            'NORMAL': {
                bg: '#e6f7ff',
                border: '#91d5ff',
                text: '#0958d9',
            },
            'LOW': {
                bg: '#f5f5f5',
                border: '#d9d9d9',
                text: '#595959',
            },
        };
        const config = badgeConfig[priorityText];
        return (
            <span
                style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    backgroundColor: config.bg,
                    border: `1px solid ${config.border}`,
                    borderRadius: 4,
                    fontSize: 12,
                    color: config.text,
                    fontWeight: 500,
                }}
            >
                {priorityText}
            </span>
        );
    };

    // Get assigner display with avatar initial
    const getAssignerDisplay = (creatorName: string | null | undefined) => {
        if (!creatorName) {
            return <Text style={{ fontSize: 13, color: '#8c8c8c' }}>—</Text>;
        }
        const initials = creatorName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar
                    size={24}
                    style={{
                        backgroundColor: '#f0f0f0',
                        color: '#595959',
                        fontSize: 11,
                        fontWeight: 500,
                    }}
                >
                    {initials}
                </Avatar>
                <Text style={{ fontSize: 13, color: '#595959' }}>
                    {creatorName}
                </Text>
            </div>
        );
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
            title: 'STEP',
            dataIndex: 'workflowStepName',
            key: 'step',
            render: (value: string | null) => (
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                    {value || '—'}
                </Text>
            ),
        },
        {
            title: 'REQUEST',
            key: 'request',
            render: (_: unknown, record: StepTaskResponse) => (
                <Text strong style={{ fontSize: 15, color: '#111827', fontWeight: 600 }}>
                    {record.taskTitle || `Request #${record.taskId}`}
                </Text>
            ),
        },
        {
            title: 'ASSIGNER',
            dataIndex: 'creatorName',
            key: 'assigner',
            render: (_: unknown, record: StepTaskResponse) => getAssignerDisplay(record.creatorName),
        },
        {
            title: 'PRIORITY',
            dataIndex: 'priority',
            key: 'priority',
            render: (value: 'LOW' | 'NORMAL' | 'HIGH' | undefined) => getPriorityDisplay(value),
        },
        {
            title: 'RECEIVED',
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
                    <Text type="secondary" style={{ fontSize: 14, color: '#6b7280' }}>
                        Steps assigned to you that require action
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
                                style: { 
                                    cursor: 'pointer',
                                },
                                onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                },
                                onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                },
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
                                                fontWeight: 600,
                                                fontSize: 11,
                                                color: '#6b7280',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
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
                                                borderBottom: '1px solid #f3f4f6',
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
