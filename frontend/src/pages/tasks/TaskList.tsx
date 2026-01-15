import React, { useState } from 'react';
import { Table, Tag, Avatar, Button, Input, Space, Typography, Tooltip, Drawer, Form, Select, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask } from '../../api/task.api';
import { Task, TaskPriority, TaskStatus } from '../../types/task';
import dayjs from 'dayjs';

const { Title } = Typography;

const TaskList: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: fetchTasks,
    });

    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsDrawerOpen(false);
            form.resetFields();
        },
    });

    const handleCreateTask = (values: any) => {
        createTaskMutation.mutate({
            ...values,
            dueDate: values.dueDate?.toISOString(),
        });
    };

    const columns = [
        {
            title: 'Task Name',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span className="font-medium text-gray-700">{text}</span>,
            sorter: (a: Task, b: Task) => a.title.localeCompare(b.title),
        },
        {
            title: 'Assignees',
            dataIndex: 'assignees',
            key: 'assignees',
            render: (assignees: any[]) => (
                <Avatar.Group maxCount={3}>
                    {assignees.map((user) => (
                        <Tooltip title={user.name} key={user.id}>
                            <Avatar src={user.avatar} />
                        </Tooltip>
                    ))}
                </Avatar.Group>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'To Do', value: 'todo' },
                { text: 'In Progress', value: 'in-progress' },
                { text: 'Review', value: 'review' },
                { text: 'Done', value: 'done' },
            ],
            onFilter: (value: any, record: Task) => record.status === value,
            render: (status: TaskStatus) => {
                const colors: Record<TaskStatus, string> = {
                    'todo': 'default',
                    'in-progress': 'processing',
                    'review': 'warning',
                    'done': 'success',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            filters: [
                { text: 'Low', value: 'low' },
                { text: 'Medium', value: 'medium' },
                { text: 'High', value: 'high' },
                { text: 'Critical', value: 'critical' },
            ],
            onFilter: (value: any, record: Task) => record.priority === value,
            render: (priority: TaskPriority) => {
                const colors: Record<TaskPriority, string> = {
                    'low': 'blue',
                    'medium': 'green',
                    'high': 'orange',
                    'critical': 'red',
                };
                return <Tag color={colors[priority]}>{priority.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => dayjs(date).format('MMM D, YYYY'),
            sorter: (a: Task, b: Task) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        },
    ];

    const filteredTasks = tasks?.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>Tasks</Title>
                <Space>
                    <Input
                        placeholder="Search tasks..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Button icon={<FilterOutlined />}>Filter</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
                        New Task
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredTasks}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                rowSelection={{ type: 'checkbox' }}
            />

            <Drawer
                title="Create New Task"
                width={500}
                onClose={() => setIsDrawerOpen(false)}
                open={isDrawerOpen}
                extra={
                    <Space>
                        <Button onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
                        <Button type="primary" onClick={() => form.submit()} loading={createTaskMutation.isPending}>
                            Create
                        </Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical" onFinish={handleCreateTask}>
                    <Form.Item name="title" label="Task Title" rules={[{ required: true }]}>
                        <Input placeholder="Enter task title" />
                    </Form.Item>
                    <Form.Item name="priority" label="Priority" initialValue="medium">
                        <Select>
                            <Select.Option value="low">Low</Select.Option>
                            <Select.Option value="medium">Medium</Select.Option>
                            <Select.Option value="high">High</Select.Option>
                            <Select.Option value="critical">Critical</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="status" label="Status" initialValue="todo">
                        <Select>
                            <Select.Option value="todo">To Do</Select.Option>
                            <Select.Option value="in-progress">In Progress</Select.Option>
                            <Select.Option value="review">Review</Select.Option>
                            <Select.Option value="done">Done</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="dueDate" label="Due Date">
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
};

export default TaskList;
