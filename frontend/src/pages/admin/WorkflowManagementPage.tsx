import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const WorkflowManagementPage: React.FC = () => {
    return (
        <div style={{ padding: '24px' }}>
            <Title level={3}>Workflow Management</Title>
            <Card>
                <p>Workflow management functionality will be implemented here.</p>
                <p>This page will allow admins to create and manage approval workflows.</p>
            </Card>
        </div>
    );
};

export default WorkflowManagementPage;