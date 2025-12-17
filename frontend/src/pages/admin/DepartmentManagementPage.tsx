import React, { useState } from 'react';
import {
    Card,
    Table,
    Space,
    Typography,
    Button,
    message,
    Input,
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
    BranchesOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchTenantDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    DepartmentResponse,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
} from '../../api/department.api';

const { Title, Text } = Typography;

const DepartmentManagementPage: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<DepartmentResponse | null>(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch departments in current tenant
    const { data, isLoading } = useQuery({
        queryKey: ['admin-departments', page, pageSize, searchText],
        queryFn: () => fetchTenantDepartments(page, pageSize, searchText),
    });

    const departments = data?.content || [];
    const totalElements = data?.totalElements || 0;

    // Create department mutation
    const createMutation = useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            message.success('Department created successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
            setIsCreateModalOpen(false);
            createForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create department');
        },
    });

    // Update department mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDepartmentRequest }) =>
            updateDepartment(id, data),
        onSuccess: () => {
            message.success('Department updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
            setIsEditModalOpen(false);
            setSelectedDepartment(null);
            editForm.resetFields();
        },
        onError: () => {
            message.error('Failed to update department');
        },
    });

    // Delete department mutation
    const deleteMutation = useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            message.success('Department deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
        },
        onError: () => {
            message.error('Failed to delete department');
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

    const handleEdit = (department: DepartmentResponse) => {
        setSelectedDepartment(department);
        editForm.setFieldsValue({
            name: department.name,
            description: department.description,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!selectedDepartment) return;
        try {
            const values = await editForm.validateFields();
            updateMutation.mutate({
                id: selectedDepartment.id,
                data: values,
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Department',
            content: 'Are you sure you want to delete this department? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const columns: ColumnsType<DepartmentResponse> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name: string) => (
                <Space>
                    <BranchesOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{name}</Text>
                </Space>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description: string) => description || <Text type="secondary">No description</Text>,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 200,
            sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
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
                <Title level={2}>Department Management</Title>
            </div>

            {/* Search and Create Bar */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    Create Department
                </Button>
            </div>

            <Card style={{ width: '100%', background: '#fff' }}>
                <Table<DepartmentResponse>
                    columns={columns}
                    dataSource={departments}
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

            {/* Create Department Modal */}
            <Modal
                title="Create Department"
                open={isCreateModalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                }}
                confirmLoading={createMutation.isPending}
            >
                <Form form={createForm} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter department name' }]}
                    >
                        <Input placeholder="Enter department name" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="Enter department description (optional)"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Department Modal */}
            <Modal
                title={`Edit Department: ${selectedDepartment?.name || ''}`}
                open={isEditModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedDepartment(null);
                    editForm.resetFields();
                }}
                confirmLoading={updateMutation.isPending}
                okText="Save Changes"
            >
                <Form form={editForm} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter department name' }]}
                    >
                        <Input placeholder="Enter department name" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="Enter department description (optional)"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default DepartmentManagementPage;
