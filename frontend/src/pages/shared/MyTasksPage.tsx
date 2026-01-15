import React, { useState } from 'react';
import {
    Card,
    Typography,
    Table,
    Empty,
    Spin,
    Avatar,
    Input,
    Select,
    Button,
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
import {
    UserOutlined,
    SearchOutlined,
    FilterOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    RightOutlined,
    InboxOutlined,
} from '@ant-design/icons';

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
    const [searchText, setSearchText] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
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

    // Filter tasks based on search and priority
    const filteredTasks = stepTasks.filter(task => {
        const matchesSearch = !searchText ||
            task.taskTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
            task.workflowStepName?.toLowerCase().includes(searchText.toLowerCase());
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    // Get priority display with solid color badge
    const getPriorityDisplay = (priority?: 'LOW' | 'NORMAL' | 'HIGH') => {
        const priorityText = priority || 'NORMAL';
        const badgeConfig = {
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
        const config = badgeConfig[priorityText];
        return (
            <span
                style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: config.bg,
                    borderRadius: 20,
                    fontSize: 11,
                    color: config.text,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                }}
            >
                {priorityText}
            </span>
        );
    };

    // Get assigner display with solid color avatar
    const getAssignerDisplay = (creatorName: string | null | undefined) => {
        if (!creatorName) {
            return <Text style={{ fontSize: 13, color: '#9ca3af' }}>—</Text>;
        }
        const initials = creatorName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        // Generate color based on name
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

    // Get received date display with relative time
    const getReceivedDisplay = (beginDate: string | null) => {
        if (!beginDate) return <Text style={{ fontSize: 13, color: '#9ca3af' }}>—</Text>;
        const date = dayjs(beginDate);
        const now = dayjs();
        const diffDays = now.diff(date, 'day');

        let timeText = '';
        let timeColor = '#6b7280';

        if (diffDays === 0) {
            timeText = 'Today';
            timeColor = '#10b981';
        } else if (diffDays === 1) {
            timeText = 'Yesterday';
            timeColor = '#f59e0b';
        } else if (diffDays <= 7) {
            timeText = `${diffDays} days ago`;
            timeColor = '#f59e0b';
        } else {
            timeText = date.format('MMM D, YYYY');
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClockCircleOutlined style={{ fontSize: 12, color: timeColor }} />
                <Text style={{ fontSize: 13, color: timeColor, fontWeight: 500 }}>
                    {timeText}
                </Text>
            </div>
        );
    };

    const columns = [
        {
            title: 'STEP',
            dataIndex: 'workflowStepName',
            key: 'step',
            width: 180,
            render: (value: string | null) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 12px',
                    background: '#e0f2fe',
                    borderRadius: 8,
                    width: 'fit-content',
                }}>
                    <CheckCircleOutlined style={{ fontSize: 14, color: '#0284c7' }} />
                    <Text style={{ fontSize: 13, color: '#0369a1', fontWeight: 500 }}>
                        {value || '—'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'REQUEST',
            key: 'request',
            render: (_: unknown, record: StepTaskResponse) => (
                <div>
                    <Text strong style={{ fontSize: 15, color: '#111827', fontWeight: 600, display: 'block' }}>
                        {record.taskTitle || `Request #${record.taskId}`}
                    </Text>
                </div>
            ),
        },
        {
            title: 'ASSIGNER',
            dataIndex: 'creatorName',
            key: 'assigner',
            width: 200,
            render: (_: unknown, record: StepTaskResponse) => getAssignerDisplay(record.creatorName),
        },
        {
            title: 'PRIORITY',
            dataIndex: 'priority',
            key: 'priority',
            width: 120,
            render: (value: 'LOW' | 'NORMAL' | 'HIGH' | undefined) => getPriorityDisplay(value),
        },
        {
            title: 'RECEIVED',
            dataIndex: 'beginDate',
            key: 'received',
            width: 150,
            render: (value: string | null) => getReceivedDisplay(value),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: () => (
                <RightOutlined style={{ fontSize: 14, color: '#9ca3af' }} />
            ),
        },
    ];

    // Stats
    const highPriorityCount = stepTasks.filter(t => t.priority === 'HIGH').length;
    const totalCount = stepTasks.length;

    return (
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem={activeItem}
            themeColor={themeColor}
            headerOverSidebar
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
                                My Tasks
                            </Title>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15 }}>
                                Steps assigned to you that require action
                            </Text>
                        </div>

                        {/* Stats Cards */}
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 12,
                                    padding: '16px 24px',
                                    textAlign: 'center',
                                    minWidth: 100,
                                }}
                            >
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>
                                    {totalCount}
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                    Total Tasks
                                </div>
                            </div>
                            <div
                                style={{
                                    background: highPriorityCount > 0
                                        ? 'rgba(255, 107, 107, 0.2)'
                                        : 'rgba(255, 255, 255, 0.15)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 12,
                                    padding: '16px 24px',
                                    textAlign: 'center',
                                    minWidth: 100,
                                    border: highPriorityCount > 0 ? '1px solid rgba(255, 107, 107, 0.3)' : 'none',
                                }}
                            >
                                <div style={{ fontSize: 28, fontWeight: 700, color: highPriorityCount > 0 ? '#ff6b6b' : '#fff' }}>
                                    {highPriorityCount}
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                    High Priority
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div
                    style={{
                        display: 'flex',
                        gap: 12,
                        marginBottom: 20,
                        alignItems: 'center',
                    }}
                >
                    <Input
                        placeholder="Search tasks..."
                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            width: 300,
                            borderRadius: 10,
                            height: 42,
                            border: '1px solid #e5e7eb',
                        }}
                    />
                    <Select
                        placeholder="All Priorities"
                        allowClear
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                        style={{ width: 150, height: 42 }}
                        options={[
                            { label: 'High', value: 'HIGH' },
                            { label: 'Normal', value: 'NORMAL' },
                            { label: 'Low', value: 'LOW' },
                        ]}
                    />
                    <div style={{ flex: 1 }} />
                    <Text style={{ color: '#6b7280', fontSize: 13 }}>
                        Showing {filteredTasks.length} of {totalCount} tasks
                    </Text>
                </div>

                {/* Tasks Table Card */}
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
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 16, color: '#6b7280' }}>Loading your tasks...</div>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div style={{ padding: '80px 0', textAlign: 'center' }}>
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: '#e0f2fe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                }}
                            >
                                <InboxOutlined style={{ fontSize: 36, color: '#0284c7' }} />
                            </div>
                            <Title level={4} style={{ color: '#374151', marginBottom: 8 }}>
                                {searchText || priorityFilter ? 'No matching tasks' : 'All caught up!'}
                            </Title>
                            <Text style={{ color: '#9ca3af' }}>
                                {searchText || priorityFilter
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'You have no tasks requiring action right now'}
                            </Text>
                        </div>
                    ) : (
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={filteredTasks}
                            pagination={false}
                            size="middle"
                            onRow={(record: StepTaskResponse) => ({
                                onClick: () => setSelectedTaskId(record.taskId),
                                style: {
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                },
                                onMouseEnter: (e: React.MouseEvent<HTMLTableRowElement>) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.transform = 'scale(1.002)';
                                },
                                onMouseLeave: (e: React.MouseEvent<HTMLTableRowElement>) => {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.transform = 'scale(1)';
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
