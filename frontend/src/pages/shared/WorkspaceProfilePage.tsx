import React, { useEffect, useMemo } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    message,
    Spin,
    Tabs,
    Row,
    Col,
    Avatar,
    Upload,
    Tag,
    Select,
} from 'antd';
import {
    SaveOutlined,
    UserOutlined,
    UploadOutlined,
    CheckSquareOutlined,
    TeamOutlined,
    FolderOutlined,
    ProjectOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCurrentUser,
    updateCurrentUser,
    UserResponse,
    UpdateUserRequest,
} from '../../api/auth.api';
import { useUserStore } from '../../store/userStore';
import WorkspaceLayout, { SidebarItemConfig } from '../../layouts/WorkspaceLayout';

const { Title } = Typography;

interface WorkspaceProfilePageProps {
    workspaceType: 'division' | 'department' | 'staff';
}

const WORKSPACE_CONFIG = {
    division: {
        themeColor: 'blue' as const,
        gradient: 'from-blue-600 to-blue-700',
        sidebarItems: (_divisionName: string): SidebarItemConfig[] => [
            {
                key: 'division',
                icon: <ProjectOutlined />,
                label: 'Project',
                path: '/division/dashboard',
            },
            {
                key: 'my-tasks',
                icon: <CheckSquareOutlined />,
                label: 'My Task',
                path: '/division/my-tasks',
            },
        ],
        getHeaderName: (user: UserResponse | null) => user?.division?.name || 'Project',
    },
    department: {
        themeColor: 'green' as const,
        gradient: 'from-green-600 to-green-700',
        sidebarItems: (_departmentName: string): SidebarItemConfig[] => [
            {
                key: 'department',
                icon: <TeamOutlined />,
                label: 'Department',
                path: '/department/dashboard',
            },
            {
                key: 'my-tasks',
                icon: <CheckSquareOutlined />,
                label: 'My Task',
                path: '/department/my-tasks',
            },
            {
                key: 'division',
                icon: <ProjectOutlined />,
                label: 'Project',
                path: '/division/dashboard',
            },
        ],
        getHeaderName: (user: UserResponse | null) => user?.department?.name || 'Department',
    },
    staff: {
        themeColor: 'purple' as const,
        gradient: 'from-purple-600 to-purple-700',
        sidebarItems: (departmentName: string): SidebarItemConfig[] => [
            {
                key: 'workspace',
                icon: <FolderOutlined />,
                label: 'Workspace',
                path: '/staff/workspace',
            },
            {
                key: 'my-tasks',
                icon: <CheckSquareOutlined />,
                label: 'My Tasks',
                path: '/staff/my-tasks',
            },
            {
                key: 'department',
                icon: <TeamOutlined />,
                label: departmentName,
                path: '/department/dashboard',
            },
        ],
        getHeaderName: (user: UserResponse | null) => user?.department?.name || 'Workspace',
    },
};

const WorkspaceProfilePage: React.FC<WorkspaceProfilePageProps> = ({ workspaceType }) => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const queryClient = useQueryClient();

    // Use global user store
    const { user: storeUser, setUser } = useUserStore();

    // Get workspace config
    const config = WORKSPACE_CONFIG[workspaceType];
    const headerName = config.getHeaderName(storeUser);
    const departmentName = storeUser?.department?.name || 'Department';

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
            // Sync with global store
            setUser(updatedUser);
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
            await passwordForm.validateFields();
            message.info('Password change functionality will be implemented');
            passwordForm.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Sidebar items
    const sidebarItems = useMemo(() =>
        config.sidebarItems(departmentName),
        [config, departmentName]
    );

    // Left header content
    const leftHeaderContent = (
        <div className={`flex items-center gap-3 bg-gradient-to-r ${config.gradient} px-5 py-2.5 rounded-xl shadow-lg`}>
            <span className="font-bold text-white text-base">{headerName}</span>
        </div>
    );

    if (userLoading) {
        return (
            <WorkspaceLayout
                sidebarItems={sidebarItems}
                activeItem=""
                themeColor={config.themeColor}
                leftHeaderContent={leftHeaderContent}
            >
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spin size="large" />
                </div>
            </WorkspaceLayout>
        );
    }

    if (!user) {
        return (
            <WorkspaceLayout
                sidebarItems={sidebarItems}
                activeItem=""
                themeColor={config.themeColor}
                leftHeaderContent={leftHeaderContent}
            >
                <div>User not found</div>
            </WorkspaceLayout>
        );
    }

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
                                Basic information, such as your name and title, that you use on the platform
                            </Typography.Text>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="First Name" name="firstName">
                                        <Input placeholder="Enter first name" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Last Name" name="lastName">
                                        <Input placeholder="Enter last name" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Email" name="email">
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Title" name="title">
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

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Project">
                                        <Input
                                            value={user.division?.name || 'Not assigned'}
                                            disabled
                                            prefix={<ProjectOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Department">
                                        <Input
                                            value={user.department?.name || 'Not assigned'}
                                            disabled
                                            prefix={<TeamOutlined />}
                                        />
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
                    <Col span={8} style={{ marginTop: 50 }}>
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
                                <Button type="primary" htmlType="submit">
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
        <WorkspaceLayout
            sidebarItems={sidebarItems}
            activeItem=""
            themeColor={config.themeColor}
            leftHeaderContent={leftHeaderContent}
        >
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Title level={2} className="mb-2">User Profile</Title>
                    <div className="flex items-center gap-2">
                        {user.division && <Tag color="blue" icon={<ProjectOutlined />}>{user.division.name}</Tag>}
                        {user.department && <Tag color="green" icon={<TeamOutlined />}>{user.department.name}</Tag>}
                    </div>
                </div>

                <Card style={{ width: '100%', background: '#fff' }}>
                    <Tabs defaultActiveKey="info" items={tabItems} />
                </Card>
            </div>
        </WorkspaceLayout>
    );
};

export default WorkspaceProfilePage;
