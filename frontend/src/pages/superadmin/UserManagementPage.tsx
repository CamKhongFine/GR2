import React, { useState } from 'react';
import {
    Card,
    Table,
    Space,
    Typography,
    Button,
    Tag,
    Avatar,
    message,
    Input,
    Select,
    Modal,
    Form,
    Dropdown,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    UserOutlined,
    SearchOutlined,
    UserAddOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    StopOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchUsers,
    deleteUser,
    activateUser,
    deactivateUser,
    UserResponse
} from '../../api/user.api';
import { inviteUser } from '../../api/auth.api';

const { Title, Text } = Typography;

const UserManagementPage: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch users with pagination
    const { data, isLoading } = useQuery({
        queryKey: ['users', page, pageSize, searchText, statusFilter],
        queryFn: () => fetchUsers(page, pageSize, undefined, searchText, statusFilter !== 'all' ? statusFilter : undefined),
    });

    const users = data?.content || [];
    const totalElements = data?.totalElements || 0;

    // Invite user mutation
    const inviteMutation = useMutation({
        mutationFn: inviteUser,
        onSuccess: () => {
            message.success('User invited successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsInviteModalOpen(false);
            inviteForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to invite user');
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            message.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            message.error('Failed to delete user');
        },
    });

    // Activate user mutation
    const activateMutation = useMutation({
        mutationFn: activateUser,
        onSuccess: () => {
            message.success('User activated successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            message.error('Failed to activate user');
        },
    });

    // Deactivate user mutation
    const deactivateMutation = useMutation({
        mutationFn: deactivateUser,
        onSuccess: () => {
            message.success('User deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            message.error('Failed to deactivate user');
        },
    });

    const handleInvite = async () => {
        try {
            const values = await inviteForm.validateFields();
            inviteMutation.mutate(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = async (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleActivate = async (id: number) => {
        activateMutation.mutate(id);
    };

    const handleDeactivate = async (id: number) => {
        deactivateMutation.mutate(id);
    };

    const columns: ColumnsType<UserResponse> = [
        {
            title: 'User',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
            render: (email: string, record) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} src={record.avatarUrl} />
                    <div>
                        <div>{record.firstName && record.lastName ? `${record.firstName} ${record.lastName}` : 'N/A'}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {email}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
            render: (title: string) => title || 'N/A',
        },
        {
            title: 'Tenant ID',
            dataIndex: 'tenantId',
            key: 'tenantId',
            sorter: (a, b) => a.tenantId - b.tenantId,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'default'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'edit',
                        label: 'Edit',
                        icon: <EditOutlined />,
                        onClick: () => console.log('Edit', record.id),
                    },
                ];

                if (record.status === 'ACTIVE') {
                    menuItems.push({
                        key: 'deactivate',
                        label: 'Deactivate',
                        icon: <StopOutlined />,
                        onClick: () => handleDeactivate(record.id),
                    });
                } else if (record.status === 'INACTIVE') {
                    menuItems.push({
                        key: 'activate',
                        label: 'Activate',
                        icon: <CheckCircleOutlined />,
                        onClick: () => handleActivate(record.id),
                    });
                }

                menuItems.push({
                    key: 'delete',
                    label: 'Delete',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleDelete(record.id),
                } as any);

                return (
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        overlayStyle={{ marginLeft: 2000 }}
                    >
                        <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Title level={2}>User Management</Title>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="middle">
                    <Input
                        placeholder="Search by email"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                    >
                        <Select.Option value="all">All Status</Select.Option>
                        <Select.Option value="ACTIVE">Active</Select.Option>
                        <Select.Option value="INACTIVE">Inactive</Select.Option>
                    </Select>
                </Space>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => setIsInviteModalOpen(true)}
                >
                    Invite User
                </Button>
            </div>

            <Card style={{ width: '100%', background: '#fff' }}>
                <Table<UserResponse>
                    columns={columns}
                    dataSource={users}
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

            {/* Invite User Modal */}
            <Modal
                title="Invite User"
                open={isInviteModalOpen}
                onOk={handleInvite}
                onCancel={() => {
                    setIsInviteModalOpen(false);
                    inviteForm.resetFields();
                }}
                confirmLoading={inviteMutation.isPending}
            >
                <Form form={inviteForm} layout="vertical">
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="user@example.com" />
                    </Form.Item>
                    <Form.Item
                        label="Tenant ID"
                        name="tenantId"
                        rules={[{ required: true, message: 'Please enter tenant ID' }]}
                    >
                        <Input type="number" placeholder="1" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UserManagementPage;
