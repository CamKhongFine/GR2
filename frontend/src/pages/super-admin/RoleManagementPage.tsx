import React, { useState } from 'react';
import {
    Card,
    Table,
    Space,
    Typography,
    Button,
    Tag,
    message,
    Input,
    Select,
    Modal,
    Form,
    Dropdown,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    SearchOutlined,
    PlusOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRoles, deleteRole, createRole, updateRole, RoleResponse } from '../../api/role.api';

const { Title, Text } = Typography;

const RoleManagementPage: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch roles with pagination
    const { data, isLoading } = useQuery({
        queryKey: ['roles', page, pageSize, searchText, levelFilter],
        queryFn: () => fetchRoles(
            page,
            pageSize,
            undefined,
            searchText,
            levelFilter !== 'all' ? parseInt(levelFilter) : undefined
        ),
    });

    const roles = data?.content || [];
    const totalElements = data?.totalElements || 0;

    // Create role mutation
    const createMutation = useMutation({
        mutationFn: createRole,
        onSuccess: () => {
            message.success('Role created successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            setIsCreateModalOpen(false);
            createForm.resetFields();
        },
        onError: () => {
            message.error('Failed to create role');
        },
    });

    // Delete role mutation
    const deleteMutation = useMutation({
        mutationFn: deleteRole,
        onSuccess: () => {
            message.success('Role deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
        },
        onError: () => {
            message.error('Failed to delete role');
        },
    });

    // Update role mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => updateRole(id, data),
        onSuccess: () => {
            message.success('Role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            setIsEditModalOpen(false);
            setSelectedRole(null);
            editForm.resetFields();
        },
        onError: () => {
            message.error('Failed to update role');
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

    const handleDelete = async (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleEdit = (role: RoleResponse) => {
        setSelectedRole(role);
        editForm.setFieldsValue({
            name: role.name,
            level: role.level,
            description: role.description,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!selectedRole) return;
        try {
            const values = await editForm.validateFields();
            updateMutation.mutate({
                id: selectedRole.id,
                data: values,
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns: ColumnsType<RoleResponse> = [
        {
            title: 'Role',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name: string, record) => (
                <Space>
                    <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.description}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            sorter: (a, b) => a.level - b.level,
            render: (level: number) => (
                <Tag color="blue">Level {level}</Tag>
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
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
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
                        onClick: () => handleEdit(record),
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
                <Title level={2}>Role Management</Title>
            </div>

            {/* Search and Filter Bar */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="middle">
                    <Input
                        placeholder="Search by role name"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Select
                        value={levelFilter}
                        onChange={setLevelFilter}
                        style={{ width: 150 }}
                    >
                        <Select.Option value="all">All Levels</Select.Option>
                        <Select.Option value="1">Level 1</Select.Option>
                        <Select.Option value="2">Level 2</Select.Option>
                        <Select.Option value="3">Level 3</Select.Option>
                        <Select.Option value="4">Level 4</Select.Option>
                        <Select.Option value="5">Level 5</Select.Option>
                    </Select>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create Role
                </Button>
            </div>

            <Card style={{ width: '100%', background: '#fff' }}>
                <Table<RoleResponse>
                    columns={columns}
                    dataSource={roles}
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

            {/* Create Role Modal */}
            <Modal
                title="Create Role"
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
                        label="Role Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter role name' }]}
                    >
                        <Input placeholder="Enter role name" />
                    </Form.Item>
                    <Form.Item
                        label="Level"
                        name="level"
                        rules={[{ required: true, message: 'Please enter level' }]}
                    >
                        <Input type="number" placeholder="1" min={1} max={5} />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea placeholder="Enter description" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Role Modal */}
            <Modal
                title="Edit Role"
                open={isEditModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedRole(null);
                    editForm.resetFields();
                }}
                confirmLoading={updateMutation.isPending}
                okText="Save Changes"
            >
                <Form form={editForm} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        label="Role Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter role name' }]}
                    >
                        <Input placeholder="Enter role name" />
                    </Form.Item>
                    <Form.Item
                        label="Level"
                        name="level"
                        rules={[{ required: true, message: 'Please enter level' }]}
                    >
                        <Input type="number" placeholder="1" min={0} max={5} />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea placeholder="Enter description" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RoleManagementPage;
