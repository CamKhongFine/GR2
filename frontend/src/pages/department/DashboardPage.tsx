import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    FileTextOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

const DepartmentDashboardPage: React.FC = () => {
    // Mock statistics for department dashboard
    const mockStats = {
        totalMembers: 24,
        activeMembers: 21,
        completedTasks: 156,
        pendingReports: 8,
    };

    return (
        <>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    Department Dashboard
                </Title>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Members"
                            value={mockStats.totalMembers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Members"
                            value={mockStats.activeMembers}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Completed Tasks"
                            value={mockStats.completedTasks}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Reports"
                            value={mockStats.pendingReports}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col span={24}>
                    <Card title="Department Overview">
                        <p>Welcome to the Department Dashboard. Here you can manage your team, track performance, and generate reports.</p>
                        <p>Use the navigation menu to access team management and reporting features.</p>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default DepartmentDashboardPage;
