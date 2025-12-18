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
    ApartmentOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchTenantDivisions,
    createDivision,
    updateDivision,
    deleteDivision,
    DivisionResponse,
    CreateDivisionRequest,
    UpdateDivisionRequest,
} from '../../api/division.api';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '../../config/date.config';

const { Title, Text } = Typography;

const DivisionManagementPage: React.FC = () => {
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState<DivisionResponse | null>(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch divisions in current tenant
    const { data, isLoading } = useQuery({
        queryKey: ['admin-divisions', page, pageSize, searchText],
        queryFn: () => fetchTenantDivisions(page, pageSize, searchText),
    });

    const divisions = data?.content || [];
    const totalElements = data?.totalElements || 0;

    // Create division mutation
    const createMutation = useMutation({
        mutationFn: createDivision,
        onSuccess: () => {
            message.success('Division created successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            setIsCreateModalOpen(false);
            createForm.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create division');
        },
    });

    // Update division mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateDivisionRequest }) =>
            updateDivision(id, data),
        onSuccess: () => {
            message.success('Division updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
            setIsEditModalOpen(false);
            setSelectedDivision(null);
            editForm.resetFields();
        },
        onError: () => {
            message.error('Failed to update division');
        },
    });

    // Delete division mutation
    const deleteMutation = useMutation({
        mutationFn: deleteDivision,
        onSuccess: () => {
            message.success('Division deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-divisions'] });
        },
        onError: () => {
            message.error('Failed to delete division');
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

    const handleEdit = (division: DivisionResponse) => {
        setSelectedDivision(division);
        editForm.setFieldsValue({
            name: division.name,
            description: division.description,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!selectedDivision) return;
        try {
            const values = await editForm.validateFields();
            updateMutation.mutate({
                id: selectedDivision.id,
                data: values,
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: 'Delete Division',
            content: 'Are you sure you want to delete this division? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteMutation.mutate(id),
        });
    };

    const columns: ColumnsType<DivisionResponse> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (name: string) => (
                <Space>
                    <ApartmentOutlined style={{ color: '#1890ff' }} />
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
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 200,
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (date: string) => dayjs(date).format(DATE_FORMAT),
        },
        {
            title: 'Last Update',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 200,
            sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
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
                <Title level={3}>Division Management</Title>
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
                    Create Division
                </Button>
            </div>

            <Card style={{ width: '100%', background: '#fff' }}>
                <Table<DivisionResponse>
                    columns={columns}
                    dataSource={divisions}
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

            {/* Create Division Modal */}
            <Modal
                title="Create Division"
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
                        rules={[{ required: true, message: 'Please enter division name' }]}
                    >
                        <Input placeholder="Enter division name" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="Enter division description (optional)"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Division Modal */}
            <Modal
                title={`Edit Division: ${selectedDivision?.name || ''}`}
                open={isEditModalOpen}
                onOk={handleEditSubmit}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedDivision(null);
                    editForm.resetFields();
                }}
                confirmLoading={updateMutation.isPending}
                okText="Save Changes"
            >
                <Form form={editForm} layout="vertical" style={{ marginTop: 20 }}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter division name' }]}
                    >
                        <Input placeholder="Enter division name" />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="Enter division description (optional)"
                            rows={4}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default DivisionManagementPage;
