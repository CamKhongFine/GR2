import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Space,
    Typography,
    Button,
    message,
    Input,
    Modal,
    Dropdown,
    Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    SearchOutlined,
    PlusOutlined,
    MoreOutlined,
    DeleteOutlined,
    EyeOutlined,
    BranchesOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchWorkflows,
    deleteWorkflow,
    WorkflowResponse,
} from '../../api/workflow.api';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../config/date.config';

const { Title, Text } = Typography;

const WorkflowManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const queryClient = useQueryClient();

    // Fetch workflows
    const { data, isLoading } = useQuery({
        queryKey: ['workflows', page, pageSize],
        queryFn: () => fetchWorkflows(page, pageSize),
    });

    const workflows = data?.content || [];
    const totalElements = data?.totalElements || 0;

    // Filtered workflows (client-side search)
    const filteredWorkflows = searchText
        ? workflows.filter((w) =>
            w.name.toLowerCase().includes(searchText.toLowerCase())
        )
        : workflows;

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: deleteWorkflow,
        onSuccess: () => {
            message.success('Workflow deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to delete workflow');
        },
    });

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Workflow',
            content: 'Are you sure you want to delete this workflow? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const columns: ColumnsType<WorkflowResponse> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name: string, record) => (
                <Space>
                    <BranchesOutlined style={{ color: '#1890ff' }} />
                    <Text
                        strong
                        style={{ cursor: 'pointer', color: '#0063bfff' }}
                        onClick={() => navigate(`/admin/workflows/${record.id}`)}
                    >
                        {name}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description: string) =>
                description || <Text type="secondary">No description</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'default'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            sorter: (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date: string) => dayjs(date).format(DATE_FORMAT),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            align: 'center',
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'view',
                        label: 'View / Edit',
                        icon: <EyeOutlined />,
                        onClick: () => navigate(`/admin/workflows/${record.id}`),
                    },
                    {
                        key: 'delete',
                        label: 'Delete',
                        icon: <DeleteOutlined />,
                        danger: true,
                        onClick: () => handleDelete(record.id),
                    } as any,
                ];

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button
                            type="text"
                            icon={<MoreOutlined style={{ fontSize: 20 }} />}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Title level={3}>Workflow Management</Title>
            </div>

            {/* Search and Create Bar */}
            <div
                style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Input
                    placeholder="Search by name"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/admin/workflows/new')}
                >
                    Create Workflow
                </Button>
            </div>

            <Card style={{ width: '100%', background: '#fff' }}>
                <Table<WorkflowResponse>
                    columns={columns}
                    dataSource={filteredWorkflows}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: page + 1,
                        pageSize: pageSize,
                        total: totalElements,
                        showSizeChanger: true,
                        onChange: (newPage, newPageSize) => {
                            setPage(newPage - 1);
                            if (newPageSize !== pageSize) {
                                setPageSize(newPageSize);
                                setPage(0);
                            }
                        },
                    }}
                />
            </Card>
        </>
    );
};

export default WorkflowManagementPage;