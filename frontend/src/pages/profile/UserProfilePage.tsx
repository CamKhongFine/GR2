import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    Typography,
    message,
    Spin,
    Tabs,
    Row,
    Col,
    Avatar,
    Upload,
} from 'antd';
import { SaveOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCurrentUser,
    updateCurrentUser,
    UserResponse,
    UpdateUserRequest,
} from '../../api/auth.api';

const { Title } = Typography;

const UserProfilePage: React.FC = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Fetch user data
    const { data: user, isLoading: userLoading } = useQuery<UserResponse>({
        queryKey: ['currentUser'],
        queryFn: fetchCurrentUser,
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: updateCurrentUser,
        onSuccess: (updatedUser) => {
            message.success('Profile updated successfully');
            queryClient.setQueryData(['currentUser'], updatedUser);
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
                email: user.email,
                title: user.title || '',
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
            };
            updateMutation.mutate(updateData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handlePasswordChange = async () => {
        try {
            const values = await passwordForm.validateFields();
            // TODO: Implement password change API
            message.info('Password change functionality will be implemented');
            passwordForm.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
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

    const tabItems = [
        {
            key: 'info',
            label: 'Personal Info',
            children: (
                <Row gutter={24}>
                    <Col span={16}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSave}
                        >
                            <Title level={5} style={{ marginBottom: 16 }}>Overview</Title>
                            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                                Basic information, such as your name and address, that you use on the platform
                            </Typography.Text>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="First Name"
                                        name="firstName"
                                    >
                                        <Input placeholder="Enter first name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Last Name"
                                        name="lastName"
                                    >
                                        <Input placeholder="Enter last name" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Title"
                                        name="title"
                                    >
                                        <Input placeholder="Enter title" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Roles">
                                        <Select
                                            mode="multiple"
                                            value={user.roles.map(r => r.name)}
                                            disabled
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Status">
                                        <Input value={user.status} disabled />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="default"
                                    style={{ marginRight: 8 }}
                                    onClick={() => form.resetFields()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={updateMutation.isPending}
                                >
                                    Update
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={8}>
                        <div style={{ textAlign: 'center' }}>
                            <Typography.Text strong style={{ display: 'block', marginBottom: 16 }}>
                                Avatar
                            </Typography.Text>
                            <Avatar
                                size={120}
                                src={user.avatarUrl}
                                icon={!user.avatarUrl ? <UserOutlined /> : undefined}
                                style={{ marginBottom: 16 }}
                            />
                            <div>
                                <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                    Format: JPG, PNG, WebP (Max 5MB)
                                </Typography.Text>
                            </div>
                            <Upload
                                showUploadList={false}
                                beforeUpload={() => {
                                    message.info('Avatar upload will be implemented');
                                    return false;
                                }}
                            >
                                <Button icon={<UploadOutlined />} style={{ marginTop: 16 }}>
                                    Upload Avatar
                                </Button>
                            </Upload>
                        </div>
                    </Col>
                </Row>
            ),
        },
        {
            key: 'password',
            label: 'Password',
            children: (
                <Row gutter={24}>
                    <Col span={16}>
                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordChange}
                        >
                            <Title level={5} style={{ marginBottom: 16 }}>Change Password</Title>
                            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                                Update your password to keep your account secure
                            </Typography.Text>

                            <Form.Item
                                label="Current Password"
                                name="currentPassword"
                                rules={[{ required: true, message: 'Please enter your current password' }]}
                            >
                                <Input.Password placeholder="Enter current password" />
                            </Form.Item>

                            <Form.Item
                                label="New Password"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Please enter new password' },
                                    { min: 8, message: 'Password must be at least 8 characters' }
                                ]}
                            >
                                <Input.Password placeholder="Enter new password" />
                            </Form.Item>

                            <Form.Item
                                label="Confirm New Password"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Please confirm your password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Confirm new password" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="default"
                                    style={{ marginRight: 8 }}
                                    onClick={() => passwordForm.resetFields()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                >
                                    Change Password
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    User Profile
                </Title>
            </div>

            <Card style={{ width: '100%', background: '#fff' }}>
                <Tabs defaultActiveKey="info" items={tabItems} />
            </Card>
        </>
    );
};

export default UserProfilePage;

