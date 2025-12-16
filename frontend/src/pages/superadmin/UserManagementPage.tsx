import React from 'react';
import {
    Breadcrumb,
    Card,
    Table,
    Space,
    Typography,
    Button,
    Tag,
    Avatar,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type UserRole = 'Admin' | 'User' | 'Manager';
type UserStatus = 'Active' | 'Inactive';

interface User {
    key: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    lastLogin: string;
}

const UserManagementPage: React.FC = () => {
    const users: User[] = [
        {
            key: '1',
            name: 'John Doe',
            email: 'john.doe@acmecorp.com',
            role: 'Admin',
            status: 'Active',
            lastLogin: '2024-12-16 14:30',
        },
        {
            key: '2',
            name: 'Jane Smith',
            email: 'jane.smith@globex.com',
            role: 'Manager',
            status: 'Active',
            lastLogin: '2024-12-16 09:15',
        },
        {
            key: '3',
            name: 'Bob Johnson',
            email: 'bob.j@innotech.com',
            role: 'User',
            status: 'Inactive',
            lastLogin: '2024-12-10 16:45',
        },
        {
            key: '4',
            name: 'Alice Williams',
            email: 'alice.w@acmecorp.com',
            role: 'User',
            status: 'Active',
            lastLogin: '2024-12-16 11:20',
        },
    ];

    const columns: ColumnsType<User> = [
        {
            title: 'User',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                        <div>{name}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.email}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: UserRole) => {
                const color = role === 'Admin' ? 'red' : role === 'Manager' ? 'blue' : 'default';
                return <Tag color={color}>{role}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: UserStatus) => (
                <Tag color={status === 'Active' ? 'green' : 'default'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" size="small">
                        Edit
                    </Button>
                    <Button type="link" size="small" danger>
                        {record.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    User Management
                </Title>
            </div>

            <Card
                title="User List"
                bordered={false}
                style={{ width: '100%', background: '#fff' }}
                extra={<Button type="primary">Add User</Button>}
            >
                <Table<User>
                    columns={columns}
                    dataSource={users}
                    pagination={{ pageSize: 10 }}
                    style={{ width: '100%' }}
                />
            </Card>
        </>
    );
};

export default UserManagementPage;
