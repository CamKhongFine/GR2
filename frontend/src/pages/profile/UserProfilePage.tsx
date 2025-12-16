import React, { useState, useEffect } from 'react';
import {
    Card,
    Descriptions,
    Form,
    Input,
    Button,
    Select,
    Space,
    Typography,
    message,
    Spin,
} from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCurrentUser,
    updateCurrentUser,
    fetchDivisions,
    fetchDepartments,
    UserResponse,
    UpdateUserRequest,
} from '../../api/auth.api';

const { Title } = Typography;

const UserProfilePage: React.FC = () => {
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);
    const queryClient = useQueryClient();

    // Fetch user data
    const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
        queryKey: ['currentUser'],
        queryFn: fetchCurrentUser,
    });

    // Fetch divisions and departments
    const { data: divisions = [] } = useQuery({
        queryKey: ['divisions'],
        queryFn: fetchDivisions,
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: fetchDepartments,
        enabled: !!user?.tenantId,
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: updateCurrentUser,
        onSuccess: (updatedUser) => {
            message.success('Profile updated successfully');
            queryClient.setQueryData(['currentUser'], updatedUser);
            setIsEditing(false);
        },
        onError: () => {
            message.error('Failed to update profile');
        },
    });

    // Initialize form when user data is loaded
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                title: user.title || '',
                divisionId: user.division?.id || undefined,
                departmentId: user.department?.id || undefined,
            });
        }
    }, [user, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const updateData: UpdateUserRequest = {
                firstName: values.firstName || null,
                lastName: values.lastName || null,
                title: values.title || null,
                divisionId: values.divisionId || null,
                departmentId: values.departmentId || null,
            };
            updateMutation.mutate(updateData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setIsEditing(false);
    };

    if (userLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return <div>User not found</div>;
    }

    // Get role names
    const roleNames = user.roles.map((role) => role.name).join(', ') || 'No roles assigned';

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Title level={2}>
                    <UserOutlined /> User Profile
                </Title>

                <Card>
                    {!isEditing ? (
                        <>
                            <Descriptions
                                title="User Information"
                                bordered
                                column={2}
                                extra={
                                    <Button type="primary" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                }
                            >
                                <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                                <Descriptions.Item label="Status">{user.status}</Descriptions.Item>
                                <Descriptions.Item label="First Name">
                                    {user.firstName || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Last Name">
                                    {user.lastName || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Title">{user.title || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Tenant ID">{user.tenantId}</Descriptions.Item>
                                <Descriptions.Item label="Division">
                                    {user.division?.name || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Department">
                                    {user.department?.name || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Roles" span={2}>
                                    {roleNames}
                                </Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    {new Date(user.createdAt).toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Updated At">
                                    {new Date(user.updatedAt).toLocaleString()}
                                </Descriptions.Item>
                            </Descriptions>
                        </>
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSave}
                        >
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

                            <Form.Item
                                label="Division"
                                name="divisionId"
                            >
                                <Select
                                    placeholder="Select division"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={divisions.map((div) => ({
                                        value: div.id,
                                        label: div.name,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Department"
                                name="departmentId"
                            >
                                <Select
                                    placeholder="Select department"
                                    allowClear
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={departments.map((dept) => ({
                                        value: dept.id,
                                        label: dept.name,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item label="Email">
                                <Input value={user.email} disabled />
                            </Form.Item>

                            <Form.Item label="Roles">
                                <Input value={roleNames} disabled />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={updateMutation.isPending}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button onClick={handleCancel}>Cancel</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    )}
                </Card>
            </Space>
        </div>
    );
};

export default UserProfilePage;

