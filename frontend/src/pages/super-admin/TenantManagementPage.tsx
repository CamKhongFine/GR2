import React, { useState } from 'react';
import { Card, Table, Button, Typography, Tag, Modal, Form, Input, message, Dropdown, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, StopOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    deactivateTenant,
    activateTenant,
    type TenantResponse,
    type TenantRequest,
} from '../../api/tenant.api';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../config/date.config';

const { Title } = Typography;

const TenantManagementPage: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState<TenantResponse | null>(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch tenants with pagination
    const { data, isLoading } = useQuery({
        queryKey: ['tenants', page, pageSize, searchText, statusFilter],
        queryFn: () => fetchTenants(page, pageSize, undefined, searchText, statusFilter),
    });

    const tenants = data?.content || [];
    const totalElements = data?.totalElements || 0;

    // Create tenant mutation
    const createMutation = useMutation({
        mutationFn: createTenant,
        onSuccess: () => {
            message.success('Tenant created successfully');
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setIsCreateModalOpen(false);
            createForm.resetFields();
        },
        onError: () => {
            message.error('Failed to create tenant');
        },
    });

    // Update tenant mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: TenantRequest }) => updateTenant(id, data),
        onSuccess: () => {
            message.success('Tenant updated successfully');
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setIsEditModalOpen(false);
            setSelectedTenant(null);
            editForm.resetFields();
        },
        onError: () => {
            message.error('Failed to update tenant');
        },
    });

    // Delete tenant mutation
    const deleteMutation = useMutation({
        mutationFn: deleteTenant,
        onSuccess: () => {
            message.success('Tenant deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setIsDeleteModalOpen(false);
            setSelectedTenant(null);
        },
        onError: () => {
            message.error('Failed to delete tenant');
        },
    });

    // Deactivate tenant mutation
    const deactivateMutation = useMutation({
        mutationFn: deactivateTenant,
        onSuccess: () => {
            message.success('Tenant deactivated successfully');
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setIsDeactivateModalOpen(false);
            setSelectedTenant(null);
        },
        onError: () => {
            message.error('Failed to deactivate tenant');
        },
    });

    // Activate tenant mutation
    const activateMutation = useMutation({
        mutationFn: activateTenant,
        onSuccess: () => {
            message.success('Tenant activated successfully');
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            setIsActivateModalOpen(false);
            setSelectedTenant(null);
        },
        onError: () => {
            message.error('Failed to activate tenant');
        },
    });

    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            createMutation.mutate(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleEdit = (tenant: TenantResponse) => {
        setSelectedTenant(tenant);
        editForm.setFieldsValue({ name: tenant.name });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedTenant) return;
        try {
            const values = await editForm.validateFields();
            updateMutation.mutate({ id: selectedTenant.id, data: values });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = (tenant: TenantResponse) => {
        setSelectedTenant(tenant);
        setIsDeleteModalOpen(true);
    };

    const handleDeactivate = (tenant: TenantResponse) => {
        setSelectedTenant(tenant);
        setIsDeactivateModalOpen(true);
    };

    const handleActivate = (tenant: TenantResponse) => {
        setSelectedTenant(tenant);
        setIsActivateModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedTenant) {
            deleteMutation.mutate(selectedTenant.id);
        }
    };

    const confirmDeactivate = () => {
        if (selectedTenant) {
            deactivateMutation.mutate(selectedTenant);
        }
    };

    const confirmActivate = () => {
        if (selectedTenant) {
            activateMutation.mutate(selectedTenant);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'INACTIVE':
                return 'default';
            case 'SUSPENDED':
                return 'red';
            default:
                return 'default';
        }
    };

    const columns: ColumnsType<TenantResponse> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
            sorter: (a, b) => a.status.localeCompare(b.status),
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format(DATE_FORMAT),
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        },
        {
            title: 'Last Sync',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date: string) => dayjs(date).format(DATE_FORMAT),
            sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
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
                        onClick: () => handleEdit(record),
                    },
                ];

                if (record.status === 'ACTIVE') {
                    menuItems.push({
                        key: 'deactivate',
                        label: 'Deactivate',
                        icon: <StopOutlined />,
                        onClick: () => handleDeactivate(record),
                    });
                } else if (record.status === 'INACTIVE') {
                    menuItems.push({
                        key: 'activate',
                        label: 'Activate',
                        icon: <CheckCircleOutlined />,
                        onClick: () => handleActivate(record),
                    });
                }

                menuItems.push({
                    key: 'delete',
                    label: 'Delete',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleDelete(record),
                });

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
                <Title level={3}>Tenant Management</Title>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="middle">
                    <Input
                        placeholder="Search by name or ID"
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
                        <Select.Option value="SUSPENDED">Suspended</Select.Option>
                    </Select>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create Tenant
                </Button>
            </div>

            <Card
                style={{ width: '100%', background: '#fff' }}
            >
                <Table
                    columns={columns}
                    dataSource={tenants}
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

            {/* Create Modal */}
            <Modal
                title="Create Tenant"
                open={isCreateModalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                }}
                confirmLoading={createMutation.isPending}
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        label="Tenant Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter tenant name' }]}
                    >
                        <Input placeholder="Enter tenant name" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Edit Tenant"
                open={isEditModalOpen}
                onOk={handleUpdate}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedTenant(null);
                    editForm.resetFields();
                }}
                confirmLoading={updateMutation.isPending}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        label="Tenant Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter tenant name' }]}
                    >
                        <Input placeholder="Enter tenant name" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                title="Delete Tenant"
                open={isDeleteModalOpen}
                onOk={confirmDelete}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedTenant(null);
                }}
                confirmLoading={deleteMutation.isPending}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Are you sure you want to delete tenant <strong>{selectedTenant?.name}</strong>?
                    This action cannot be undone.
                </p>
            </Modal>

            {/* Deactivate Modal */}
            <Modal
                title="Deactivate Tenant"
                open={isDeactivateModalOpen}
                onOk={confirmDeactivate}
                onCancel={() => {
                    setIsDeactivateModalOpen(false);
                    setSelectedTenant(null);
                }}
                confirmLoading={deactivateMutation.isPending}
                okText="Deactivate"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Are you sure you want to deactivate tenant <strong>{selectedTenant?.name}</strong>?
                    Users from this tenant will not be able to log in until the tenant is reactivated.
                </p>
            </Modal>

            {/* Activate Modal */}
            <Modal
                title="Activate Tenant"
                open={isActivateModalOpen}
                onOk={confirmActivate}
                onCancel={() => {
                    setIsActivateModalOpen(false);
                    setSelectedTenant(null);
                }}
                confirmLoading={activateMutation.isPending}
                okText="Activate"
            >
                <p>
                    Are you sure you want to activate tenant <strong>{selectedTenant?.name}</strong>?
                    Users from this tenant will be able to log in again.
                </p>
            </Modal>
        </>
    );
};

export default TenantManagementPage;
