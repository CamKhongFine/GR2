import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const UserManagementPage: React.FC = () => {
    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>User Management</Title>
            <Card>
                <p>User management functionality will be implemented here.</p>
                <p>This page will allow admins to manage users within their organization.</p>
            </Card>
        </div>
    );
};

export default UserManagementPage;
