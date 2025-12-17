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
    Checkbox,
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
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchTenantUsers,
    inviteTenantUser,
    fetchAvailableRoles,
    updateTenantUser,
    assignRolesToTenantUser,
    activateTenantUser,
    deactivateTenantUser,
    deleteTenantUser,
    UserResponse,
} from '../../api/admin-user.api';
import { RoleResponse } from '../../api/role.api';

const { Title, Text } = Typography;

const UserManagementPage: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignRolesModalOpen, setIsAssignRolesModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [inviteForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [assignRolesForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch users in current tenant
    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, pageSize, searchText, statusFilter, roleFilter],
        queryFn: () => fetchTenantUsers(
            page,
            pageSize,
            searchText,
            statusFilter !== 'all' ? statusFilter : undefined,
            roleFilter !== 'all' ? parseInt(roleFilter) : undefined
        ),
    });

    // Fetch available roles (only roles with level > current user's level)
    const { data: availableRolesData } = useQuery({
        queryKey: ['available-roles'],
        queryFn: fetchAvailableRoles,
    });

    const users = data?.content || [];
    const totalElements = data?.totalElements || 0;
    const availableRoles = availableRolesData || [];

    // Invite user mutation
    const inviteMutation = useMutation({
        mutationFn: inviteTenantUser,
        onSuccess: () => {
            message.success('User invited successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsInviteModalOpen(false);
            inviteForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to invite user');
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: deleteTenantUser,
        onSuccess: () => {
            message.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => {
            message.error('Failed to delete user');
        },
    });

    const activateMutation = useMutation({
        mutationFn: activateTenantUser,
        onSuccess: () => {
            message.success('User activated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => {
            message.error('Failed to activate user');
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateTenantUser,
        onSuccess: () => {
            message.success('User deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => {
            message.error('Failed to deactivate user');
        },
    });

    // Assign roles mutation
    const assignRolesMutation = useMutation({
        mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
            assignRolesToTenantUser(userId, roleIds),
        onSuccess: () => {
            message.success('Roles assigned successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsAssignRolesModalOpen(false);
            setSelectedUser(null);
            assignRolesForm.resetFields();
        },
        onError: () => {
            message.error('Failed to assign roles');
        },
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateTenantUser(id, data),
        onSuccess: () => {
            message.success('User updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            setIsEditModalOpen(false);
            setSelectedUser(null);
            editForm.resetFields();
        },
        onError: () => {
            message.error('Failed to update user');
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

    const handleAssignRoles = (user: UserResponse) => {
        setSelectedUser(user);
        const currentRoleIds = user.roles?.map(r => r.id) || [];
        assignRolesForm.setFieldsValue({ roleIds: currentRoleIds });
        setIsAssignRolesModalOpen(true);
    };

    const handleEdit = (user: UserResponse) => {
        setSelectedUser(user);
        editForm.setFieldsValue({
            firstName: user.firstName,
            lastName: user.lastName,
            title: user.title,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!selectedUser) return;
        try {
            const values = await editForm.validateFields();
            updateMutation.mutate({
                id: selectedUser.id,
                data: values,
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleAssignRolesSubmit = async () => {
        if (!selectedUser) return;
        try {
            const values = await assignRolesForm.validateFields();
            assignRolesMutation.mutate({
                userId: selectedUser.id,
                roleIds: values.roleIds,
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
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
            title: 'Roles',
            key: 'roles',
            render: (_, record) => (
                <>
                    {record.roles && record.roles.length > 0 ? (
                        record.roles.map(role => (
                            <Tag key={role.id} color="blue" style={{ marginBottom: 4 }}>
                                {role.name}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary">No roles</Text>
                    )}
                </>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (status: string) => {
                let color = 'default';
                if (status === 'ACTIVE') color = 'green';
                else if (status === 'INACTIVE') color = 'red';
                else if (status === 'INVITED') color = 'orange';

                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 250,
            sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            align: 'center',
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'edit',
                        label: 'Edit',
                        icon: <EditOutlined />,
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'assign-roles',
                        label: 'Assign Roles',
                        icon: <SafetyCertificateOutlined />,
                        onClick: () => handleAssignRoles(record),
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
                        overlayStyle={{ marginLeft: 10000 }}
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
                        <Select.Option value="INVITED">Invited</Select.Option>
                    </Select>
                    <Select
                        value={roleFilter}
                        onChange={setRoleFilter}
                        style={{ width: 180 }}
                        placeholder="Filter by Role"
                    >
                        <Select.Option value="all">All Roles</Select.Option>
                        {availableRoles.map((role: RoleResponse) => (
                            <Select.Option key={role.id} value={role.id.toString()}>
                                {role.name}
                            </Select.Option>
                        ))}
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
                title="Invite User to Your Tenant"
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
                </Form>
            </Modal>

            {/* Assign Roles Modal */}
            <Modal
                title={
                    selectedUser?.firstName || selectedUser?.lastName
                        ? `Assign roles to ${selectedUser?.firstName ?? ''} ${selectedUser?.lastName ?? ''}`.trim()
                        : `Assign roles to ${selectedUser?.email ?? 'N/A'}`
                }
                open={isAssignRolesModalOpen}
                onOk={handleAssignRolesSubmit}
                onCancel={() => {
                    setIsAssignRolesModalOpen(false);
                    setSelectedUser(null);
                    assignRolesForm.resetFields();
                }}
                confirmLoading={assignRolesMutation.isPending}
                width={600}
            >
                <Form form={assignRolesForm} layout="vertical">
                    <Form.Item
                        label="Select Roles"
                        name="roleIds"
                        style={{ marginTop: 20 }}
                        rules={[{ required: true, message: 'Please select at least one role' }]}
                    >
                        <Checkbox.Group style={{ width: '100%', marginTop: 5 }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {availableRoles.map((role: RoleResponse) => (
                                    <Checkbox key={role.id} value={role.id}>
                                        <Space>
                                            <span style={{ fontWeight: 500 }}>{role.name}</span>
                                            <Tag color="blue">Level {role.level}</Tag>
                                            {role.description && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    - {role.description}
                                                </Text>
                                            )}
                                        </Space>
                                    </Checkbox>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                title={`Edit User: ${selectedUser?.email || ''}`}
                open={isEditModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                    editForm.resetFields();
                }}
                confirmLoading={updateMutation.isPending}
                width={600}
                okText="Save Changes"
            >
                <Form form={editForm} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        label="First Name"
                        name="firstName"
                    >
                        <Input placeholder="Enter first name" />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lastName"
                    >
                        <Input placeholder="Enter last name" />
                    </Form.Item>
                    <Form.Item
                        label="Title"
                        name="title"
                    >
                        <Input placeholder="Enter title" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UserManagementPage;
